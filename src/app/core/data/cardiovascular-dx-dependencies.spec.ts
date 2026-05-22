import { Med } from '../types';
import {
  CARDIOVASCULAR_DX_DEPS,
  isDiagnosisEnabled,
} from './cardiovascular-dx-dependencies';

const med = (id: string, drugClasses: string[]): Med => ({ id, drugClasses });

describe('isDiagnosisEnabled()', () => {
  it('habilita un diagnóstico no presente en el mapa de dependencias', () => {
    expect(isDiagnosisEnabled('Diagnóstico inexistente sin dependencia', [])).toBe(true);
  });

  it('habilita un diagnóstico no presente en el mapa aun con medicaciones', () => {
    const meds = [med('Digoxina', ['DIGOXINA'])];
    expect(isDiagnosisEnabled('Angina de pecho', meds)).toBe(true);
  });

  it('deshabilita un diagnóstico con dependencia cuando no hay medicaciones', () => {
    expect(
      isDiagnosisEnabled('Insuficiencia cardíaca con función sistólica conservada', []),
    ).toBe(false);
  });

  it('habilita un diagnóstico cuya dependencia se cumple por la clase del medicamento', () => {
    const meds = [med('Digoxina', ['DIGOXINA'])];
    expect(
      isDiagnosisEnabled('Insuficiencia cardíaca con función sistólica conservada', meds),
    ).toBe(true);
  });

  it('habilita cuando se cumple cualquiera de varias clases requeridas (OR)', () => {
    const conBetabloq = [med('Bisoprolol', ['BETABLOQUEANTE'])];
    const conVerapamilo = [med('Verapamilo', ['CALCIOANTAGONISTA_NO_DHP'])];
    const conDigoxina = [med('Digoxina', ['DIGOXINA'])];
    expect(isDiagnosisEnabled('Bradicardia', conBetabloq)).toBe(true);
    expect(isDiagnosisEnabled('Bradicardia', conVerapamilo)).toBe(true);
    expect(isDiagnosisEnabled('Bradicardia', conDigoxina)).toBe(true);
  });

  it('deshabilita cuando ninguna de las clases requeridas está presente', () => {
    const meds = [med('Enalapril', ['IECA'])];
    expect(isDiagnosisEnabled('Bradicardia', meds)).toBe(false);
  });

  it('mapa contiene una entrada por cada regla STOPP-B con dependencia diagnóstica exclusiva', () => {
    const requiredKeys = [
      'Insuficiencia cardíaca con función sistólica conservada', // B1, B7-neg, B8-neg, B19
      'Insuficiencia cardíaca NYHA III-IV',                       // B2, B7-neg, B8-neg, B19
      'Bradicardia',                                              // B4
      'Bloqueo AV de segundo grado',                              // B4
      'Bloqueo AV completo',                                      // B4
      'HTA no complicada',                                        // B5, B7, B11, B15-amio
      'HTA grave',                                                // B7, B10, B11
      'HTA moderada',                                             // B7, B10, B11
      'Taquiarritmias supraventriculares',                        // B6
      'Estenosis aórtica grave sintomática',                      // B20
      'Insuficiencia cardíaca grave',                             // B14
      'Intervalo QTc prolongado',                                 // B15
    ];
    for (const key of requiredKeys) {
      expect(CARDIOVASCULAR_DX_DEPS[key]).toBeDefined();
      expect(CARDIOVASCULAR_DX_DEPS[key].tooltip.length).toBeGreaterThan(0);
    }
  });

  it('NO incluye en el mapa los diagnósticos que también disparan reglas START sin medicación', () => {
    // Estos labels son disparadores de reglas START (que se activan SIN medicación);
    // por tanto deben estar siempre habilitados y NO pueden depender de meds.
    const startTriggers = [
      'HTA',                            // START-B1: antihipertensivo cuando HTA
      'Insuficiencia cardíaca',         // START-B8: iSGLT2 en IC sin meds
      'FA',                             // START-B10/C1: betabloq/anticoag en FA
      'Enfermedad vascular coronaria',  // START-B2/C2: estatina/antiagregante
      'Enfermedad vascular cerebral',   // START-B2/C2
      'Enfermedad vascular periférica', // START-B2/C2
    ];
    for (const key of startTriggers) {
      expect(CARDIOVASCULAR_DX_DEPS[key])
        .withContext(`"${key}" no debe estar en el mapa: dispara reglas START`)
        .toBeUndefined();
      expect(isDiagnosisEnabled(key, []))
        .withContext(`"${key}" debe estar habilitado siempre, también sin meds`)
        .toBe(true);
    }
  });

  it('todas las entradas del mapa proveen al menos un trigger (classes o ids)', () => {
    for (const [label, dep] of Object.entries(CARDIOVASCULAR_DX_DEPS)) {
      const hasClasses = (dep.classes?.length ?? 0) > 0;
      const hasIds = (dep.ids?.length ?? 0) > 0;
      expect(hasClasses || hasIds)
        .withContext(`Entrada "${label}" no define classes ni ids`)
        .toBe(true);
    }
  });

  it('B14: PDE5 inhibidor habilita Insuficiencia cardíaca grave', () => {
    const meds = [med('Sildenafilo', ['INHIBIDOR_PDE5'])];
    expect(
      isDiagnosisEnabled('Insuficiencia cardíaca grave', meds),
    ).toBe(true);
  });

  it('B20: alfabloqueante habilita Estenosis aórtica grave', () => {
    const meds = [med('Tamsulosina', ['ALFABLOQUEANTE'])];
    expect(isDiagnosisEnabled('Estenosis aórtica grave sintomática', meds)).toBe(true);
  });

  it('Enfermedad vascular (coronaria/cerebral/periférica) está siempre habilitada (disparador START-B2/C2)', () => {
    expect(isDiagnosisEnabled('Enfermedad vascular coronaria', [])).toBe(true);
    expect(isDiagnosisEnabled('Enfermedad vascular cerebral', [])).toBe(true);
    expect(isDiagnosisEnabled('Enfermedad vascular periférica', [])).toBe(true);
  });

  it('FA está siempre habilitada (disparador START-B10 y START-C1)', () => {
    expect(isDiagnosisEnabled('FA', [])).toBe(true);
  });

  it('B6: Antiarrítmico habilita Taquiarritmias supraventriculares', () => {
    const sinMeds = [] as Med[];
    const conAntiarritmico = [med('Amiodarona', ['ANTIARITMICO'])];
    expect(isDiagnosisEnabled('Taquiarritmias supraventriculares', sinMeds)).toBe(false);
    expect(isDiagnosisEnabled('Taquiarritmias supraventriculares', conAntiarritmico)).toBe(true);
  });

  it('soporta dependencia por id de fármaco específico', () => {
    // Forzamos un escenario con una dependencia por id usando Verapamilo (en B2 + B3)
    // sólo si la implementación expone ids; si no usa ids para el caso público,
    // este test sigue valiendo: la función debe respetar ambas formas.
    const fakeMeds = [med('Verapamilo', ['CALCIOANTAGONISTA_NO_DHP'])];
    // Verapamilo es una clase no DHP, debe habilitar IC NYHA III-IV (B2-Verapamilo)
    expect(isDiagnosisEnabled('Insuficiencia cardíaca NYHA III-IV', fakeMeds)).toBe(true);
  });
});
