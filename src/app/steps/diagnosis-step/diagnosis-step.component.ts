// @linked docs/flujo-pasos.md
// Si cambias la lógica de groupBuckets, dxGroupsVisibleInTab, tabs revisados, dependencias de diagnósticos, ítems "Otro" o el resaltado del último lote de criterios, actualiza el doc enlazado.
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, computed, signal, effect, inject, ViewChild, ElementRef, Injector, afterNextRender, untracked } from '@angular/core';
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
import { DisplaySettingsService } from '../../core/display-settings.service';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { ReportService } from '../../core/report.service';
import { CaseIoService } from '../../core/case-io.service';
import { Crit, Labs } from '../../core/types';
import { MEDICATIONS } from '../../core/data/medications';
import { LabKey, labCaptureFields } from '../../core/lab-capture';

import { normalizeDiagnosis, DIAGNOSIS_REVERSE_MAP, DIAGNOSIS_MAP } from '../../core/data/diagnoses';
import { applyMutex } from '../../core/data/diagnosis-variants';
import { partitionGroupDiagnoses, VariantFamilyView } from '../../core/data/diagnosis-variant-view';
import { DIAGNOSIS_TABS, DiagnosisTab, DiagnosisGroup } from '../../core/data/diagnoses-taxonomy';
import { dxTooltip, isDiagnosisEnabled } from '../../core/data/dx-dependencies';
import { ROUTES } from '../../app.routes.constants';
import { buildCriteriaText } from '../../core/clipboard-text';
import { groupBySystem, critCode, CritGroup } from '../../core/criteria-groups';
import { isDxGroupChecked } from '../../core/group-checked';
import { computeDxGroupBuckets, dxGroupsVisibleInTab, DxGroupBuckets } from '../../core/group-visibility';
import {
  resolveForeignDxHighlight,
  foreignLinksByOwnDx,
  relatedSelectionLinks,
  mergeLinkMaps,
} from '../../core/foreign-provenance';
import { LinkBadgeComponent } from '../../shared/link-badge.component';
import {
  detectNewlyAddedCriteria,
  remainingCollapsedSections,
  scrollCriteriaIntoView,
} from '../../core/new-criteria';

const HIGHLIGHT_MS = 8000;

const DX_LABELS_BY_CODE: ReadonlyMap<string, string> = new Map(
  Object.entries(DIAGNOSIS_MAP).map(([label, code]) => [code, label]),
);

const emptyLabs = (): Labs => ({
  egfr_ml_min_173: null,
  tsh_uUl: null,
  fc_lpm: null,
  qtc_ms: null,
  potasio_mmol_l: null,
  sodio_mmol_l: null,
  calcio_corregido_mmol_l: null,
  pas_mmhg: null,
  pad_mmhg: null,
});

@Component({
  selector: 'app-diagnosis-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDialogModule, LinkBadgeComponent],
  templateUrl: './diagnosis-step.component.html',
  styleUrls: ['./diagnosis-step.component.css'],
})
export class DiagnosisStepComponent implements OnInit, OnDestroy {
  readonly store = inject(CaseStoreService);
  private readonly displaySettings = inject(DisplaySettingsService);
  readonly tabsVertical = computed<boolean>(
    () => this.displaySettings.tabsOrientation() === 'vertical',
  );
  readonly tabs = DIAGNOSIS_TABS;
  readonly OTROS_TAB_ID = 'otros';
  readonly activeTabId = computed<string>(() => {
    const id = this.store.activeSystemTab();
    return this.tabs.some(t => t.id === id) ? id : (DIAGNOSIS_TABS[0]?.id ?? 'cardiovascular');
  });
  readonly criteria = signal<Crit[]>([]);

  readonly activeTab = computed<DiagnosisTab>(
    () => this.tabs.find(t => t.id === this.activeTabId()) ?? this.tabs[0],
  );

  readonly selectedCodes = computed<Set<string>>(
    () => new Set(this.store.diagnoses()),
  );

  readonly selectedMedIds = computed<ReadonlySet<string>>(
    () => new Set(this.store.meds().map(m => m.id)),
  );

  readonly applicableCriteria = computed<Crit[]>(() => {
    const crits = this.criteria();
    if (!crits.length) return [];
    this.store.diagnoses();
    this.store.meds();
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

  readonly groupBuckets = computed<DxGroupBuckets>(() =>
    computeDxGroupBuckets(this.activeTab(), this.tabs, this.criteriaEngine.relevance()),
  );

  // Panel fijo de analítica/constantes: siempre ofrece todos los campos que algún
  // criterio puede leer. Vive en la pestaña «Otros» porque muchos criterios START
  // (p. ej. B1: PAS/PAD) dependen de constantes de cribado que ninguna selección
  // "activa", así que no pueden condicionarse a un medicamento o diagnóstico.
  readonly labCaptureFields = computed(() => labCaptureFields(this.store.labs()));

  readonly highlightedDxLabels = signal<ReadonlySet<string>>(new Set());
  readonly highlightedCriterionIds = signal<ReadonlySet<string>>(new Set());
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

  readonly newlyAddedCriterionIds = signal<ReadonlySet<string>>(new Set());
  private previousCriteriaIds: ReadonlySet<string> = new Set();
  private criteriaPrimed = false;
  private highlightedNewIds: ReadonlySet<string> = new Set();
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  // Enlaces persistentes: ver `foreignLinks` en MedsStepComponent.
  readonly foreignLinks = computed(() => {
    const buckets = this.groupBuckets();
    const relevance = this.criteriaEngine.relevance();
    const selectedDxLabels = this.store.diagnoses().map(code => DX_LABELS_BY_CODE.get(code) ?? code);
    const sameTab = foreignLinksByOwnDx({
      selectedDxLabels,
      tabId: this.activeTabId(),
      relevance,
      ownGroups: buckets.ownGroups,
      foreignGroups: buckets.foreignRelevant,
    });
    // Enlaces que cruzan de paso: medicamentos ya marcados en el paso 1 que
    // esperan a un diagnóstico de esta pestaña (p. ej. Ondansetrón → QTc).
    const crossStep = relatedSelectionLinks({
      relevance,
      selectedMedications: this.store.meds(),
      selectedDiagnoses: selectedDxLabels,
      // Igual que en medicamentos: también los diagnósticos foráneos, para que
      // marcar uno propio señale el de otro sistema que lo acompaña.
      targets: [...buckets.ownGroups, ...buckets.foreignRelevant].flatMap(group =>
        group.diagnoses.map(dx => ({ key: dx, dxCodes: [normalizeDiagnosis(dx)] })),
      ),
    });
    return mergeLinkMaps(sameTab, crossStep);
  });

  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  readonly critCode = critCode;

  constructor(
    private router: Router,
    private criteriaEngine: CriteriaEngineService,
    private report: ReportService,
    private caseIo: CaseIoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    effect(() => {
      const meds = this.store.meds();
      const diagnoses = this.store.diagnoses();
      const filtered = diagnoses.filter(code => {
        const label = DIAGNOSIS_REVERSE_MAP[code];
        if (label === undefined) return true;
        return isDiagnosisEnabled(label, meds, this.criteriaEngine.dxDependencies());
      });
      if (filtered.length !== diagnoses.length) {
        this.store.diagnoses.set(filtered);
      }
    }, { allowSignalWrites: true });

    // Si un tab tiene selección, el flag "revisado explícito" es redundante:
    // lo limpiamos para evitar estados inconsistentes en el JSON exportado.
    effect(() => {
      this.store.diagnoses();
      for (const tab of this.tabs) {
        if (this.store.isDxTabReviewed(tab.id) && this.tabHasSelection(tab)) {
          this.store.clearDxTabReviewed(tab.id);
        }
      }
    }, { allowSignalWrites: true });

    effect(() => this.syncNewlyAddedCriteria(), { allowSignalWrites: true });
  }

  isDxEnabled(label: string): boolean {
    return isDiagnosisEnabled(label, this.store.meds(), this.criteriaEngine.dxDependencies());
  }

  dxTooltip(label: string): string {
    return dxTooltip(label, this.criteriaEngine.dxDependencies());
  }

  isReviewedDisabled(tab: DiagnosisTab): boolean {
    return this.tabHasSelection(tab);
  }

  isReviewedChecked(tab: DiagnosisTab): boolean {
    return this.store.isDxTabReviewed(tab.id);
  }

  toggleReviewed(tab: DiagnosisTab): void {
    if (this.isReviewedDisabled(tab)) return;
    this.store.toggleDxTabReviewed(tab.id);
  }

  isTabExplicitlyReviewed(tab: DiagnosisTab): boolean {
    return this.store.isDxTabReviewed(tab.id) && !this.tabHasSelection(tab);
  }

  private dxGroupsVisibleInTab(tab: DiagnosisTab): readonly DiagnosisGroup[] {
    return dxGroupsVisibleInTab(tab, this.tabs, this.criteriaEngine.relevance());
  }

  tabSelectionCount(tab: DiagnosisTab): number {
    const sel = this.selectedCodes();
    let count = 0;
    for (const g of this.dxGroupsVisibleInTab(tab)) {
      for (const d of g.diagnoses) {
        if (sel.has(normalizeDiagnosis(d))) count++;
      }
      if (!g.id.startsWith('foreign__')) {
        if (this.isOtroDxSelected(g)) count++;
        count += this.customDxFor(g).length;
      }
    }
    return count;
  }

  async ngOnInit(): Promise<void> {
    const loaded = await this.criteriaEngine.loadCriteria();
    this.criteria.set(loaded);
  }

  ngOnDestroy(): void {
    this.clearHighlightTimer();
  }

  isDxHighlighted(label: string): boolean {
    return this.highlightedDxLabels().has(label);
  }

  /** Diagnósticos foráneos seleccionados que apuntan a este diagnóstico propio. */
  linkedForeignDxs(label: string): readonly string[] {
    return this.foreignLinks().get(label) ?? [];
  }

  isCriterionHighlighted(c: Crit): boolean {
    return this.highlightedCriterionIds().has(c.id);
  }

  isNewlyAdded(c: Crit): boolean {
    return this.newlyAddedCriterionIds().has(c.id);
  }

  private syncNewlyAddedCriteria(): void {
    const current = this.applicableCriteria();
    const result = detectNewlyAddedCriteria({
      previousIds: this.previousCriteriaIds,
      currentIds: current.map(c => c.id),
      primed: this.criteriaPrimed,
      catalogReady: this.criteria().length > 0,
      currentlyHighlighted: this.highlightedNewIds,
    });
    this.previousCriteriaIds = result.nextPrevious;
    this.criteriaPrimed = result.primed;
    this.highlightedNewIds = new Set(result.highlightIds);
    this.newlyAddedCriterionIds.set(this.highlightedNewIds);
    if (!result.shouldScroll) return;
    untracked(() => {
      const highlighted = current.filter(c => this.highlightedNewIds.has(c.id));
      const collapsed = this.store.collapsedSections();
      const nextCollapsed = remainingCollapsedSections(collapsed, highlighted);
      if (nextCollapsed.length !== collapsed.length) {
        this.store.collapsedSections.set(nextCollapsed);
      }
      afterNextRender(() => {
        scrollCriteriaIntoView(this.host.nativeElement, result.highlightIds);
      }, { injector: this.injector });
    });
  }

  private clearHighlightTimer(): void {
    if (this.highlightTimer !== null) {
      clearTimeout(this.highlightTimer);
      this.highlightTimer = null;
    }
  }

  private clearHighlights(): void {
    this.clearHighlightTimer();
    this.highlightedDxLabels.set(new Set());
    this.highlightedCriterionIds.set(new Set());
  }

  private scheduleHighlightClear(): void {
    this.clearHighlightTimer();
    this.highlightTimer = setTimeout(() => {
      this.highlightedDxLabels.set(new Set());
      this.highlightedCriterionIds.set(new Set());
      this.highlightTimer = null;
    }, HIGHLIGHT_MS);
  }

  private maybeHighlightForeignDx(label: string): void {
    const buckets = this.groupBuckets();
    const isForeign = buckets.foreignRelevant.some(g =>
      g.diagnoses.some(d => normalizeDiagnosis(d) === normalizeDiagnosis(label) || d === label),
    );
    if (!isForeign) return;

    const criteriaById = new Map(this.criteria().map(c => [c.id, c]));
    const result = resolveForeignDxHighlight({
      dxLabel: label,
      tabId: this.activeTabId(),
      relevance: this.criteriaEngine.relevance(),
      ownGroups: buckets.ownGroups,
      applicableCriterionIds: new Set(this.applicableCriteria().map(c => c.id)),
      selectedMedications: this.store.meds(),
      selectedDiagnoses: this.store.diagnoses().map(code => DX_LABELS_BY_CODE.get(code) ?? code),
      criteriaById,
      dxLabelsByCode: DX_LABELS_BY_CODE,
    });

    this.highlightedDxLabels.set(new Set(result.dxLabels));
    this.highlightedCriterionIds.set(new Set(result.criterionIds));
    if (result.snackMessage) {
      this.snackBar.open(result.snackMessage, 'Entendido', {
        duration: HIGHLIGHT_MS,
        panelClass: 'snack-relacion',
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
    if (result.dxLabels.length > 0 || result.criterionIds.length > 0) {
      this.scheduleHighlightClear();
    } else {
      this.clearHighlightTimer();
    }
  }

  setTab(id: string): void {
    // Ver `setCategory` en MedsStepComponent: el resaltado se identifica por
    // etiqueta y no debe sobrevivir al cambio de pestaña.
    this.clearHighlights();
    this.store.activeSystemTab.set(id);
  }

  onLabInput(key: LabKey, event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) this.updateLab(key, target.value);
  }

  updateLab(key: LabKey, rawValue: string): void {
    const value = this.optionalNonNegativeNumber(rawValue);
    this.store.labs.update(labs => ({
      ...(labs ?? emptyLabs()),
      [key]: value,
    }));
  }

  private optionalNonNegativeNumber(rawValue: string): number | null {
    if (rawValue.trim() === '') return null;
    const value = Number(rawValue);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  onReviewedChange(tab: DiagnosisTab, event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (this.isReviewedDisabled(tab)) {
      input.checked = this.isReviewedChecked(tab);
      return;
    }
    if (input.checked !== this.isReviewedChecked(tab)) {
      this.toggleReviewed(tab);
    }
  }

  onTabSelectChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) this.setTab(target.value);
  }

  tabSelectLabel(tab: DiagnosisTab): string {
    const n = this.tabSelectionCount(tab);
    if (n > 0) return `${tab.label} (${n})`;
    if (this.isTabExplicitlyReviewed(tab)) return `${tab.label} ✓`;
    return tab.label;
  }

  tabHasSelection(tab: DiagnosisTab): boolean {
    const sel = this.selectedCodes();
    return this.dxGroupsVisibleInTab(tab).some(g =>
      g.diagnoses.some(d => sel.has(normalizeDiagnosis(d))) ||
      (!g.id.startsWith('foreign__') &&
        (this.isOtroDxSelected(g) || this.customDxFor(g).length > 0)),
    );
  }

  isSelected(label: string): boolean {
    return this.selectedCodes().has(normalizeDiagnosis(label));
  }

  // P15 — presentación de variantes: los diagnósticos del grupo se parten en
  // árboles de familia (raíz + variantes con radio-behavior) y diagnósticos planos.
  variantFamiliesIn(group: DiagnosisGroup): VariantFamilyView[] {
    return partitionGroupDiagnoses(group.diagnoses).families;
  }

  plainDiagnosesIn(group: DiagnosisGroup): string[] {
    return partitionGroupDiagnoses(group.diagnoses).plain;
  }

  trackFamily = (_: number, f: VariantFamilyView): string => f.id;

  toggleDiagnosis(label: string): void {
    const code = normalizeDiagnosis(label);
    const current = this.store.diagnoses();
    const isAdding = !current.includes(code);
    if (isAdding && !this.isDxEnabled(label)) return;
    if (!isAdding) this.clearHighlights();
    // applyMutex impone la exclusividad de variantes (P15): al seleccionar una
    // variante de una familia retira a sus hermanas; para diagnósticos sin
    // familia equivale a un toggle simple.
    this.store.diagnoses.set(applyMutex(current, code));
    if (isAdding) this.maybeHighlightForeignDx(label);
  }

  customDxFor(group: DiagnosisGroup): string[] {
    const knownCodes = new Set(group.diagnoses.map(d => normalizeDiagnosis(d)));
    const knownAnyCode = new Set(Object.keys(DIAGNOSIS_REVERSE_MAP));
    return this.store.diagnoses().filter(code => {
      if (knownCodes.has(code)) return false;
      if (knownAnyCode.has(code)) return false;
      if (code === this.otroCode(group)) return false;
      return code.startsWith(`${group.id}__`);
    }).map(code => code.slice(group.id.length + 2));
  }

  removeCustomDx(group: DiagnosisGroup, display: string): void {
    const code = `${group.id}__${display}`;
    this.store.diagnoses.set(this.store.diagnoses().filter(c => c !== code));
  }

  private otroCode(group: DiagnosisGroup): string {
    return `${group.id}__otro`;
  }

  isOtroDxSelected(group: DiagnosisGroup): boolean {
    return this.store.diagnoses().includes(this.otroCode(group));
  }

  toggleOtroDx(group: DiagnosisGroup): void {
    const code = this.otroCode(group);
    const current = this.store.diagnoses();
    if (current.includes(code)) {
      this.store.diagnoses.set(current.filter(c => c !== code));
    } else {
      this.store.diagnoses.set([...current, code]);
    }
  }

  isGroupChecked(group: DiagnosisGroup): boolean {
    return isDxGroupChecked(group, this.store.diagnoses());
  }

  groupSelectionCount(group: DiagnosisGroup): number {
    const sel = this.selectedCodes();
    let count = group.diagnoses.filter(d => sel.has(normalizeDiagnosis(d))).length;
    if (!group.id.startsWith('foreign__')) {
      if (this.isOtroDxSelected(group)) count++;
      count += this.customDxFor(group).length;
    }
    return count;
  }

  groupHasAnySelection(group: DiagnosisGroup): boolean {
    return this.isGroupChecked(group);
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
    this.dialog.open(QuickGuideDialogComponent, { width: '560px', panelClass: 'rounded-xl' });
  }

  openDisplayOptions(): void {
    this.dialog.open(DisplayOptionsDialogComponent, { width: '420px', panelClass: 'rounded-xl' });
  }

  resetCase(): void {
    this.dialog.open(ConfirmResetDialogComponent, { width: '360px', panelClass: 'rounded-xl' })
      .afterClosed()
      .subscribe(confirmed => { if (confirmed) this.store.reset(); });
  }

  navigateBack(): void {
    this.router.navigate([ROUTES.MEDICACIONES]);
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

  trackTab = (_: number, t: DiagnosisTab): string => t.id;
  trackGroup = (_: number, g: DiagnosisGroup): string => g.id;
  trackDx = (_: number, name: string): string => name;
  trackCrit = (_: number, c: Crit): string => c.id;
}
