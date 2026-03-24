import { Injectable, signal, effect } from '@angular/core';
import { Crit, PatientInfo, Labs, PatientCase, Med, SavedCase } from './types';

@Injectable({ providedIn: 'root' })
export class CaseStoreService {

  patient = signal<PatientInfo | null>(null);

  diagnoses = signal<string[]>([]);

  // Ahora medicamentos como objetos
  meds = signal<Med[]>([]);

  labs = signal<Labs | null>(null);

  results = signal<Crit[]>([]);
  activeSystem = signal<string>('Todos');
  history = signal<SavedCase[]>([]);

  private readonly HISTORY_KEY = 'historial';

  constructor() {

    // Cargar de localStorage
    const sp = localStorage.getItem('patient');
    const sd = localStorage.getItem('diagnoses');
    const sm = localStorage.getItem('meds');
    const sl = localStorage.getItem('labs');
    const ss = localStorage.getItem('activeSystem');
    const sh = localStorage.getItem(this.HISTORY_KEY);
    localStorage.removeItem('results'); // limpiar resultados cacheados de versiones anteriores

    if (sp) this.patient.set(JSON.parse(sp));
    if (sd) this.diagnoses.set(JSON.parse(sd));
    if (sm) this.meds.set(JSON.parse(sm));    // ahora objetos
    if (sl) this.labs.set(JSON.parse(sl));
    if (ss) this.activeSystem.set(ss);
    if (sh) this.history.set(JSON.parse(sh));

    // Guardado automático (results no se persiste: siempre se recalculan)
    effect(() => localStorage.setItem('patient', JSON.stringify(this.patient())));
    effect(() => localStorage.setItem('diagnoses', JSON.stringify(this.diagnoses())));
    effect(() => localStorage.setItem('meds', JSON.stringify(this.meds())));
    effect(() => localStorage.setItem('labs', JSON.stringify(this.labs())));
    effect(() => localStorage.setItem('activeSystem', this.activeSystem()));
    effect(() => localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history())));
  }

  setResults(list: Crit[]) { this.results.set(list); }
  setActiveSystem(s: string) { this.activeSystem.set(s); }

  reset() {
    this.patient.set(null);
    this.diagnoses.set([]);
    this.meds.set([]);
    this.labs.set(null);
    this.results.set([]);
    this.activeSystem.set('Todos');
    ['patient', 'diagnoses', 'meds', 'labs', 'activeSystem']
      .forEach(k => localStorage.removeItem(k));
  }

  saveToHistory(): void {
    const entry: SavedCase = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      patientCase: this.patientCase
    };
    this.history.update(h => [entry, ...h]);
  }

  deleteFromHistory(id: string): void {
    this.history.update(h => h.filter(c => c.id !== id));
  }

  loadFromHistory(entry: SavedCase): void {
    const { info, diagnoses, medications, labs } = entry.patientCase;
    this.patient.set(info);
    this.diagnoses.set(diagnoses);
    this.meds.set(medications);
    this.labs.set(labs);
    this.results.set([]);
    this.activeSystem.set('Todos');
  }

  /** ← ESTA ES LA QUE EL MOTOR EVALÚA */
  get patientCase(): PatientCase {
    return {
      info: this.patient(),
      diagnoses: this.diagnoses(),
      medications: this.meds(),   // ahora objetos
      labs: this.labs(),
    };
  }

  setLabs(l: Labs | null) {
    this.labs.set(l);
  }

}
