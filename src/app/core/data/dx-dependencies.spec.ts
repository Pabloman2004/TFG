import { Med } from '../types';
import { ALL_CRITERIA } from '../services/criteria-test-helpers';
import { ANCHOR_LABELS_APPLIED_FOR_GATING } from './dx-anchor-labels-candidate';
import { DIAGNOSIS_MAP } from './diagnoses';
import { DX_DEPENDENCIES_OVERRIDES } from './dx-dependencies-overrides';
import {
  buildDxDependencies,
  extractDrugClasses,
  extractPositiveDxCodes,
  hasEffectiveDxTriggers,
  isDiagnosisEnabled,
  isAlwaysEnabled,
  validateOverrideLabels,
} from './dx-dependencies';

const med = (id: string, drugClasses: string[]): Med => ({ id, drugClasses });

const DEPS = buildDxDependencies(ALL_CRITERIA);

describe('extractPositiveDxCodes', () => {
  it('ignora diagnósticos bajo negación', () => {
    const codes = extractPositiveDxCodes({
      and: [
        { inDrugClass: ['DIURETICO_ASA', { var: 'medications' }] },
        { '!': { or: [{ in: ['insuficiencia_cardiaca', { var: 'diagnoses' }] }] } },
        { in: ['hta', { var: 'diagnoses' }] },
      ],
    });
    expect([...codes].sort()).toEqual(['hta']);
  });
});

describe('extractDrugClasses', () => {
  it('extrae todas las clases inDrugClass del árbol', () => {
    const classes = extractDrugClasses({
      and: [
        { inDrugClass: ['AINE', { var: 'medications' }] },
        { or: [{ inDrugClass: ['DIURETICO_ASA', { var: 'medications' }] }] },
      ],
    });
    expect([...classes].sort()).toEqual(['AINE', 'DIURETICO_ASA']);
  });

  it('extrae la clase de medicationClassDurationAbove (D10/D11)', () => {
    const classes = extractDrugClasses({
      and: [
        { medicationClassDurationAbove: ['BENZODIACEPINA', 13, { var: 'medications' }] },
        { in: ['insomnio', { var: 'diagnoses' }] },
      ],
    });
    expect([...classes]).toEqual(['BENZODIACEPINA']);
  });

  it('extrae HIPNOTICO_Z de medicationClassDurationAbove', () => {
    const classes = extractDrugClasses({
      and: [
        { medicationClassDurationAbove: ['HIPNOTICO_Z', 13, { var: 'medications' }] },
        { in: ['insomnio', { var: 'diagnoses' }] },
      ],
    });
    expect([...classes]).toEqual(['HIPNOTICO_Z']);
  });
});

describe('A1+A2 — Insomnio habilitado con benzodiacepina o hipnótico-Z (D10/D11)', () => {
  it('Insomnio incluye BENZODIACEPINA e HIPNOTICO_Z en deps derivadas', () => {
    expect(DEPS['Insomnio']?.classes).toContain('BENZODIACEPINA');
    expect(DEPS['Insomnio']?.classes).toContain('HIPNOTICO_Z');
  });

  it('benzodiacepina habilita Insomnio (STOPP-D10)', () => {
    const meds = [med('Lorazepam', ['BENZODIACEPINA'])];
    expect(isDiagnosisEnabled('Insomnio', meds, DEPS)).toBe(true);
  });

  it('hipnótico-Z habilita Insomnio (STOPP-D11)', () => {
    const meds = [med('Zolpidem', ['HIPNOTICO_Z'])];
    expect(isDiagnosisEnabled('Insomnio', meds, DEPS)).toBe(true);
  });

  it('Insomnio sigue deshabilitado sin medicación relevante', () => {
    expect(isDiagnosisEnabled('Insomnio', [], DEPS)).toBe(false);
    expect(isDiagnosisEnabled('Insomnio', [med('Enalapril', ['IECA'])], DEPS)).toBe(false);
  });
});

describe('buildDxDependencies — snapshot piloto cardiovascular', () => {
  const pilotLabels = Object.keys(DX_DEPENDENCIES_OVERRIDES);

  it('reproduce las clases del mapa manual cardiovascular', () => {
    for (const label of pilotLabels) {
      expect(DEPS[label]?.classes).toEqual(DX_DEPENDENCIES_OVERRIDES[label].classes);
    }
  });

  it('reproduce los tooltips del mapa manual cardiovascular', () => {
    for (const label of pilotLabels) {
      expect(DEPS[label]?.tooltip).toBe(DX_DEPENDENCIES_OVERRIDES[label].tooltip);
    }
  });
});

describe('buildDxDependencies — otros sistemas', () => {
  it('estreñimiento crónico es ancla aplicada: siempre habilitado sin medicación', () => {
    expect(DEPS['Estreñimiento crónico']).toBeUndefined();
    expect(isDiagnosisEnabled('Estreñimiento crónico', [], DEPS)).toBe(true);
  });

  it('EPOC es ancla aplicada: siempre habilitado sin medicación', () => {
    expect(DEPS['EPOC']).toBeUndefined();
    expect(isDiagnosisEnabled('EPOC', [], DEPS)).toBe(true);
  });

  it('dolor leve (dudoso, no ancla) sigue requiriendo opioide', () => {
    expect(DEPS['Dolor leve']?.classes).toContain('OPIOIDE');
    expect(isDiagnosisEnabled('Dolor leve', [], DEPS)).toBe(false);
  });

  it('demencia por cuerpos de Lewy es seleccionable sin medicación (la necesita START-D4)', () => {
    expect(isDiagnosisEnabled('Demencia por cuerpos de Lewy', [], DEPS)).toBe(true);
  });

  it('Enfermedad de Parkinson es seleccionable sin medicación pese a citarse en STOPP', () => {
    expect(isDiagnosisEnabled('Enfermedad de Parkinson', [], DEPS)).toBe(true);
  });
});

describe('isDiagnosisEnabled()', () => {
  it('habilita un diagnóstico no presente en el mapa de dependencias', () => {
    expect(isDiagnosisEnabled('Diagnóstico inexistente sin dependencia', [], DEPS)).toBe(true);
  });

  it('habilita un diagnóstico no presente en el mapa aun con medicaciones', () => {
    const meds = [med('Digoxina', ['DIGOXINA'])];
    expect(isDiagnosisEnabled('Angina de pecho', meds, DEPS)).toBe(true);
  });

  it('deshabilita un diagnóstico con dependencia cuando no hay medicaciones', () => {
    expect(
      isDiagnosisEnabled('Insuficiencia cardíaca con función sistólica conservada', [], DEPS),
    ).toBe(false);
  });

  it('habilita un diagnóstico cuya dependencia se cumple por la clase del medicamento', () => {
    const meds = [med('Digoxina', ['DIGOXINA'])];
    expect(
      isDiagnosisEnabled('Insuficiencia cardíaca con función sistólica conservada', meds, DEPS),
    ).toBe(true);
  });

  it('habilita cuando se cumple cualquiera de varias clases requeridas (OR)', () => {
    const conBetabloq = [med('Bisoprolol', ['BETABLOQUEANTE'])];
    const conVerapamilo = [med('Verapamilo', ['CALCIOANTAGONISTA_NO_DHP'])];
    const conDigoxina = [med('Digoxina', ['DIGOXINA'])];
    expect(isDiagnosisEnabled('Bradicardia', conBetabloq, DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Bradicardia', conVerapamilo, DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Bradicardia', conDigoxina, DEPS)).toBe(true);
  });

  it('deshabilita cuando ninguna de las clases requeridas está presente', () => {
    const meds = [med('Enalapril', ['IECA'])];
    expect(isDiagnosisEnabled('Bradicardia', meds, DEPS)).toBe(false);
  });

  it('mapa contiene una entrada por cada regla STOPP-B con dependencia diagnóstica exclusiva', () => {
    const requiredKeys = [
      'Insuficiencia cardíaca con función sistólica conservada',
      'Insuficiencia cardíaca NYHA III-IV',
      'Bradicardia',
      'Bloqueo AV de segundo grado',
      'Bloqueo AV completo',
      'HTA no complicada',
      'HTA grave',
      'HTA moderada',
      'Taquiarritmias supraventriculares',
      'Estenosis aórtica grave sintomática',
      'Insuficiencia cardíaca grave',
      'Intervalo QTc prolongado',
    ];
    for (const key of requiredKeys) {
      expect(DEPS[key]).toBeDefined();
      expect(DEPS[key].tooltip.length).toBeGreaterThan(0);
    }
  });

  it('NO incluye en el mapa los diagnósticos-ancla aplicados para gating', () => {
    for (const key of ANCHOR_LABELS_APPLIED_FOR_GATING) {
      expect(DEPS[key])
        .withContext(`"${key}" no debe estar en el mapa: es ancla candidata aplicada`)
        .toBeUndefined();
      expect(isDiagnosisEnabled(key, [], DEPS))
        .withContext(`"${key}" debe estar habilitado siempre, también sin meds`)
        .toBe(true);
    }
  });

  it('Fragilidad e Ictus previo (anclas) están siempre habilitados', () => {
    expect(isDiagnosisEnabled('Fragilidad', [], DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Ictus previo', [], DEPS)).toBe(true);
  });

  it('Demencia (ancla) está siempre habilitada', () => {
    expect(isDiagnosisEnabled('Demencia', [], DEPS)).toBe(true);
    expect(DEPS['Demencia']).toBeUndefined();
  });

  it('todas las entradas del mapa proveen al menos un trigger (classes o ids)', () => {
    for (const [label, dep] of Object.entries(DEPS)) {
      const hasClasses = (dep.classes?.length ?? 0) > 0;
      const hasIds = (dep.ids?.length ?? 0) > 0;
      expect(hasClasses || hasIds)
        .withContext(`Entrada "${label}" no define classes ni ids`)
        .toBe(true);
    }
  });

  it('B14: PDE5 inhibidor habilita Insuficiencia cardíaca grave', () => {
    const meds = [med('Sildenafilo', ['INHIBIDOR_PDE5'])];
    expect(isDiagnosisEnabled('Insuficiencia cardíaca grave', meds, DEPS)).toBe(true);
  });

  it('B20: alfabloqueante habilita Estenosis aórtica grave', () => {
    const meds = [med('Tamsulosina', ['ALFABLOQUEANTE'])];
    expect(isDiagnosisEnabled('Estenosis aórtica grave sintomática', meds, DEPS)).toBe(true);
  });

  it('Enfermedad vascular (coronaria/cerebral/periférica) está siempre habilitada', () => {
    expect(isDiagnosisEnabled('Enfermedad vascular coronaria', [], DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Enfermedad vascular cerebral', [], DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Enfermedad vascular periférica', [], DEPS)).toBe(true);
  });

  it('FA está siempre habilitada', () => {
    expect(isDiagnosisEnabled('FA', [], DEPS)).toBe(true);
  });

  it('B6: Antiarrítmico habilita Taquiarritmias supraventriculares', () => {
    const sinMeds = [] as Med[];
    const conAntiarritmico = [med('Amiodarona', ['ANTIARITMICO'])];
    expect(isDiagnosisEnabled('Taquiarritmias supraventriculares', sinMeds, DEPS)).toBe(false);
    expect(isDiagnosisEnabled('Taquiarritmias supraventriculares', conAntiarritmico, DEPS)).toBe(
      true,
    );
  });

  it('soporta dependencia por id de fármaco específico', () => {
    const fakeMeds = [med('Verapamilo', ['CALCIOANTAGONISTA_NO_DHP'])];
    expect(isDiagnosisEnabled('Insuficiencia cardíaca NYHA III-IV', fakeMeds, DEPS)).toBe(true);
  });
});

describe('tooltip derivado usa ejemplos de fármacos, no tokens de clase crudos', () => {
  it('Dolor irruptivo (derivado de L3/OPIOIDE_LP): muestra nombres de fármacos + elipsis', () => {
    const tip = DEPS['Dolor irruptivo']?.tooltip ?? '';
    expect(tip).not.toContain('OPIOIDE_LP');
    expect(tip).toContain('Morfina LP');
    expect(tip).toContain('…');
  });
});

const overrideKeys = () => new Set(Object.keys(DX_DEPENDENCIES_OVERRIDES));

const labelsWithoutPureDxDeps = (): string[] => {
  const pure = buildDxDependencies(ALL_CRITERIA, {});
  return Object.keys(DIAGNOSIS_MAP).filter(
    label =>
      !ANCHOR_LABELS_APPLIED_FOR_GATING.has(label) &&
      !overrideKeys().has(label) &&
      pure[label] === undefined,
  );
};

describe('labels sin disparadores derivados (no ancla, no override)', () => {
  it('Insuficiencia cardíaca con FE reducida no tiene deps puras ni override', () => {
    const pure = buildDxDependencies(ALL_CRITERIA, {});
    expect(pure['Insuficiencia cardíaca con FE reducida']).toBeUndefined();
    expect(overrideKeys().has('Insuficiencia cardíaca con FE reducida')).toBe(false);
    expect(ANCHOR_LABELS_APPLIED_FOR_GATING.has('Insuficiencia cardíaca con FE reducida')).toBe(
      false,
    );
  });

  it('están siempre habilitados sin medicación aunque el mapa merged incluya entrada vacía', () => {
    const orphans = labelsWithoutPureDxDeps();
    expect(orphans).toContain('Insuficiencia cardíaca con FE reducida');
    expect(
      orphans.filter(label => label.startsWith('Insuficiencia cardíaca')),
    ).toEqual(['Insuficiencia cardíaca con FE reducida']);

    for (const label of orphans) {
      expect(isDiagnosisEnabled(label, [], DEPS))
        .withContext(`merged deps: ${label}`)
        .toBe(true);
    }
  });

  it('un dep en el mapa sin classes ni ids no bloquea (no-gateado)', () => {
    const deps = {
      ...buildDxDependencies(ALL_CRITERIA, {}),
      'Insuficiencia cardíaca con FE reducida': { classes: [], tooltip: '' },
    };
    expect(hasEffectiveDxTriggers(deps['Insuficiencia cardíaca con FE reducida'])).toBe(false);
    expect(isDiagnosisEnabled('Insuficiencia cardíaca con FE reducida', [], deps)).toBe(true);
  });

  it('el mapa merged no incluye entradas con triggers vacíos', () => {
    const emptyTriggerLabels = Object.entries(DEPS)
      .filter(([, dep]) => !hasEffectiveDxTriggers(dep))
      .map(([label]) => label);
    expect(emptyTriggerLabels).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TAREA A — overrides infra-gateados: clases faltantes validadas contra STOPP
// ─────────────────────────────────────────────────────────────────────────────
// Los snapshots anteriores fijaban el comportamiento infra-gateado del piloto
// CV. Las clases añadidas aquí están directamente respaldadas por un criterio
// STOPP existente en criteria.json (ver ID entre paréntesis).

describe('Tarea A — Bradicardia: falta INHIBIDOR_ACETILCOLINESTERASA (D17)', () => {
  it('donepezilo (INHIBIDOR_ACETILCOLINESTERASA) habilita Bradicardia', () => {
    const meds = [med('Donepezilo', ['INHIBIDOR_ACETILCOLINESTERASA'])];
    expect(isDiagnosisEnabled('Bradicardia', meds, DEPS)).toBe(true);
  });

  it('Bradicardia sigue deshabilitada sin medicación relevante', () => {
    const meds = [med('Enalapril', ['IECA'])];
    expect(isDiagnosisEnabled('Bradicardia', meds, DEPS)).toBe(false);
  });
});

describe('Tarea A — Bloqueo AV de segundo grado: faltan BETABLOQUEANTE (D4) e INHIBIDOR_ACETILCOLINESTERASA (D17)', () => {
  it('betabloqueante habilita Bloqueo AV de segundo grado', () => {
    const meds = [med('Bisoprolol', ['BETABLOQUEANTE'])];
    expect(isDiagnosisEnabled('Bloqueo AV de segundo grado', meds, DEPS)).toBe(true);
  });

  it('IACE habilita Bloqueo AV de segundo grado', () => {
    const meds = [med('Rivastigmina', ['INHIBIDOR_ACETILCOLINESTERASA'])];
    expect(isDiagnosisEnabled('Bloqueo AV de segundo grado', meds, DEPS)).toBe(true);
  });

  it('Bloqueo AV de segundo grado sigue deshabilitado sin medicación relevante', () => {
    const meds = [med('Enalapril', ['IECA'])];
    expect(isDiagnosisEnabled('Bloqueo AV de segundo grado', meds, DEPS)).toBe(false);
  });
});

describe('Tarea A — Bloqueo AV completo: faltan BETABLOQUEANTE (D4) e INHIBIDOR_ACETILCOLINESTERASA (D17)', () => {
  it('betabloqueante habilita Bloqueo AV completo', () => {
    const meds = [med('Metoprolol', ['BETABLOQUEANTE'])];
    expect(isDiagnosisEnabled('Bloqueo AV completo', meds, DEPS)).toBe(true);
  });

  it('IACE habilita Bloqueo AV completo', () => {
    const meds = [med('Galantamina', ['INHIBIDOR_ACETILCOLINESTERASA'])];
    expect(isDiagnosisEnabled('Bloqueo AV completo', meds, DEPS)).toBe(true);
  });
});

describe('Tarea A — HTA grave: clases faltantes (H2, D3, K9, C2, I6)', () => {
  it('AINE habilita HTA grave (H2)', () => {
    expect(isDiagnosisEnabled('HTA grave', [med('Ibuprofeno', ['AINE'])], DEPS)).toBe(true);
  });

  it('ISRN habilita HTA grave (D3)', () => {
    expect(isDiagnosisEnabled('HTA grave', [med('Venlafaxina', ['ISRN'])], DEPS)).toBe(true);
  });

  it('alfabloqueante habilita HTA grave (K9)', () => {
    expect(isDiagnosisEnabled('HTA grave', [med('Tamsulosina', ['ALFABLOQUEANTE'])], DEPS)).toBe(true);
  });

  it('antiagregante habilita HTA grave (C2)', () => {
    expect(isDiagnosisEnabled('HTA grave', [med('Clopidogrel', ['ANTIAGREGANTE'])], DEPS)).toBe(true);
  });

  it('anticoagulante habilita HTA grave (C2)', () => {
    expect(isDiagnosisEnabled('HTA grave', [med('Apixaban', ['ANTICOAGULANTE'])], DEPS)).toBe(true);
  });

  it('agonista beta3 habilita HTA grave (I6)', () => {
    expect(isDiagnosisEnabled('HTA grave', [med('Mirabegrón', ['AGONISTA_BETA3'])], DEPS)).toBe(true);
  });

  it('HTA grave sigue deshabilitada sin medicación relevante', () => {
    expect(isDiagnosisEnabled('HTA grave', [med('Enalapril', ['IECA'])], DEPS)).toBe(false);
  });
});

describe('Tarea A — HTA moderada: clases faltantes (H2, K9)', () => {
  it('AINE habilita HTA moderada (H2)', () => {
    expect(isDiagnosisEnabled('HTA moderada', [med('Naproxeno', ['AINE'])], DEPS)).toBe(true);
  });

  it('alfabloqueante habilita HTA moderada (K9)', () => {
    expect(isDiagnosisEnabled('HTA moderada', [med('Doxazosina', ['ALFABLOQUEANTE'])], DEPS)).toBe(true);
  });

  it('HTA moderada sigue deshabilitada sin medicación relevante', () => {
    expect(isDiagnosisEnabled('HTA moderada', [med('Enalapril', ['IECA'])], DEPS)).toBe(false);
  });
});

describe('Tarea A — HTA no complicada: falta ALFABLOQUEANTE (K9)', () => {
  it('alfabloqueante habilita HTA no complicada (K9)', () => {
    expect(isDiagnosisEnabled('HTA no complicada', [med('Tamsulosina', ['ALFABLOQUEANTE'])], DEPS)).toBe(true);
  });

  it('HTA no complicada sigue deshabilitada sin medicación relevante', () => {
    expect(isDiagnosisEnabled('HTA no complicada', [med('Enalapril', ['IECA'])], DEPS)).toBe(false);
  });
});

describe('Tarea A — IC con función sistólica conservada e IC NYHA III-IV: falta TIAZOLIDINDIONA (J2)', () => {
  it('tiazolidindiona habilita IC con función sistólica conservada (J2)', () => {
    const meds = [med('Pioglitazona', ['TIAZOLIDINDIONA'])];
    expect(isDiagnosisEnabled('Insuficiencia cardíaca con función sistólica conservada', meds, DEPS)).toBe(true);
  });

  it('tiazolidindiona habilita IC NYHA III-IV (J2)', () => {
    const meds = [med('Pioglitazona', ['TIAZOLIDINDIONA'])];
    expect(isDiagnosisEnabled('Insuficiencia cardíaca NYHA III-IV', meds, DEPS)).toBe(true);
  });
});

describe('Tarea A — E2E: paciente con único fármaco IACE puede seleccionar Bradicardia', () => {
  it('caso completo: solo donepezilo → Bradicardia disponible (D17 puede disparar)', () => {
    const meds = [med('Donepezilo', ['INHIBIDOR_ACETILCOLINESTERASA'])];
    expect(isDiagnosisEnabled('Bradicardia', meds, DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Bloqueo AV de segundo grado', meds, DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Bloqueo AV completo', meds, DEPS)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TAREA B — excludes.drugClasses no debe inflar el gating
// ─────────────────────────────────────────────────────────────────────────────

describe('Tarea B — excludes.drugClasses no cambia el mapa derivado para labels no-ancla no-override', () => {
  it('el mapa derivado sin excludes coincide con el mapa derivado con excludes para etiquetas fuera de overrides y anchors', () => {
    const withExcludes = buildDxDependencies(ALL_CRITERIA, {});
    const withoutExcludes = buildDxDependencies(ALL_CRITERIA, {}, { includeExcludeClasses: false });

    const overrideKeys = new Set(Object.keys(DX_DEPENDENCIES_OVERRIDES));

    const labelsToCheck = Object.keys(DIAGNOSIS_MAP).filter(
      label => !ANCHOR_LABELS_APPLIED_FOR_GATING.has(label) && !overrideKeys.has(label),
    );

    for (const label of labelsToCheck) {
      const withCls = withExcludes[label]?.classes ?? [];
      const withoutCls = withoutExcludes[label]?.classes ?? [];
      expect(withoutCls.sort()).withContext(`label: ${label}`).toEqual(withCls.sort());
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TAREA C — extractDrugClasses no extrae clases dentro de ramas negadas
// ─────────────────────────────────────────────────────────────────────────────

describe('Tarea C — extractDrugClasses respeta negación', () => {
  it('no extrae inDrugClass dentro de una rama negada con !', () => {
    const logic = {
      and: [
        { inDrugClass: ['AINE', { var: 'medications' }] },
        { '!': { inDrugClass: ['ESTATINA', { var: 'medications' }] } },
      ],
    };
    const classes = extractDrugClasses(logic);
    expect([...classes]).toContain('AINE');
    expect([...classes]).not.toContain('ESTATINA');
  });

  it('no extrae inDrugClass dentro de una rama negada con not', () => {
    const logic = {
      not: { inDrugClass: ['BETABLOQUEANTE', { var: 'medications' }] },
    };
    const classes = extractDrugClasses(logic);
    expect([...classes]).not.toContain('BETABLOQUEANTE');
  });

  it('extrae clases en ramas positivas aunque haya ramas negadas hermanas', () => {
    const logic = {
      and: [
        { inDrugClass: ['DIGOXINA', { var: 'medications' }] },
        { not: { inDrugClass: ['DIURETICO_ASA', { var: 'medications' }] } },
      ],
    };
    const classes = extractDrugClasses(logic);
    expect([...classes]).toContain('DIGOXINA');
    expect([...classes]).not.toContain('DIURETICO_ASA');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TAREA D — guard de integridad de overrides
// ─────────────────────────────────────────────────────────────────────────────

describe('Tarea D — validateOverrideLabels detecta labels desconocidos', () => {
  it('no lanza con los overrides reales (todos los labels existen en DIAGNOSIS_MAP)', () => {
    expect(() => validateOverrideLabels(DX_DEPENDENCIES_OVERRIDES, DIAGNOSIS_MAP)).not.toThrow();
  });

  it('lanza si un override tiene un label que no está en DIAGNOSIS_MAP', () => {
    const badOverride = { 'Label inexistente en DIAGNOSIS_MAP': { classes: ['X'], tooltip: '' } };
    expect(() => validateOverrideLabels(badOverride, DIAGNOSIS_MAP)).toThrowError(/Label inexistente/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TAREA E — isAlwaysEnabled unifica los tres caminos de "siempre habilitado"
// ─────────────────────────────────────────────────────────────────────────────

describe('Tarea E — isAlwaysEnabled', () => {
  it('ancla non-doubtful está siempre habilitada', () => {
    expect(isAlwaysEnabled('Demencia', DEPS)).toBe(true);
    expect(isAlwaysEnabled('FA', DEPS)).toBe(true);
    expect(isAlwaysEnabled('Fragilidad', DEPS)).toBe(true);
  });

  it('Diabetes mellitus es ancla aplicada (sigue siempre habilitada tras STOPP-J1)', () => {
    expect(ANCHOR_LABELS_APPLIED_FOR_GATING.has('Diabetes mellitus')).toBe(true);
    expect(isAlwaysEnabled('Diabetes mellitus', DEPS)).toBe(true);
  });

  it('diagnóstico puro-START (no en STOPP, no ancla) está siempre habilitado', () => {
    expect(isAlwaysEnabled('Osteoporosis', DEPS)).toBe(true);
  });

  it('Incontinencia urinaria de urgencia se habilita con solifenacina (K12)', () => {
    const meds = [med('Solifenacina', ['ANTICOLINERGICO', 'ANTIESPASMÓDICO_URINARIO'])];
    expect(isDiagnosisEnabled('Incontinencia urinaria de urgencia', meds, DEPS)).toBe(true);
    expect(isDiagnosisEnabled('Vejiga hiperactiva', meds, DEPS)).toBe(true);
  });

  it('diagnóstico gateado NO está siempre habilitado', () => {
    expect(isAlwaysEnabled('Bradicardia', DEPS)).toBe(false);
    expect(isAlwaysEnabled('Insuficiencia cardíaca con función sistólica conservada', DEPS)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGUIMIENTO TAREA B — infra-gatings destapados por el diff de excludes
// Las clases añadidas están respaldadas por un criterio STOPP (ID entre paréntesis)
// aunque ese criterio referencie el dx vía excludes, no vía lógica positiva directa.
// ─────────────────────────────────────────────────────────────────────────────

describe('Seguimiento B — Riesgo significativo de sangrado: ANTIAGREGANTE y ANTICOAGULANTE (C2)', () => {
  it('clopidogrel (ANTIAGREGANTE) habilita Riesgo significativo de sangrado (C2-ANTIAGREGANTE)', () => {
    const meds = [med('Clopidogrel', ['ANTIAGREGANTE'])];
    expect(isDiagnosisEnabled('Riesgo significativo de sangrado', meds, DEPS)).toBe(true);
  });

  it('apixaban (ANTICOAGULANTE) habilita Riesgo significativo de sangrado (C2-AVK)', () => {
    const meds = [med('Apixaban', ['ANTICOAGULANTE'])];
    expect(isDiagnosisEnabled('Riesgo significativo de sangrado', meds, DEPS)).toBe(true);
  });

  it('Riesgo significativo de sangrado sigue deshabilitado sin medicación relevante', () => {
    expect(isDiagnosisEnabled('Riesgo significativo de sangrado', [med('Enalapril', ['IECA'])], DEPS)).toBe(false);
  });
});

describe('Seguimiento B — Riesgo de caídas de repetición: ANTIDEPRESIVO_TRICICLICO e ISRN (K8)', () => {
  it('amitriptilina (ANTIDEPRESIVO_TRICICLICO) habilita Riesgo de caídas de repetición (K8)', () => {
    const meds = [med('Amitriptilina', ['ANTIDEPRESIVO_TRICICLICO'])];
    expect(isDiagnosisEnabled('Riesgo de caídas de repetición', meds, DEPS)).toBe(true);
  });

  it('venlafaxina (ISRN) habilita Riesgo de caídas de repetición (K8)', () => {
    const meds = [med('Venlafaxina', ['ISRN'])];
    expect(isDiagnosisEnabled('Riesgo de caídas de repetición', meds, DEPS)).toBe(true);
  });

  it('Riesgo de caídas de repetición sigue deshabilitado sin medicación relevante', () => {
    expect(isDiagnosisEnabled('Riesgo de caídas de repetición', [med('Enalapril', ['IECA'])], DEPS)).toBe(false);
  });
});
