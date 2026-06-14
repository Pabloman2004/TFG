import { Med } from '../types';
import { ALL_CRITERIA } from '../services/criteria-test-helpers';
import { ANCHOR_LABELS_APPLIED_FOR_GATING } from './dx-anchor-labels-candidate';
import { DX_DEPENDENCIES_OVERRIDES } from './dx-dependencies-overrides';
import {
  buildDxDependencies,
  extractDrugClasses,
  extractPositiveDxCodes,
  isDiagnosisEnabled,
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
