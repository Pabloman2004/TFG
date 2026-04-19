import { Component, ChangeDetectionStrategy, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { CaseStoreService } from '../../core/case-store.service';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { ReportService } from '../../core/report.service';
import { Crit } from '../../core/types';
import { normalizeDiagnosis, DIAGNOSIS_REVERSE_MAP } from '../../core/data/diagnoses';
import { DIAGNOSIS_CATEGORIES, DiagnosisGroup } from '../../core/data/diagnoses-taxonomy';
import { ROUTES } from '../../app.routes.constants';

type CritFilter = 'all' | 'STOPP' | 'START';
type GroupState = 'none' | 'some' | 'all';

@Component({
  selector: 'app-diagnosis-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './diagnosis-step.component.html',
  styleUrls: ['./diagnosis-step.component.css'],
})
export class DiagnosisStepComponent implements OnInit {
  readonly groups = DIAGNOSIS_CATEGORIES;
  readonly filter = signal<CritFilter>('all');
  readonly criteria = signal<Crit[]>([]);
  readonly otroInputFor = signal<string | null>(null);
  readonly lastCriterionId = signal<string | null>(null);
  private previousCriteriaIds = new Set<string>();

  readonly selectedCodes = computed<Set<string>>(
    () => new Set(this.store.diagnoses()),
  );

  readonly applicableCriteria = computed<Crit[]>(() => {
    const crits = this.criteria();
    if (!crits.length) return [];
    this.store.diagnoses();
    this.store.meds();
    this.store.labs();
    const fired = this.criteriaEngine.evaluate(this.store.patientCase, crits);
    const f = this.filter();
    return f === 'all' ? fired : fired.filter(c => c.type === f);
  });

  constructor(
    private router: Router,
    private store: CaseStoreService,
    private criteriaEngine: CriteriaEngineService,
    private report: ReportService,
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
  }

  async ngOnInit(): Promise<void> {
    const loaded = await this.criteriaEngine.loadCriteria();
    this.criteria.set(loaded);
  }

  setFilter(f: CritFilter): void { this.filter.set(f); }

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
    this.store.diagnoses.set([...current, code]);
  }

  groupState(group: DiagnosisGroup): GroupState {
    if (!group.diagnoses.length) return 'none';
    const sel = this.selectedCodes();
    const count = group.diagnoses.filter(d => sel.has(normalizeDiagnosis(d))).length;
    if (count === 0) return 'none';
    if (count === group.diagnoses.length) return 'all';
    return 'some';
  }

  groupHasAnySelection(group: DiagnosisGroup): boolean {
    return this.groupState(group) !== 'none' || this.customDxFor(group).length > 0;
  }

  toggleGroup(group: DiagnosisGroup): void {
    const state = this.groupState(group);
    const current = this.store.diagnoses();
    const codes = group.diagnoses.map(d => normalizeDiagnosis(d));
    if (state === 'all') {
      const remove = new Set(codes);
      this.store.diagnoses.set(current.filter(c => !remove.has(c)));
      return;
    }
    const missing = codes.filter(c => !current.includes(c));
    this.store.diagnoses.set([...current, ...missing]);
  }

  customDxFor(group: DiagnosisGroup): string[] {
    const knownCodes = new Set(group.diagnoses.map(d => normalizeDiagnosis(d)));
    const knownAnyCode = new Set(
      Object.keys(DIAGNOSIS_REVERSE_MAP),
    );
    return this.store.diagnoses().filter(code => {
      if (knownCodes.has(code)) return false;
      if (knownAnyCode.has(code)) return false;
      return code.startsWith(`${group.id}__`);
    }).map(code => code.slice(group.id.length + 2));
  }

  startOtro(group: DiagnosisGroup): void {
    this.otroInputFor.set(group.id);
  }

  cancelOtro(): void {
    this.otroInputFor.set(null);
  }

  confirmOtro(group: DiagnosisGroup, rawName: string): void {
    const name = rawName.trim();
    this.otroInputFor.set(null);
    if (!name) return;
    const code = `${group.id}__${name}`;
    const current = this.store.diagnoses();
    if (current.includes(code)) return;
    this.store.diagnoses.set([...current, code]);
  }

  removeCustomDx(group: DiagnosisGroup, display: string): void {
    const code = `${group.id}__${display}`;
    this.store.diagnoses.set(this.store.diagnoses().filter(c => c !== code));
  }

  criterionBadgeClass(c: Crit): string {
    return c.type === 'STOPP' ? 'crit-badge stopp' : 'crit-badge start';
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

  trackGroup = (_: number, g: DiagnosisGroup): string => g.id;
  trackDx = (_: number, name: string): string => name;
  trackCrit = (_: number, c: Crit): string => c.id;
}
