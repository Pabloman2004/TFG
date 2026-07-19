import { ALL_CRITERIA } from '../services/criteria-test-helpers';
import { JsonLogicRule } from '../types';
import { DIAGNOSIS_MAP } from './diagnoses';
import { MEDICATIONS } from './medications';
import { extractReferences } from './system-relevance';

const medicationIds = new Set(MEDICATIONS.map(m => m.id));

const membersByClass = MEDICATIONS.reduce((acc, med) => {
  for (const drugClass of med.drugClasses) {
    const bucket = acc.get(drugClass) ?? [];
    bucket.push(med.id);
    acc.set(drugClass, bucket);
  }
  return acc;
}, new Map<string, string[]>());

const catalogDrugClasses = new Set(membersByClass.keys());

const collectReferencedDrugClasses = (): Set<string> => {
  const classes = new Set<string>();
  for (const criterion of ALL_CRITERIA) {
    for (const drugClass of extractReferences(criterion.logic).classes) {
      classes.add(drugClass);
    }
    for (const drugClass of criterion.excludes?.drugClasses ?? []) {
      classes.add(drugClass);
    }
    for (const drugClass of criterion.relevance?.medicationClasses ?? []) {
      classes.add(drugClass);
    }
  }
  return classes;
};

const collectReferencedDiagnosisCodes = (): Set<string> => {
  const codes = new Set<string>();
  for (const criterion of ALL_CRITERIA) {
    for (const code of extractReferences(criterion.logic).dxs) {
      codes.add(code);
    }
  }
  return codes;
};

const htaFamilyCodesInLogic = (logic: JsonLogicRule | undefined): string[] => {
  const family = new Set([
    'hta',
    'hta_no_complicada',
    'hipertension_moderada',
    'hipertension_grave',
  ]);
  return [...extractReferences(logic).dxs]
    .filter(code => family.has(code))
    .sort();
};

/**
 * Códigos de DIAGNOSIS_MAP deliberadamente sin cláusula en ningún criterio.
 * Informativos de UI / ancla de catálogo, no disparadores del motor.
 *
 * No incluir enfermedad_renal_grave ni insuficiencia_renal_terminal: los
 * cuenta extractReferences vía egfrBelow (umbrales ≥30 / ≥15).
 */
const DIAGNOSIS_CODES_WITHOUT_CRITERION_WHITELIST = new Set([
  'aneurisma_aortico',
]);

/**
 * Clases del catálogo sin uso en lógica, excludes ni relevance.
 * Decorativas de taxonomía UI: el fármaco porta otra clase evaluada, o el
 * grupo no dispara criterios (p. ej. DHP y CALCIO).
 */
const DRUG_CLASSES_WITHOUT_CRITERION_WHITELIST = new Set([
  'AINE_COX2',
  'ANTIANGINOSO',
  'ANTIARITMICO_CLASE_IC',
  'ANTIEMETICO_5HT3',
  'ANTIESPASMÓDICO',
  'ANTIFUNGICO',
  'ANTINEOPLASICO',
  'ANTIPALUDICO',
  'CALCIO',
  'CALCIOANTAGONISTA_DHP',
  'ESTABILIZADOR_ANIMO',
  'INMUNOSUPRESOR',
  'MACROLIDO',
  'QUINOLONA',
  'RELAJANTE_MUSCULAR',
]);

const HTA_GENERAL_VARIANTS = [
  'hta',
  'hta_no_complicada',
  'hipertension_moderada',
  'hipertension_grave',
] as const;

const B5_HTA_NO_COMPLICADA_ID = 'STOPP-B5-BETABLOQUEANTE-HTA-NO-COMPLICADA';
const B5_HTA_VARIANTS = ['hta', 'hta_no_complicada'] as const;

describe('criteria-data-integrity — guard catálogo↔criterios', () => {
  it('(a) todo id de excludes.medications existe en MEDICATIONS', () => {
    const orphans = ALL_CRITERIA.flatMap(criterion =>
      (criterion.excludes?.medications ?? [])
        .filter(id => !medicationIds.has(id))
        .map(id => `${criterion.id}: ${id}`),
    );
    expect(orphans).toEqual([]);
  });

  it('(b) toda clase usada en lógica o excludes tiene al menos un fármaco', () => {
    const empty = [...collectReferencedDrugClasses()]
      .filter(drugClass => (membersByClass.get(drugClass) ?? []).length === 0)
      .sort();
    expect(empty).toEqual([]);
  });

  it('(c) todo código de DIAGNOSIS_MAP está referenciado o en lista blanca comentada', () => {
    const referenced = collectReferencedDiagnosisCodes();
    const unreferenced = [...new Set(Object.values(DIAGNOSIS_MAP))]
      .filter(code => !referenced.has(code) && !DIAGNOSIS_CODES_WITHOUT_CRITERION_WHITELIST.has(code))
      .sort();
    expect(unreferenced).toEqual([]);

    const staleWhitelist = [...DIAGNOSIS_CODES_WITHOUT_CRITERION_WHITELIST]
      .filter(code => referenced.has(code))
      .sort();
    expect(staleWhitelist).toEqual([]);
  });

  it('(d) toda clase de catálogo sin criterio está en lista blanca decorativa', () => {
    const referenced = collectReferencedDrugClasses();
    const unreferenced = [...catalogDrugClasses]
      .filter(
        drugClass =>
          !referenced.has(drugClass) &&
          !DRUG_CLASSES_WITHOUT_CRITERION_WHITELIST.has(drugClass),
      )
      .sort();
    expect(unreferenced).toEqual([]);

    const staleWhitelist = [...DRUG_CLASSES_WITHOUT_CRITERION_WHITELIST]
      .filter(drugClass => referenced.has(drugClass) || !catalogDrugClasses.has(drugClass))
      .sort();
    expect(staleWhitelist).toEqual([]);
  });

  it('A20 — política de variantes HTA: generales las 4; B5 solo hta|hta_no_complicada', () => {
    const b5 = ALL_CRITERIA.find(c => c.id === B5_HTA_NO_COMPLICADA_ID);
    expect(b5).toBeTruthy();
    expect(htaFamilyCodesInLogic(b5!.logic)).toEqual([...B5_HTA_VARIANTS]);

    const generalHtaViolations = ALL_CRITERIA
      .filter(criterion => criterion.id !== B5_HTA_NO_COMPLICADA_ID)
      .map(criterion => ({
        id: criterion.id,
        htaCodes: htaFamilyCodesInLogic(criterion.logic),
      }))
      .filter(entry => entry.htaCodes.includes('hta'))
      .filter(
        entry =>
          entry.htaCodes.join(',') !== [...HTA_GENERAL_VARIANTS].sort().join(','),
      )
      .map(entry => `${entry.id}: [${entry.htaCodes.join(', ')}]`);

    expect(generalHtaViolations).toEqual([]);
  });
});
