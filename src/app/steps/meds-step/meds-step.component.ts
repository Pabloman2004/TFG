import { Component, ChangeDetectionStrategy, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { CaseStoreService } from '../../core/case-store.service';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { ReportService } from '../../core/report.service';
import { Med, Crit } from '../../core/types';
import { MEDICATIONS } from '../../core/data/medications';
import { DRUG_CATEGORIES, DrugCategory, DrugGroup } from '../../core/data/medications-taxonomy';
import { ROUTES } from '../../app.routes.constants';

type CritFilter = 'all' | 'STOPP' | 'START';
type GroupState = 'none' | 'some' | 'all';

@Component({
  selector: 'app-meds-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './meds-step.component.html',
  styleUrl: './meds-step.component.css',
})
export class MedsStepComponent implements OnInit {
  readonly categories = DRUG_CATEGORIES;
  readonly activeCategoryId = signal<string>(DRUG_CATEGORIES[0]?.id ?? 'cardiovascular');
  readonly filter = signal<CritFilter>('all');
  readonly criteria = signal<Crit[]>([]);
  readonly exclusions = signal<Map<string, Crit>>(new Map());
  readonly otroInputFor = signal<string | null>(null);
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

  setCategory(id: string): void { this.activeCategoryId.set(id); }
  setFilter(f: CritFilter): void { this.filter.set(f); }

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
      m.drugClasses.includes(dc) && !knownSet.has(m.id)
    );
  }

  startOtro(group: DrugGroup): void {
    this.otroInputFor.set(group.id);
  }

  cancelOtro(): void {
    this.otroInputFor.set(null);
  }

  confirmOtro(group: DrugGroup, rawName: string): void {
    const name = rawName.trim();
    this.otroInputFor.set(null);
    if (!name) return;
    if (this.isSelected(name)) return;
    const classes = group.drugClass ? [group.drugClass] : [];
    const med: Med = { id: name, drugClasses: classes };
    this.store.meds.set([...this.store.meds(), med]);
  }

  removeMed(name: string): void {
    this.store.meds.set(this.store.meds().filter(m => m.id !== name));
  }

  groupState(group: DrugGroup): GroupState {
    if (!group.drugs.length) return 'none';
    const sel = this.selectedNames();
    const count = group.drugs.filter(d => sel.has(d)).length;
    if (count === 0) return 'none';
    if (count === group.drugs.length) return 'all';
    return 'some';
  }

  groupHasAnySelection(group: DrugGroup): boolean {
    return this.groupState(group) !== 'none' || this.customDrugsFor(group).length > 0;
  }

  toggleGroup(group: DrugGroup): void {
    const state = this.groupState(group);
    const current = this.store.meds();
    if (state === 'all') {
      const remove = new Set(group.drugs);
      this.store.meds.set(current.filter(m => !remove.has(m.id)));
      return;
    }
    const addable = group.drugs.filter(n => !this.isSelected(n));
    const toAdd: Med[] = addable.map(n => {
      const found = MEDICATIONS.find(m => m.id === n);
      return found ?? { id: n, drugClasses: [] };
    });
    this.store.meds.set([...current, ...toAdd]);
  }

  criterionBadgeClass(c: Crit): string {
    return c.type === 'STOPP' ? 'crit-badge stopp' : 'crit-badge start';
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

  trackCat = (_: number, c: DrugCategory): string => c.id;
  trackGroup = (_: number, g: DrugGroup): string => g.id;
  trackDrug = (_: number, name: string): string => name;
  trackCrit = (_: number, c: Crit): string => c.id;
}
