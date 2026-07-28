// @linked docs/flujo-pasos.md
// Si cambias la lógica de groupBuckets, groupsVisibleInTab, tabs revisados o ítems "Otro", actualiza el doc enlazado.
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, computed, signal, effect, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuickGuideDialogComponent } from '../../quick-guide-dialog.component';
import { ConfirmResetDialogComponent } from '../../confirm-reset-dialog.component';
import { DisplayOptionsDialogComponent } from '../../display-options-dialog.component';

import { CaseStoreService } from '../../core/case-store.service';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { ReportService } from '../../core/report.service';
import { CaseIoService } from '../../core/case-io.service';
import { Med, Crit } from '../../core/types';
import { MEDICATIONS } from '../../core/data/medications';
import { DRUG_CATEGORIES, DrugCategory, DrugGroup } from '../../core/data/medications-taxonomy';
import { DIAGNOSIS_MAP } from '../../core/data/diagnoses';
import { ROUTES } from '../../app.routes.constants';
import { buildCriteriaText } from '../../core/clipboard-text';
import { groupBySystem, critCode, CritGroup } from '../../core/criteria-groups';
import { isMedGroupChecked } from '../../core/group-checked';
import { computeMedGroupBuckets, medGroupsVisibleInTab, MedGroupBuckets, MedForeignGroup } from '../../core/group-visibility';
import {
  resolveForeignHighlight,
  foreignLinksByOwnGroup,
  relatedSelectionLinks,
  mergeLinkMaps,
} from '../../core/foreign-provenance';
import { TooltipDirective } from '../../shared/tooltip.directive';

const HIGHLIGHT_MS = 8000;

const DX_LABELS_BY_CODE: ReadonlyMap<string, string> = new Map(
  Object.entries(DIAGNOSIS_MAP).map(([label, code]) => [code, label]),
);

@Component({
  selector: 'app-meds-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDialogModule, TooltipDirective],
  templateUrl: './meds-step.component.html',
  styleUrl: './meds-step.component.css',
})
export class MedsStepComponent implements OnInit, OnDestroy {
  readonly store = inject(CaseStoreService);
  readonly categories = DRUG_CATEGORIES;
  readonly OTROS_TAB_ID = 'otros';
  readonly allCategoryTabs: readonly { id: string; label: string; fullName?: string }[] = [
    ...DRUG_CATEGORIES,
    { id: 'otros', label: 'Otros' },
  ];
  readonly activeCategoryId = computed<string>(() => {
    const id = this.store.activeSystemTab();
    return this.allCategoryTabs.some(t => t.id === id) ? id : (DRUG_CATEGORIES[0]?.id ?? 'cardiovascular');
  });
  readonly criteria = signal<Crit[]>([]);

  readonly selectedNames = computed<Set<string>>(
    () => new Set(this.store.meds().map(m => m.id)),
  );

  readonly activeCategory = computed<DrugCategory | undefined>(() =>
    this.categories.find(c => c.id === this.activeCategoryId()),
  );

  readonly applicableCriteria = computed<Crit[]>(() => {
    const crits = this.criteria();
    if (!crits.length) return [];
    this.store.meds();
    this.store.diagnoses();
    this.store.labs();
    return this.criteriaEngine.evaluate(this.store.patientCase, crits);
  });

  readonly stoppCriteria = computed(() =>
    this.applicableCriteria().filter(c => c.type === 'STOPP'),
  );

  readonly startCriteria = computed(() =>
    this.applicableCriteria().filter(c => c.type === 'START'),
  );

  readonly startGroups = computed<CritGroup[]>(() => groupBySystem(this.startCriteria()));
  readonly stoppGroups = computed<CritGroup[]>(() => groupBySystem(this.stoppCriteria()));

  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  readonly critCode = critCode;

  readonly criteriaClasses = computed<Set<string>>(() =>
    this.extractInDrugClasses(this.criteria()),
  );

  readonly groupBuckets = computed<MedGroupBuckets>(() =>
    computeMedGroupBuckets(
      this.activeCategoryId(),
      this.categories,
      this.criteriaEngine.relevance(),
      this.OTROS_TAB_ID,
      MEDICATIONS,
    ),
  );

  readonly highlightedGroupIds = signal<ReadonlySet<string>>(new Set());
  readonly highlightedCriterionIds = signal<ReadonlySet<string>>(new Set());
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

  // Enlaces persistentes: mientras un fármaco foráneo siga marcado, el grupo
  // propio con el que se relaciona lo muestra en su cabecera. Así se ve que dos
  // casillas distintas de «Relevantes de otros sistemas» apuntan al mismo grupo.
  readonly foreignLinks = computed(() => {
    const buckets = this.groupBuckets();
    const relevance = this.criteriaEngine.relevance();
    const sameTab = foreignLinksByOwnGroup({
      selectedDrugIds: this.store.meds().map(m => m.id),
      tabId: this.activeCategoryId(),
      relevance,
      categories: this.categories,
      medications: MEDICATIONS,
      ownGroups: buckets.ownAll,
      foreignGroups: buckets.foreignRelevant,
    });
    // Enlaces que cruzan paso o pestaña: diagnósticos ya marcados en el paso 2
    // (o fármacos de otras pestañas) que esperan a un grupo de esta.
    const crossStep = relatedSelectionLinks({
      relevance,
      selectedMedications: this.store.meds(),
      selectedDiagnoses: this.store.diagnoses().map(code => DX_LABELS_BY_CODE.get(code) ?? code),
      // Se cuentan la clase del grupo y las de sus miembros: un diagnóstico como
      // «Intervalo QTc prolongado» no apunta a ningún grupo llamado así, pero sí
      // a los grupos que contienen fármacos prolongadores del QTc.
      targets: buckets.ownAll.map(group => ({
        key: group.id,
        drugClasses: [...new Set([
          ...(group.drugClass ? [group.drugClass] : []),
          ...group.drugs.flatMap(id => MEDICATIONS.find(m => m.id === id)?.drugClasses ?? []),
        ])],
      })),
    });
    return mergeLinkMaps(sameTab, crossStep);
  });

  constructor(
    private router: Router,
    private criteriaEngine: CriteriaEngineService,
    private report: ReportService,
    private caseIo: CaseIoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    // Si un tab tiene selección, el flag "revisado explícito" es redundante:
    // lo limpiamos para evitar estados inconsistentes en el JSON exportado.
    effect(() => {
      this.store.meds();
      for (const tab of this.allCategoryTabs) {
        if (this.store.isMedTabReviewed(tab.id) && this.tabHasSelection(tab.id)) {
          this.store.clearMedTabReviewed(tab.id);
        }
      }
    }, { allowSignalWrites: true });
  }

  private groupsVisibleInTab(tabId: string): readonly DrugGroup[] {
    return medGroupsVisibleInTab(
      tabId,
      this.categories,
      this.criteriaEngine.relevance(),
      this.OTROS_TAB_ID,
      MEDICATIONS,
    );
  }

  tabHasSelection(tabId: string): boolean {
    if (tabId === this.OTROS_TAB_ID) {
      const otrosDrugs = new Set(this.groupsVisibleInTab(this.OTROS_TAB_ID).flatMap(g => g.drugs));
      return this.store.meds().some(m => otrosDrugs.has(m.id));
    }
    return this.groupsVisibleInTab(tabId).some(g => this.groupHasAnySelection(g));
  }

  isReviewedDisabled(tabId: string): boolean {
    return this.tabHasSelection(tabId);
  }

  isReviewedChecked(tabId: string): boolean {
    return this.store.isMedTabReviewed(tabId);
  }

  toggleReviewed(tabId: string): void {
    if (this.isReviewedDisabled(tabId)) return;
    this.store.toggleMedTabReviewed(tabId);
  }

  isTabExplicitlyReviewed(tabId: string): boolean {
    return this.store.isMedTabReviewed(tabId) && !this.tabHasSelection(tabId);
  }

  tabSelectionCount(tabId: string): number {
    const meds = this.store.meds();
    if (tabId === this.OTROS_TAB_ID) {
      const otrosDrugs = new Set(this.groupsVisibleInTab(this.OTROS_TAB_ID).flatMap(g => g.drugs));
      return meds.filter(m => otrosDrugs.has(m.id)).length;
    }
    const groups = this.groupsVisibleInTab(tabId);
    const counted = new Set<string>();
    for (const g of groups) {
      const knownDrugs = new Set(g.drugs);
      for (const m of meds) {
        if (counted.has(m.id)) continue;
        if (knownDrugs.has(m.id)) { counted.add(m.id); continue; }
        if (m.id === `otro__${g.id}`) { counted.add(m.id); continue; }
        if (g.drugClass && m.drugClasses.includes(g.drugClass) && !m.id.startsWith('otro__')) {
          counted.add(m.id);
        }
      }
    }
    return counted.size;
  }

  async ngOnInit(): Promise<void> {
    const loaded = await this.criteriaEngine.loadCriteria();
    this.criteria.set(loaded);
  }

  ngOnDestroy(): void {
    this.clearHighlightTimer();
  }

  isGroupHighlighted(group: DrugGroup): boolean {
    return this.highlightedGroupIds().has(group.id);
  }

  /** Fármacos foráneos seleccionados que apuntan a este grupo propio. */
  linkedForeignDrugs(group: DrugGroup): readonly string[] {
    return this.foreignLinks().get(group.id) ?? [];
  }

  linkedForeignTooltip(group: DrugGroup): string {
    const items = this.linkedForeignDrugs(group);
    if (items.length === 0) return '';
    const medIds = new Set(this.store.meds().map(m => m.id));
    const described = items.map(name =>
      medIds.has(name) ? `${name} (medicamento)` : `${name} (diagnóstico)`,
    );
    return items.length === 1
      ? `Ya has marcado ${described[0]} y se relaciona con este grupo`
      : `${items.length} elementos ya marcados se relacionan con este grupo: ${described.join(', ')}`;
  }

  isCriterionHighlighted(c: Crit): boolean {
    return this.highlightedCriterionIds().has(c.id);
  }

  private clearHighlightTimer(): void {
    if (this.highlightTimer !== null) {
      clearTimeout(this.highlightTimer);
      this.highlightTimer = null;
    }
  }

  private clearHighlights(): void {
    this.clearHighlightTimer();
    this.highlightedGroupIds.set(new Set());
    this.highlightedCriterionIds.set(new Set());
  }

  private scheduleHighlightClear(): void {
    this.clearHighlightTimer();
    this.highlightTimer = setTimeout(() => {
      this.highlightedGroupIds.set(new Set());
      this.highlightedCriterionIds.set(new Set());
      this.highlightTimer = null;
    }, HIGHLIGHT_MS);
  }

  private maybeHighlightForeignDrug(drugId: string): void {
    const buckets = this.groupBuckets();
    const isForeign = buckets.foreignRelevant.some(g => g.drugs.includes(drugId));
    if (!isForeign) return;

    const criteriaById = new Map(this.criteria().map(c => [c.id, c]));
    const result = resolveForeignHighlight({
      drugId,
      tabId: this.activeCategoryId(),
      relevance: this.criteriaEngine.relevance(),
      categories: this.categories,
      medications: MEDICATIONS,
      ownGroups: buckets.ownAll,
      applicableCriterionIds: new Set(this.applicableCriteria().map(c => c.id)),
      selectedDiagnoses: this.store.diagnoses(),
      selectedMedications: this.store.meds(),
      criteriaById,
      dxLabelsByCode: DX_LABELS_BY_CODE,
    });

    this.highlightedGroupIds.set(new Set(result.groupIds));
    this.highlightedCriterionIds.set(new Set(result.criterionIds));
    if (result.snackMessage) {
      this.snackBar.open(result.snackMessage, 'Entendido', {
        duration: HIGHLIGHT_MS,
        panelClass: 'snack-relacion',
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
    if (result.groupIds.length > 0 || result.criterionIds.length > 0) {
      this.scheduleHighlightClear();
    } else {
      this.clearHighlightTimer();
    }
  }

  setCategory(id: string): void { this.store.activeSystemTab.set(id); }

  onTabSelectChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) this.setCategory(target.value);
  }

  onReviewedChange(tabId: string, event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (this.isReviewedDisabled(tabId)) {
      input.checked = this.isReviewedChecked(tabId);
      return;
    }
    if (input.checked !== this.isReviewedChecked(tabId)) {
      this.toggleReviewed(tabId);
    }
  }

  tabSelectLabel(tabId: string, label: string): string {
    const n = this.tabSelectionCount(tabId);
    if (n > 0) return `${label} (${n})`;
    if (this.isTabExplicitlyReviewed(tabId)) return `${label} ✓`;
    return label;
  }

  isSelected(name: string): boolean { return this.selectedNames().has(name); }

  toggleDrug(name: string): void {
    const current = this.store.meds();
    if (this.isSelected(name)) {
      this.clearHighlights();
      this.store.meds.set(current.filter(m => m.id !== name));
      return;
    }
    const found = MEDICATIONS.find(m => m.id === name);
    const med: Med = found ?? { id: name, drugClasses: [] };
    this.store.meds.set([...current, med]);
    this.maybeHighlightForeignDrug(name);
  }

  customDrugsFor(group: DrugGroup): Med[] {
    if (!group.drugClass) return [];
    const dc = group.drugClass;
    const knownSet = new Set(group.drugs);
    return this.store.meds().filter(m =>
      m.drugClasses.includes(dc) && !knownSet.has(m.id) && !m.id.startsWith('otro__')
    );
  }

  /** Id del medicamento genérico "Otro" para un grupo */
  private otroId(group: DrugGroup): string {
    return `otro__${group.id}`;
  }

  isOtroSelected(group: DrugGroup): boolean {
    return this.isSelected(this.otroId(group));
  }

  toggleOtro(group: DrugGroup): void {
    const id = this.otroId(group);
    const current = this.store.meds();
    if (this.isSelected(id)) {
      this.store.meds.set(current.filter(m => m.id !== id));
      return;
    }
    const med: Med = { id, drugClasses: group.drugClass ? [group.drugClass] : [] };
    this.store.meds.set([...current, med]);
  }

  removeMed(name: string): void {
    this.store.meds.set(this.store.meds().filter(m => m.id !== name));
  }

  isGroupChecked(group: DrugGroup): boolean {
    return isMedGroupChecked(group, this.store.meds());
  }

  groupSelectionCount(group: DrugGroup): number {
    const meds = this.store.meds();
    const knownDrugs = new Set(group.drugs);
    let count = meds.filter(m => knownDrugs.has(m.id)).length;
    if (meds.some(m => m.id === `otro__${group.id}`)) count++;
    count += this.customDrugsFor(group).length;
    return count;
  }

  groupHasAnySelection(group: DrugGroup): boolean {
    return this.isGroupChecked(group);
  }

  showOtroFor(group: DrugGroup): boolean {
    return !!group.drugClass && this.criteriaClasses().has(group.drugClass.toUpperCase());
  }

  private extractInDrugClasses(criteria: Crit[]): Set<string> {
    const classes = new Set<string>();
    const walk = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      const obj = node as Record<string, unknown>;
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'inDrugClass' && Array.isArray(v) && typeof v[0] === 'string') {
          classes.add((v[0] as string).toUpperCase());
        } else {
          walk(v);
        }
      }
    };
    criteria.forEach(c => c.logic && walk(c.logic));
    return classes;
  }

  saveCase(): void { this.caseIo.exportCase(); }

  openFilePicker(): void { this.fileInputRef.nativeElement.click(); }

  async onFileLoad(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await this.caseIo.importFile(file);
      this.snackBar.open('Caso cargado correctamente.', 'OK', { duration: 3000 });
    } catch (err) {
      this.snackBar.open(
        err instanceof Error ? err.message : 'Error al cargar el archivo.',
        'Cerrar', { duration: 6000 },
      );
    } finally {
      (event.target as HTMLInputElement).value = '';
    }
  }

  openQuickGuide(): void {
    this.dialog.open(QuickGuideDialogComponent, { width: '480px', panelClass: 'rounded-xl' });
  }

  openDisplayOptions(): void {
    this.dialog.open(DisplayOptionsDialogComponent, { width: '420px', panelClass: 'rounded-xl' });
  }

  resetCase(): void {
    this.dialog.open(ConfirmResetDialogComponent, { width: '360px', panelClass: 'rounded-xl' })
      .afterClosed()
      .subscribe(confirmed => { if (confirmed) this.store.reset(); });
  }

  navigateNext(): void {
    this.router.navigate([ROUTES.DIAGNOSTICOS]);
  }

  async onExportPdf(): Promise<void> {
    try {
      const patient = this.store.patientCase;
      const criteria = await this.criteriaEngine.loadCriteria();
      const results = this.criteriaEngine.evaluate(patient, criteria);
      await this.report.exportCase({
        patient: this.store.patient(),
        diagnoses: this.store.diagnoses(),
        meds: this.store.meds(),
        results,
      });
    } catch (err) {
      this.snackBar.open(
        err instanceof Error ? err.message : 'Error al exportar el PDF.',
        'Cerrar', { duration: 6000 },
      );
    }
  }

  readonly copied = signal(false);

  async copyCriteria(): Promise<void> {
    const text = buildCriteriaText(this.applicableCriteria());
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch (err) {
      this.snackBar.open(
        err instanceof Error ? err.message : 'No se pudo copiar al portapapeles.',
        'Cerrar', { duration: 6000 },
      );
    }
  }

  toggleSection(system: string): void {
    const current = this.store.collapsedSections();
    const next = current.includes(system)
      ? current.filter(s => s !== system)
      : [...current, system];
    this.store.collapsedSections.set(next);
  }

  isSectionCollapsed(system: string): boolean {
    return this.store.collapsedSections().includes(system);
  }

  trackCat = (_: number, c: DrugCategory): string => c.id;
  trackGroup = (_: number, g: DrugGroup): string => g.id;
  trackDrug = (_: number, name: string): string => name;
  trackCrit = (_: number, c: Crit): string => c.id;
}
