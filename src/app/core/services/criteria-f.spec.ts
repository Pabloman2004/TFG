import { CriteriaEngineService } from './criteria-engine.service';
import {
  ALL_CRITERIA,
  crit,
  makeCase,
  makeMed,
  neuroleptico,
  setupEngine,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección F (Sistema gastrointestinal)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  it('F1 dispara con procinético y parkinsonismo', () => {
    const patient = makeCase({
      diagnoses: ['parkinsonismo'],
      medications: [makeMed('Proclorperazina', ['PROCINETICO'])],
    });
    expect(engine.evaluate(patient, [crit('STOPP-F1-PROCINETICO-PARKINSONISMO')]).length).toBe(1);
  });

  it('F1 dispara también con Enfermedad de Parkinson (es un parkinsonismo)', () => {
    const patient = makeCase({
      diagnoses: ['parkinson'],
      medications: [makeMed('Proclorperazina', ['PROCINETICO'])],
    });
    expect(engine.evaluate(patient, [crit('STOPP-F1-PROCINETICO-PARKINSONISMO')]).length).toBe(1);
  });

  it('F1 dispara también con parkinsonismo inducido por fármacos', () => {
    const patient = makeCase({
      diagnoses: ['parkinsonismo_inducido_por_farmacos'],
      medications: [makeMed('Proclorperazina', ['PROCINETICO'])],
    });
    expect(engine.evaluate(patient, [crit('STOPP-F1-PROCINETICO-PARKINSONISMO')]).length).toBe(1);
  });

  it('F2 exige más de ocho semanas de IBP', () => {
    const c = crit('STOPP-F2-IBP-TRATAMIENTO-PROLONGADO');
    const patient = (durationDays: number) => makeCase({
      medications: [makeMed('Omeprazol', ['IBP'], { durationDays })],
    });

    expect(engine.evaluate(patient(56), [c])).toEqual([]);
    expect(engine.evaluate(patient(57), [c]).length).toBe(1);
  });

  it('F3 dispara con verapamilo y estreñimiento crónico', () => {
    const patient = makeCase({
      diagnoses: ['estrenimiento_cronico'],
      medications: [makeMed('Verapamilo', ['CALCIOANTAGONISTA_NO_DHP'])],
    });
    expect(engine.evaluate(patient, [crit('STOPP-F3-FARMACOS-ESTRENIMIENTO')]).length).toBe(1);
  });

  it('F3 summary no promete antiácidos con aluminio (clase inexistente)', () => {
    const summary = crit('STOPP-F3-FARMACOS-ESTRENIMIENTO').summary.toLowerCase();
    expect(summary).not.toContain('aluminio');
    expect(summary).not.toContain('antiácido');
  });

  it('F4 solo dispara por encima de 200 mg diarios de hierro elemental', () => {
    const c = crit('STOPP-F4-HIERRO-ORAL-DOSIS-ALTA');
    const patient = (doseMgDay: number) => makeCase({
      medications: [makeMed('Sulfato ferroso', ['HIERRO_ORAL'], { doseMgDay })],
    });

    expect(engine.evaluate(patient(200), [c])).toEqual([]);
    expect(engine.evaluate(patient(201), [c]).length).toBe(1);
  });

  it('F5 exige corticoide y antecedente ulceroso o esofagitis erosiva, sin IBP', () => {
    const c = crit('STOPP-F5-CORTICOIDE-ULCERA-PEPTICA');
    const ulcer = ['antecedentes_ulcera_peptica'];
    const steroid = makeMed('Prednisona', ['CORTICOIDE_SISTEMICO']);

    expect(engine.evaluate(makeCase({ diagnoses: ulcer }), [c])).toEqual([]);
    expect(engine.evaluate(makeCase({ diagnoses: ulcer, medications: [steroid] }), [c]).length).toBe(1);
    expect(engine.evaluate(makeCase({
      diagnoses: ['esofagitis_erosiva'],
      medications: [steroid],
    }), [c]).length).toBe(1);
    expect(engine.evaluate(makeCase({
      diagnoses: ulcer,
      medications: [steroid, makeMed('Omeprazol', ['IBP'])],
    }), [c])).toEqual([]);
  });

  it('F6 genera una sola alerta para cada antiagregante o AVK y ninguna para AOD', () => {
    const criteria = ALL_CRITERIA.filter(c => c.id.startsWith('STOPP-F6-'));
    const evaluate = (medication: ReturnType<typeof makeMed>) => engine.evaluate(makeCase({
      diagnoses: ['antecedentes_evag'],
      medications: [medication],
    }), criteria);

    expect(evaluate(makeMed('Ticagrelor', ['ANTIAGREGANTE'])).length).toBe(1);
    expect(evaluate(makeMed('Ticlopidina', ['ANTIAGREGANTE', 'TICLOPIDINA'])).length).toBe(1);
    expect(evaluate(makeMed('Warfarina', ['ANTICOAGULANTE', 'ANTICOAGULANTE_AVK'])).length).toBe(1);
    expect(evaluate(makeMed('Apixaban', ['ANTICOAGULANTE', 'ANTICOAGULANTE_DIRECTO']))).toEqual([]);
  });

  it('F7 y F8 permanecen activos', () => {
    expect(engine.evaluate(makeCase({
      diagnoses: ['disfagia'],
      medications: [neuroleptico()],
    }), [crit('STOPP-F7-NEUROLEPTICO-DISFAGIA')]).length).toBe(1);
    expect(engine.evaluate(makeCase({
      medications: [makeMed('Acetato de megestrol', ['OREXICO'])],
    }), [crit('STOPP-F8-MEGESTROL-OREXIGENO')]).length).toBe(1);
  });
});
