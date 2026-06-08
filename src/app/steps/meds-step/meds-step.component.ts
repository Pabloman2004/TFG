import { Component, ChangeDetectionStrategy, OnInit, computed, signal, effect, inject, ViewChild, ElementRef } from '@angular/core';
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
import { ROUTES } from '../../app.routes.constants';
import { buildCriteriaText } from '../../core/clipboard-text';
import { groupBySystem, critCode, CritGroup } from '../../core/criteria-groups';
import { isMedGroupChecked } from '../../core/group-checked';
import { TooltipDirective } from '../../shared/tooltip.directive';

interface ForeignGroup extends DrugGroup {
  readonly originTabId: string;
  readonly originTabLabel: string;
}

interface GroupBuckets {
  readonly ownAll: readonly DrugGroup[];
  readonly foreignRelevant: readonly ForeignGroup[];
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

  private readonly esCollator = new Intl.Collator('es', { sensitivity: 'base' });

  readonly groupBuckets = computed<GroupBuckets>(() => {
    const activeId = this.activeCategoryId();

    if (activeId === this.OTROS_TAB_ID) {
      const drugs = this.categories.flatMap(cat =>
        cat.groups.filter(g => g.drugs.length === 1).flatMap(g => g.drugs),
      );
      if (drugs.length === 0) return { ownAll: [], foreignRelevant: [] };
      return {
        ownAll: [{
          id: 'otros',
          label: 'Otros medicamentos',
          drugs: drugs.slice().sort((a, b) => this.esCollator.compare(a, b)),
        }],
        foreignRelevant: [],
      };
    }

    const cat = this.activeCategory();
    const ownAll = (cat ? cat.groups.filter(g => g.drugs.length > 1) : [])
      .slice()
      .sort((a, b) => this.esCollator.compare(a.label, b.label));

    const rel = this.criteriaEngine.relevance();
    const relevantClasses = rel?.classesByTab.get(activeId) ?? new Set<string>();

    const ownClasses = new Set(
      ownAll.map(g => g.drugClass).filter((dc): dc is string => !!dc),
    );
    const seenForeign = new Set<string>();
    const foreignRelevant: ForeignGroup[] = [];
    for (const c of this.categories) {
      if (c.id === activeId) continue;
      for (const g of c.groups) {
        if (g.drugs.length <= 1 || !g.drugClass) continue;
        if (!relevantClasses.has(g.drugClass)) continue;
        if (ownClasses.has(g.drugClass)) continue;
        if (seenForeign.has(g.drugClass)) continue;
        seenForeign.add(g.drugClass);
        foreignRelevant.push({ ...g, originTabId: c.id, originTabLabel: c.label });
      }
    }
    foreignRelevant.sort((a, b) => this.esCollator.compare(a.label, b.label));

    return { ownAll, foreignRelevant };
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

  private groupsVisibleInTab(tabId: string): readonly DrugGroup[] {
    if (tabId === this.OTROS_TAB_ID) {
      const drugs = this.categories.flatMap(cat =>
        cat.groups.filter(g => g.drugs.length === 1).flatMap(g => g.drugs),
      );
      return drugs.length === 0 ? [] : [{ id: 'otros', label: 'Otros medicamentos', drugs }];
    }
    const cat = this.categories.find(c => c.id === tabId);
    const ownGroups = cat ? cat.groups.filter(g => g.drugs.length > 1) : [];
    const ownClasses = new Set(
      ownGroups.map(g => g.drugClass).filter((dc): dc is string => !!dc),
    );
    const rel = this.criteriaEngine.relevance();
    const relevantClasses = rel?.classesByTab.get(tabId) ?? new Set<string>();
    const seenForeign = new Set<string>();
    const foreignGroups: DrugGroup[] = [];
    for (const c of this.categories) {
      if (c.id === tabId) continue;
      for (const g of c.groups) {
        if (g.drugs.length <= 1 || !g.drugClass) continue;
        if (!relevantClasses.has(g.drugClass)) continue;
        if (ownClasses.has(g.drugClass)) continue;
        if (seenForeign.has(g.drugClass)) continue;
        seenForeign.add(g.drugClass);
        foreignGroups.push(g);
      }
    }
    return [...ownGroups, ...foreignGroups];
  }

  tabHasSelection(tabId: string): boolean {
    if (tabId === this.OTROS_TAB_ID) {
      const singleDrugs = new Set(
        this.categories.flatMap(c => c.groups.filter(g => g.drugs.length === 1).flatMap(g => g.drugs)),
      );
      return this.store.meds().some(m => singleDrugs.has(m.id));
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
      const singleDrugs = new Set(
        this.categories.flatMap(c => c.groups.filter(g => g.drugs.length === 1).flatMap(g => g.drugs)),
      );
      return meds.filter(m => singleDrugs.has(m.id)).length;
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
    this.updateExclusions();
  }

  private updateExclusions(): void {
    this.exclusions.set(
      this.criteriaEngine.getExcludedMedications(this.store.patientCase, this.criteria()),
    );
  }

  setCategory(id: string): void { this.store.activeSystemTab.set(id); }

  onTabSelectChange(event: Event): void {
    this.setCategory((event.target as HTMLSelectElement).value);
  }

  tabSelectLabel(tabId: string, label: string): string {
    const n = this.tabSelectionCount(tabId);
    if (n > 0) return `${label} (${n})`;
    if (this.isTabExplicitlyReviewed(tabId)) return `${label} ✓`;
    return label;
  }

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
