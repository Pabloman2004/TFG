// @linked docs/caso-clinico.md
// Si cambias signals, claves de localStorage, reset(), loadCase() o patientCase, actualiza el doc enlazado.

import { Injectable, signal, effect } from '@angular/core';
import { Crit, PatientInfo, Labs, PatientCase, Med } from './types';

@Injectable({ providedIn: 'root' })
export class CaseStoreService {

  patient = signal<PatientInfo | null>(null);
  diagnoses = signal<string[]>([]);
  meds = signal<Med[]>([]);
  labs = signal<Labs | null>(null);
  results = signal<Crit[]>([]);
  activeSystem = signal<string>('Todos');
  activeSystemTab = signal<string>('cardiovascular');
  collapsedSections = signal<string[]>([]);
  reviewedMedTabs = signal<Set<string>>(new Set());
  reviewedDxTabs = signal<Set<string>>(new Set());

  private readonly REVIEWED_MED_KEY = 'reviewedMedTabs';
  private readonly REVIEWED_DX_KEY = 'reviewedDxTabs';

  constructor() {
    this.patient.set(this.load('patient'));
    this.diagnoses.set(this.load('diagnoses') ?? []);
    this.meds.set(this.load('meds') ?? []);
    this.labs.set(this.load('labs'));
    this.activeSystem.set(this.loadString('activeSystem') ?? 'Todos');
    this.activeSystemTab.set(this.loadString('activeSystemTab') ?? 'cardiovascular');
    this.reviewedMedTabs.set(new Set(this.load<string[]>(this.REVIEWED_MED_KEY) ?? []));
    this.reviewedDxTabs.set(new Set(this.load<string[]>(this.REVIEWED_DX_KEY) ?? []));
    this.persist('results', null); // limpiar resultados cacheados de versiones anteriores
    this.persist('historial', null); // limpiar historial legado (feature eliminada)

    effect(() => this.persist('patient', this.patient()));
    effect(() => this.persist('diagnoses', this.diagnoses()));
    effect(() => this.persist('meds', this.meds()));
    effect(() => this.persist('labs', this.labs()));
    effect(() => this.persist('activeSystem', this.activeSystem()));
    effect(() => this.persist('activeSystemTab', this.activeSystemTab()));
    effect(() => this.persist(this.REVIEWED_MED_KEY, [...this.reviewedMedTabs()]));
    effect(() => this.persist(this.REVIEWED_DX_KEY, [...this.reviewedDxTabs()]));
  }

  private load<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private loadString(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private persist(key: string, value: unknown): void {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Cuota excedida o modo incógnito sin almacenamiento — la app sigue funcionando
    }
  }

  setResults(list: Crit[]) { this.results.set(list); }
  setActiveSystem(s: string) { this.activeSystem.set(s); }

  isMedTabReviewed(tabId: string): boolean { return this.reviewedMedTabs().has(tabId); }
  isDxTabReviewed(tabId: string): boolean { return this.reviewedDxTabs().has(tabId); }

  toggleMedTabReviewed(tabId: string): void {
    this.reviewedMedTabs.update(s => toggleInSet(s, tabId));
  }
  toggleDxTabReviewed(tabId: string): void {
    this.reviewedDxTabs.update(s => toggleInSet(s, tabId));
  }

  clearMedTabReviewed(tabId: string): void {
    this.reviewedMedTabs.update(s => removeFromSet(s, tabId));
  }
  clearDxTabReviewed(tabId: string): void {
    this.reviewedDxTabs.update(s => removeFromSet(s, tabId));
  }

  reset() {
    this.patient.set(null);
    this.diagnoses.set([]);
    this.meds.set([]);
    this.labs.set(null);
    this.results.set([]);
    this.activeSystem.set('Todos');
    this.activeSystemTab.set('cardiovascular');
    this.collapsedSections.set([]);
    this.reviewedMedTabs.set(new Set());
    this.reviewedDxTabs.set(new Set());
    ['patient', 'diagnoses', 'meds', 'labs', 'activeSystem', 'activeSystemTab',
      this.REVIEWED_MED_KEY, this.REVIEWED_DX_KEY]
      .forEach(k => this.persist(k, null));
  }

  loadCase(patientCase: PatientCase): void {
    this.patient.set(patientCase.info);
    this.diagnoses.set(patientCase.diagnoses);
    this.meds.set(patientCase.medications);
    this.labs.set(patientCase.labs);
    this.reviewedMedTabs.set(new Set(patientCase.reviewedMedTabs ?? []));
    this.reviewedDxTabs.set(new Set(patientCase.reviewedDxTabs ?? []));
    this.results.set([]);
    this.activeSystem.set('Todos');
  }

  get patientCase(): PatientCase {
    return {
      info: this.patient(),
      diagnoses: this.diagnoses(),
      medications: this.meds(),
      labs: this.labs(),
      reviewedMedTabs: [...this.reviewedMedTabs()],
      reviewedDxTabs: [...this.reviewedDxTabs()],
    };
  }

  setLabs(l: Labs | null) {
    this.labs.set(l);
  }
}

function toggleInSet(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id); else next.add(id);
  return next;
}

function removeFromSet(set: ReadonlySet<string>, id: string): Set<string> {
  if (!set.has(id)) return set as Set<string>;
  const next = new Set(set);
  next.delete(id);
  return next;
}
