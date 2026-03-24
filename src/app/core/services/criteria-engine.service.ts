// src/app/core/services/criteria-engine.service.ts

import { Injectable } from '@angular/core';
import * as jsonLogic from 'json-logic-js';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PatientCase, Crit } from '../types';
import { MEDICATIONS } from '../data/medications';

interface CriteriaFile {
  criteria: Crit[];
}

@Injectable({ providedIn: 'root' })
export class CriteriaEngineService {

  private criteriaCache: Promise<Crit[]> | null = null;

  constructor(private http: HttpClient) {
    this.registerCustomOperators();
  }

  /** =======================
   *  Cargar criteria.json
   *  ======================= */
  loadCriteria(): Promise<Crit[]> {
    if (!this.criteriaCache) {
      this.criteriaCache = firstValueFrom(
        this.http.get<CriteriaFile>('assets/data/criteria.json')
      ).then(file => file.criteria);
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
    // Normalizar drug_class y diagnosis dentro de la lógica
    const clone = JSON.parse(JSON.stringify(c));

    const normalizeLogic = (node: any) => {
      if (typeof node !== 'object' || node === null) return;

      for (const key of Object.keys(node)) {
        if (key === 'drug_class') node[key] = String(node[key]).toLowerCase();
        if (key === 'diagnosis') node[key] = String(node[key]).toLowerCase();
        normalizeLogic(node[key]);  // recursión
      }
    };

    normalizeLogic(clone.logic);
    return clone;
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
    // Evaluar criterios activos
    const activeCriteria = this.evaluate(patient, criteria);

    // Mapa: nombre de medicación -> criterio que la excluye
    const excluded = new Map<string, Crit>();

    activeCriteria.forEach(crit => {
      // Excluir medicaciones específicas
      crit.excludes?.medications?.forEach(medName => {
        excluded.set(medName.toLowerCase(), crit);
      });

      // Excluir clases enteras
      crit.excludes?.drugClasses?.forEach(drugClass => {
        // Buscar todas las meds que pertenecen a esta clase
        const medsInClass = this.getMedicationsByClass(drugClass);
        medsInClass.forEach(medName => {
          excluded.set(medName.toLowerCase(), crit);
        });
      });
    });

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
      return jsonLogic.apply(c.logic as any, patient);
    } catch (e) {
      console.error('❌ Error evaluando criterio', c.id, e);
      return false;
    }
  }

  /** =======================
   *  Operadores personalizados
   *  ======================= */
  private registerCustomOperators() {

    // ¿Hay un medicamento cuya clase contenga X?
    jsonLogic.add_operation('inDrugClass', (drugClass: string, meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const dc = drugClass.toLowerCase();
      return meds.some(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes(dc)
      );
    });

    // ¿Hay Digoxina con dosis alta (≥125 μg/día) y a largo plazo (> 90 días)?
    jsonLogic.add_operation('digoxinaDosisAlta', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      return meds.some(m => {
        const isDigoxina = m.drugClasses?.map((d: string) => d.toLowerCase()).includes('digoxina');
        const dosisAlta = m.doseMcgDay != null && m.doseMcgDay >= 125;
        const largoplazo = m.durationDays != null && m.durationDays > 90;
        return isDigoxina && dosisAlta && largoplazo;
      });
    });

    // ¿Hay más de un AINE en la lista de medicamentos? (criterio A3)
    // Retorna true si ya hay 1 o más AINEs, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleNSAIDs', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const nsaidCount = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('aine')
      ).length;
      return nsaidCount >= 1; // Bloquear si ya hay 1 o más AINEs
    });

    // ¿Hay más de un diurético de asa en la lista de medicamentos? (criterio A3)
    // Retorna true si ya hay 1 o más diuréticos de asa, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleLoopDiuretics', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const loopDiureticCount = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('diuretico_asa')
      ).length;
      return loopDiureticCount >= 1; // Bloquear si ya hay 1 o más diuréticos de asa
    });

    // ¿Hay más de un diurético tiazídico en la lista de medicamentos? (criterio A3)
    // Retorna true si ya hay 1 o más diuréticos tiazídicos, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleThiazideDiuretics', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const thiazideDiureticCount = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('diuretico_tiazidico')
      ).length;
      return thiazideDiureticCount >= 1; // Bloquear si ya hay 1 o más diuréticos tiazídicos
    });

    // ¿Hay más de un IECA en la lista de medicamentos? (criterio A3)
    // Retorna true si ya hay 1 o más IECA, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleIECA', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const iecaCount = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('ieca')
      ).length;
      return iecaCount >= 1; // Bloquear si ya hay 1 o más IECA
    });

    // ¿Hay más de un ARA-II en la lista de medicamentos? (criterio A3)
    // Retorna true si ya hay 1 o más ARA-II, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleARAII', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const ara2Count = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('ara2')
      ).length;
      return ara2Count >= 1; // Bloquear si ya hay 1 o más ARA-II
    });

    // ¿Hay más de un antagonista de aldosterona en la lista de medicamentos? (criterio A3)
    // Retorna true si ya hay 1 o más antagonistas de aldosterona, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleAldosteroneAntagonists', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const aldoAntCount = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('antagonista_aldosterona')
      ).length;
      return aldoAntCount >= 1; // Bloquear si ya hay 1 o más antagonistas de aldosterona
    });

    // ¿Hay más de un diurético ahorrador de potasio en la lista? (criterio A3)
    // Incluye: Amilorida, Triamtereno, Espironolactona, Eplerenona
    // Retorna true si ya hay 1 o más diuréticos ahorradores K+, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleDiureticosAhorradoresPotasio', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const kSparingCount = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('diuretico_ahorrador_potasio')
      ).length;
      return kSparingCount >= 1; // Bloquear si ya hay 1 o más diuréticos ahorradores K+
    });

    // ¿Hay más de un ISRS en la lista de medicamentos? (criterio A3)
    // Retorna true si ya hay 1 o más ISRS, para prevenir añadir un segundo
    jsonLogic.add_operation('multipleISRS', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      const isrsCount = meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('isrs')
      ).length;
      return isrsCount >= 1;
    });

    // ¿Hay 2 o más antiagregantes? (criterio C3: AAS + clopidogrel simultáneos)
    jsonLogic.add_operation('multipleANTIAGREGANTES', (meds: any[]) => {
      if (!Array.isArray(meds)) return false;
      return meds.filter(m =>
        m.drugClasses?.map((d: string) => d.toLowerCase()).includes('antiagregante')
      ).length >= 2;
    });

  }
}
