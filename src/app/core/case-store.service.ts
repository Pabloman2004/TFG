import { Injectable, signal, effect } from '@angular/core';
import { Crit, PatientInfo, Labs, PatientCase, Med, SavedCase } from './types';

@Injectable({ providedIn: 'root' })
export class CaseStoreService {

  patient = signal<PatientInfo | null>(null);
  diagnoses = signal<string[]>([]);
  meds = signal<Med[]>([]);
  labs = signal<Labs | null>(null);
  results = signal<Crit[]>([]);
  activeSystem = signal<string>('Todos');
  history = signal<SavedCase[]>([]);

  private readonly HISTORY_KEY = 'historial';

  constructor() {
    this.patient.set(this.load('patient'));
    this.diagnoses.set(this.load('diagnoses') ?? []);
    this.meds.set(this.load('meds') ?? []);
    this.labs.set(this.load('labs'));
    this.activeSystem.set(this.loadString('activeSystem') ?? 'Todos');
    this.history.set(this.load(this.HISTORY_KEY) ?? []);
    this.persist('results', null); // limpiar resultados cacheados de versiones anteriores

    effect(() => this.persist('patient', this.patient()));
    effect(() => this.persist('diagnoses', this.diagnoses()));
    effect(() => this.persist('meds', this.meds()));
    effect(() => this.persist('labs', this.labs()));
    effect(() => this.persist('activeSystem', this.activeSystem()));
    effect(() => this.persist(this.HISTORY_KEY, this.history()));
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

  reset() {
    this.patient.set(null);
    this.diagnoses.set([]);
    this.meds.set([]);
    this.labs.set(null);
    this.results.set([]);
    this.activeSystem.set('Todos');
    ['patient', 'diagnoses', 'meds', 'labs', 'activeSystem']
      .forEach(k => this.persist(k, null));
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

  get patientCase(): PatientCase {
    return {
      info: this.patient(),
      diagnoses: this.diagnoses(),
      medications: this.meds(),
      labs: this.labs(),
    };
  }

  setLabs(l: Labs | null) {
    this.labs.set(l);
  }
}
