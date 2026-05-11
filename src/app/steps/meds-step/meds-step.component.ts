import { Component, ChangeDetectionStrategy, OnInit, computed, signal, effect, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuickGuideDialogComponent } from '../../quick-guide-dialog.component';
import { ConfirmResetDialogComponent } from '../../confirm-reset-dialog.component';

import { CaseStoreService } from '../../core/case-store.service';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { ReportService } from '../../core/report.service';
import { CaseIoService } from '../../core/case-io.service';
import { Med, Crit } from '../../core/types';
import { MEDICATIONS } from '../../core/data/medications';
import { DRUG_CATEGORIES, DrugCategory, DrugGroup } from '../../core/data/medications-taxonomy';
import { ROUTES } from '../../app.routes.constants';
import { buildCriteriaText } from '../../core/clipboard-text';
import { groupBySystem, critCode, CritGroup } from '../../core/criteria-groups';
import { isMedGroupChecked } from '../../core/group-checked';
import { TooltipDirective } from '../../shared/tooltip.directive';

const SCALES = [1, 1.15, 1.3] as const;
type Scale = (typeof SCALES)[number];
function currentScale(): Scale {
  const v = parseFloat(localStorage.getItem('font-scale') ?? '1');
  return (SCALES.includes(v as Scale) ? v : 1) as Scale;
}

@Component({
  selector: 'app-meds-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDialogModule, TooltipDirective],
  templateUrl: './meds-step.component.html',
  styleUrl: './meds-step.component.css',
})
export class MedsStepComponent implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);
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
  readonly exclusions = signal<Map<string, Crit>>(new Map());
  readonly lastCriterionId = signal<string | null>(null);
  private previousCriteriaIds = new Set<string>();

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

  readonly criteriaGroups = computed<CritGroup[]>(() =>
    groupBySystem(this.applicableCriteria()),
  );

  readonly startGroups = computed<CritGroup[]>(() => groupBySystem(this.startCriteria()));
  readonly stoppGroups = computed<CritGroup[]>(() => groupBySystem(this.stoppCriteria()));

  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  readonly critCode = critCode;

  readonly criteriaClasses = computed<Set<string>>(() =>
    this.extractInDrugClasses(this.criteria()),
  );

  readonly effectiveGroups = computed<DrugGroup[]>(() => {
    if (this.activeCategoryId() === this.OTROS_TAB_ID) {
      const drugs = this.categories.flatMap(cat =>
        cat.groups.filter(g => g.drugs.length === 1).flatMap(g => g.drugs),
      );
      return drugs.length === 0 ? [] : [{ id: 'otros', label: 'Otros medicamentos', drugs }];
    }
    const activeId = this.activeCategoryId();
    const cat = this.activeCategory();
    const primaryGroups = cat ? cat.groups.filter(g => g.drugs.length > 1) : [];
    const crossGroups = this.categories
      .filter(c => c.id !== activeId)
      .flatMap(c => c.groups.filter(g =>
        g.drugs.length > 1 && g.additionalCategories?.includes(activeId),
      ));
    return [...primaryGroups, ...crossGroups];
  });

  constructor(
    private router: Router,
    private criteriaEngine: CriteriaEngineService,
    private report: ReportService,
    private caseIo: CaseIoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    effect(() => {
      this.store.meds();
      this.store.diagnoses();
      this.store.labs();
      this.updateExclusions();
    });
    effect(() => {
      const current = this.applicableCriteria();
      const currentIds = new Set(current.map(c => c.id));
      const newIds = [...currentIds].filter(id => !this.previousCriteriaIds.has(id));
      if (newIds.length > 0) {
        this.lastCriterionId.set(newIds[newIds.length - 1]);
      } else if (current.length === 0) {
        this.lastCriterionId.set(null);
      }
      this.previousCriteriaIds = currentIds;
    }, { allowSignalWrites: true });

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

  tabHasSelection(tabId: string): boolean {
    if (tabId === this.OTROS_TAB_ID) {
      const singleDrugs = new Set(
        this.categories.flatMap(c => c.groups.filter(g => g.drugs.length === 1).flatMap(g => g.drugs)),
      );
      return this.store.meds().some(m => singleDrugs.has(m.id));
    }
    const cat = this.categories.find(c => c.id === tabId);
    const primaryGroups = cat ? cat.groups.filter(g => g.drugs.length > 1) : [];
    const crossGroups = this.categories
      .filter(c => c.id !== tabId)
      .flatMap(c => c.groups.filter(g =>
        g.drugs.length > 1 && g.additionalCategories?.includes(tabId),
      ));
    return [...primaryGroups, ...crossGroups].some(g => this.groupHasAnySelection(g));
  }

  /** Devuelve la etiqueta de la categoría primaria si el grupo es una referencia cruzada en el tab activo. */
  getCrossListInfo(group: DrugGroup): string | null {
    const activeId = this.activeCategoryId();
    if (!group.additionalCategories?.includes(activeId)) return null;
    const primaryCat = this.categories.find(c => c.groups.includes(group));
    return primaryCat?.label ?? null;
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

  async ngOnInit(): Promise<void> {
    this.applyScale(currentScale());
    const loaded = await this.criteriaEngine.loadCriteria();
    this.criteria.set(loaded);
    this.updateExclusions();
  }

  private updateExclusions(): void {
    this.exclusions.set(
      this.criteriaEngine.getExcludedMedications(this.store.patientCase, this.criteria()),
    );
  }

  setCategory(id: string): void { this.store.activeSystemTab.set(id); }

  isSelected(name: string): boolean { return this.selectedNames().has(name); }

  excludedBy(name: string): Crit | null {
    return this.exclusions().get(name.toLowerCase()) ?? null;
  }

  toggleDrug(name: string): void {
    const current = this.store.meds();
    if (this.isSelected(name)) {
      this.store.meds.set(current.filter(m => m.id !== name));
      return;
    }
    const found = MEDICATIONS.find(m => m.id === name);
    const med: Med = found ?? { id: name, drugClasses: [] };
    this.store.meds.set([...current, med]);
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

  increaseScale(): void {
    const idx = SCALES.indexOf(currentScale());
    if (idx < SCALES.length - 1) this.applyScale(SCALES[idx + 1]);
  }

  decreaseScale(): void {
    const idx = SCALES.indexOf(currentScale());
    if (idx > 0) this.applyScale(SCALES[idx - 1]);
  }

  private applyScale(s: Scale): void {
    const v = String(s);
    document.documentElement.style.setProperty('--font-scale', v);
    this.el.nativeElement.style.setProperty('--font-scale', v);
    localStorage.setItem('font-scale', v);
  }

  openQuickGuide(): void {
    this.dialog.open(QuickGuideDialogComponent, { width: '480px', panelClass: 'rounded-xl' });
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
    const patient = this.store.patientCase;
    const criteria = await this.criteriaEngine.loadCriteria();
    const results = this.criteriaEngine.evaluate(patient, criteria);
    this.report.exportCase({
      patient: this.store.patient(),
      diagnoses: this.store.diagnoses(),
      meds: this.store.meds(),
      results,
    });
  }

  readonly copied = signal(false);

  async copyCriteria(): Promise<void> {
    const text = buildCriteriaText(this.applicableCriteria());
    await navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
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
