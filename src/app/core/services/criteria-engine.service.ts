// src/app/core/services/criteria-engine.service.ts

import { Injectable, Signal, signal } from '@angular/core';
import * as jsonLogic from 'json-logic-js';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PatientCase, Crit, Med, Labs } from '../types';
import { MEDICATIONS } from '../data/medications';
import { DRUG_CATEGORIES } from '../data/medications-taxonomy';
import { DIAGNOSIS_TABS } from '../data/diagnoses-taxonomy';
import { Relevance, buildRelevance } from '../data/system-relevance';

interface CriteriaFile {
  criteria: Crit[];
}

@Injectable({ providedIn: 'root' })
export class CriteriaEngineService {

  private criteriaCache: Promise<Crit[]> | null = null;
  private readonly _relevance = signal<Relevance | null>(null);
  /** Índice de relevancia por tab, calculado tras loadCriteria(). */
  readonly relevance: Signal<Relevance | null> = this._relevance.asReadonly();

  constructor(private http: HttpClient) {
    this.registerCustomOperators();
  }

  private getAllTabIds(): readonly string[] {
    const medTabs = DRUG_CATEGORIES.map(c => c.id);
    const dxTabs = DIAGNOSIS_TABS.map(t => t.id);
    return Array.from(new Set([...medTabs, ...dxTabs]));
  }

  /** =======================
   *  Cargar criteria.json
   *  ======================= */
  loadCriteria(): Promise<Crit[]> {
    if (!this.criteriaCache) {
      const bust = `?v=${Date.now()}`;
      this.criteriaCache = firstValueFrom(
        this.http.get<CriteriaFile>(`assets/data/criteria.json${bust}`)
      ).then(file => {
        const crits = file.criteria;
        this._relevance.set(buildRelevance(crits, this.getAllTabIds()));
        return crits;
      });
    }
    return this.criteriaCache;
  }

  /** =======================
   *  Normalizar MAY/MIN
   *  ======================= */
  private normalizeCase(input: PatientCase): PatientCase {
    return {
      ...input,

      diagnoses: input.diagnoses.map(d => d.toLowerCase()),

      medications: input.medications.map(m => ({
        ...m,
        id: m.id.toLowerCase(),
        drugClasses: m.drugClasses.map(c => c.toLowerCase())
      })),

      //el type Lab solo tiene numeros dentro entonces no hay que normalizar simplemente copiamos el valor del array
      labs: input.labs ? { ...input.labs } : null
    };
  }

  private normalizeCriterion(c: Crit): Crit {
    const clone = JSON.parse(JSON.stringify(c)) as Crit;
    this.normalizeLogic(clone.logic);
    return clone;
  }

  private normalizeLogic(node: unknown): void {
    if (typeof node !== 'object' || node === null) return;
    const obj = node as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (key === 'drug_class' || key === 'diagnosis') {
        obj[key] = String(obj[key]).toLowerCase();
      }
      this.normalizeLogic(obj[key]);
    }
  }

  /** =======================
   *  Evaluar criterios
   *  ======================= */
  evaluate(patient: PatientCase, criteria: Crit[]): Crit[] {

    if (!patient) return [];

    const normalizedPatient = this.normalizeCase(patient);

    return criteria
      .map(c => this.normalizeCriterion(c))
      .filter(c => this.evaluateCriterion(c, normalizedPatient));
  }

  /** =======================
   *  Obtener medicaciones excluidas
   *  ======================= */
  getExcludedMedications(patient: PatientCase, criteria: Crit[]): Map<string, Crit> {
    const excluded = new Map<string, Crit>();
    const normalizedPatient = this.normalizeCase(patient);

    for (const crit of criteria) {
      if (!crit.excludes) continue;

      const normalizedCrit = this.normalizeCriterion(crit);

      const excludedMedNames = [
        ...(crit.excludes.medications ?? []),
        ...((crit.excludes.drugClasses ?? []).flatMap(dc => this.getMedicationsByClass(dc)))
      ];

      for (const medName of excludedMedNames) {
        if (excluded.has(medName.toLowerCase())) continue;

        const probeMed = MEDICATIONS.find(m => m.id.toLowerCase() === medName.toLowerCase());
        if (!probeMed) continue;

        const normalizedProbeMed = {
          ...probeMed,
          id: probeMed.id.toLowerCase(),
          drugClasses: probeMed.drugClasses.map(c => c.toLowerCase())
        };

        // Evaluar siempre con el contexto real del paciente (incluyendo el probe).
        // Esto garantiza que criterios con cláusulas NOT (p. ej. B11) se evalúen
        // correctamente: si el paciente tiene la excepción, el criterio no disparará.
        const alreadyPresent = normalizedPatient.medications.some(
          m => m.id.toLowerCase() === probeMed.id.toLowerCase()
        );

        const testMedications = alreadyPresent
          ? normalizedPatient.medications
          : [...normalizedPatient.medications, normalizedProbeMed];

        const testPatient: PatientCase = { ...normalizedPatient, medications: testMedications };

        if (this.evaluateCriterion(normalizedCrit, testPatient)) {
          excluded.set(medName.toLowerCase(), crit);
        }
      }
    }

    return excluded;
  }

  /** =======================
   *  Obtener medicaciones por clase
   *  ======================= */
  private getMedicationsByClass(drugClass: string): string[] {
    const dc = drugClass.toLowerCase();
    return MEDICATIONS
      .filter(med => med.drugClasses.map(c => c.toLowerCase()).includes(dc))
      .map(med => med.id);
  }


  /** =======================
   *  Aplicar json-logic
   *  ======================= */
  private evaluateCriterion(c: Crit, patient: PatientCase): boolean {
    if (!c.logic) return false;
    try {
      return Boolean(jsonLogic.apply(c.logic, patient as unknown));
    } catch (e) {
      console.error('❌ Error evaluando criterio', c.id, e);
      return false;
    }
  }

  /** =======================
   *  Operadores personalizados
   *  ======================= */
  private registerCustomOperators() {

    const hasDrugClass = (med: Med, drugClass: string): boolean =>
      med.drugClasses.map(d => d.toLowerCase()).includes(drugClass);

    const countByClass = (meds: Med[], drugClass: string): number =>
      meds.filter(m => hasDrugClass(m, drugClass)).length;

    const makeMultipleClassOp = (drugClass: string, threshold = 1) =>
      (meds: unknown): boolean => {
        if (!Array.isArray(meds)) return false;
        return countByClass(meds as Med[], drugClass) >= threshold;
      };

    // ¿Hay un medicamento cuya clase contenga X?
    jsonLogic.add_operation('inDrugClass', (drugClass: unknown, meds: unknown) => {
      if (!Array.isArray(meds) || typeof drugClass !== 'string') return false;
      const dc = drugClass.toLowerCase();
      return (meds as Med[]).some(m => hasDrugClass(m, dc));
    });

    // ¿Hay Digoxina con dosis alta (≥125 μg/día) y a largo plazo (> 90 días)?
    jsonLogic.add_operation('digoxinaDosisAlta', (meds: unknown) => {
      if (!Array.isArray(meds)) return false;
      return (meds as Med[]).some(m =>
        hasDrugClass(m, 'digoxina') &&
        m.doseMcgDay != null && m.doseMcgDay >= 125 &&
        m.durationDays != null && m.durationDays > 90
      );
    });

    // ¿La función renal del paciente está por debajo del umbral?
    // Equivalencias clínicas para cuando el usuario no introduce valor numérico:
    //   - "enfermedad_renal_grave"          ≡ TFGe < 30
    //   - "insuficiencia_renal_terminal"    ≡ TFGe < 15
    // El operador unifica la fuente (analítica y diagnóstico) para que el
    // criterio dispare si CUALQUIERA de las dos vías confirma la insuficiencia.
    jsonLogic.add_operation('egfrBelow', (threshold: unknown, patient: unknown) => {
      if (typeof threshold !== 'number') return false;
      if (!patient || typeof patient !== 'object') return false;

      const p = patient as Partial<PatientCase>;
      const diagnoses = Array.isArray(p.diagnoses) ? p.diagnoses : [];

      // "grave" implica TFGe < 30, así que cumple cualquier umbral ≥ 30.
      if (threshold >= 30 && diagnoses.includes('enfermedad_renal_grave')) return true;
      // "terminal" implica TFGe < 15, así que cumple cualquier umbral ≥ 15.
      if (threshold >= 15 && diagnoses.includes('insuficiencia_renal_terminal')) return true;

      const labs = p.labs as Labs | null | undefined;
      const value = labs?.egfr_ml_min_173;
      return value != null && value < threshold;
    });

    jsonLogic.add_operation('multipleNSAIDs',                    makeMultipleClassOp('aine', 2));
    jsonLogic.add_operation('multipleLoopDiuretics',             makeMultipleClassOp('diuretico_asa', 2));
    jsonLogic.add_operation('multipleThiazideDiuretics',         makeMultipleClassOp('diuretico_tiazidico', 2));
    jsonLogic.add_operation('multipleIECA',                      makeMultipleClassOp('ieca', 2));
    jsonLogic.add_operation('multipleARAII',                     makeMultipleClassOp('ara2', 2));
    jsonLogic.add_operation('multipleAldosteroneAntagonists',    makeMultipleClassOp('antagonista_aldosterona', 2));
    jsonLogic.add_operation('multipleDiureticosAhorradoresPotasio', makeMultipleClassOp('diuretico_ahorrador_potasio', 2));
    jsonLogic.add_operation('multipleISRS',                      makeMultipleClassOp('isrs', 2));
    jsonLogic.add_operation('multipleANTIAGREGANTES',            makeMultipleClassOp('antiagregante', 2));
    jsonLogic.add_operation('multipleANTICOLINERGICOS',          makeMultipleClassOp('anticolinergico', 2));
  }
}
