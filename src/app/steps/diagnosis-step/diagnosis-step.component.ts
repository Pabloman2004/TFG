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
import { Crit, Med } from '../../core/types';
import { MEDICATIONS } from '../../core/data/medications';

const SCALES = [1, 1.15, 1.3] as const;
type Scale = (typeof SCALES)[number];
function currentScale(): Scale {
  const v = parseFloat(localStorage.getItem('font-scale') ?? '1');
  return (SCALES.includes(v as Scale) ? v : 1) as Scale;
}
import { normalizeDiagnosis, DIAGNOSIS_REVERSE_MAP } from '../../core/data/diagnoses';
import { DIAGNOSIS_TABS, DiagnosisTab, DiagnosisGroup } from '../../core/data/diagnoses-taxonomy';
import { CARDIOVASCULAR_DX_DEPS, isDiagnosisEnabled } from '../../core/data/cardiovascular-dx-dependencies';
import { ROUTES } from '../../app.routes.constants';
import { buildCriteriaText } from '../../core/clipboard-text';
import { groupBySystem, critCode, CritGroup } from '../../core/criteria-groups';
import { isDxGroupChecked } from '../../core/group-checked';

@Component({
  selector: 'app-diagnosis-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatDialogModule],
  templateUrl: './diagnosis-step.component.html',
  styleUrls: ['./diagnosis-step.component.css'],
})
export class DiagnosisStepComponent implements OnInit {
  private readonly el = inject(ElementRef<HTMLElement>);
  readonly store = inject(CaseStoreService);
  readonly tabs = DIAGNOSIS_TABS;
  readonly activeTabId = computed<string>(() => {
    const id = this.store.activeSystemTab();
    return this.tabs.some(t => t.id === id) ? id : (DIAGNOSIS_TABS[0]?.id ?? 'cardiovascular');
  });
  readonly criteria = signal<Crit[]>([]);
  readonly lastCriterionId = signal<string | null>(null);
  private previousCriteriaIds = new Set<string>();

  readonly activeTab = computed<DiagnosisTab>(
    () => this.tabs.find(t => t.id === this.activeTabId()) ?? this.tabs[0],
  );

  readonly selectedCodes = computed<Set<string>>(
    () => new Set(this.store.diagnoses()),
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

  readonly criteriaGroups = computed<CritGroup[]>(() =>
    groupBySystem(this.applicableCriteria()),
  );

  readonly startGroups = computed<CritGroup[]>(() => groupBySystem(this.startCriteria()));
  readonly stoppGroups = computed<CritGroup[]>(() => groupBySystem(this.stoppCriteria()));

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

    effect(() => {
      const meds = this.store.meds();
      const diagnoses = this.store.diagnoses();
      const filtered = diagnoses.filter(code => {
        const label = DIAGNOSIS_REVERSE_MAP[code];
        if (label === undefined) return true;
        return isDiagnosisEnabled(label, meds);
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
  }

  isDxEnabled(label: string): boolean {
    return isDiagnosisEnabled(label, this.store.meds());
  }

  dxTooltip(label: string): string {
    return CARDIOVASCULAR_DX_DEPS[label]?.tooltip ?? '';
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

  async ngOnInit(): Promise<void> {
    this.applyScale(currentScale());
    const loaded = await this.criteriaEngine.loadCriteria();
    this.criteria.set(loaded);
  }

  setTab(id: string): void { this.store.activeSystemTab.set(id); }

  tabHasSelection(tab: DiagnosisTab): boolean {
    const sel = this.selectedCodes();
    return tab.groups.some(g =>
      g.diagnoses.some(d => sel.has(normalizeDiagnosis(d))) ||
      this.isOtroDxSelected(g) ||
      this.customDxFor(g).length > 0,
    );
  }

  isSelected(label: string): boolean {
    return this.selectedCodes().has(normalizeDiagnosis(label));
  }

  toggleDiagnosis(label: string): void {
    const code = normalizeDiagnosis(label);
    const current = this.store.diagnoses();
    if (current.includes(code)) {
      this.store.diagnoses.set(current.filter(c => c !== code));
      return;
    }
    if (!this.isDxEnabled(label)) return;
    this.store.diagnoses.set([...current, code]);
  }

  customDxFor(group: DiagnosisGroup): string[] {
    const knownCodes = new Set(group.diagnoses.map(d => normalizeDiagnosis(d)));
    const knownAnyCode = new Set(Object.keys(DIAGNOSIS_REVERSE_MAP));
    return this.store.diagnoses().filter(code => {
      if (knownCodes.has(code)) return false;
      if (knownAnyCode.has(code)) return false;
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

  navigateBack(): void {
    this.router.navigate([ROUTES.MEDICACIONES]);
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

  trackTab = (_: number, t: DiagnosisTab): string => t.id;
  trackGroup = (_: number, g: DiagnosisGroup): string => g.id;
  trackDx = (_: number, name: string): string => name;
  trackCrit = (_: number, c: Crit): string => c.id;
}
