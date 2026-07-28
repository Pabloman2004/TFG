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

  it('F2 dispara al seleccionar IBP sin duración', () => {
    const c = crit('STOPP-F2-IBP-TRATAMIENTO-PROLONGADO');
    const patient = makeCase({ medications: [makeMed('Omeprazol', ['IBP'])] });
    expect(engine.evaluate(patient, [c]).length).toBe(1);
    expect(c.summary.toLowerCase()).toMatch(/8 semanas|más de 8/);
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

  it('F4 dispara al seleccionar hierro oral sin dosis', () => {
    const c = crit('STOPP-F4-HIERRO-ORAL-DOSIS-ALTA');
    const patient = makeCase({ medications: [makeMed('Sulfato ferroso', ['HIERRO_ORAL'])] });
    expect(engine.evaluate(patient, [c]).length).toBe(1);
    expect(c.summary.toLowerCase()).toContain('200 mg');
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

describe('Criterios START — Sección F (Sistema gastrointestinal)', () => {
  let engine: CriteriaEngineService;
  beforeEach(() => { engine = setupEngine(); });

  describe('START-F6-PROBIOTICO-CON-ANTIBIOTICO', () => {
    const id = 'START-F6-PROBIOTICO-CON-ANTIBIOTICO';
    const antibiotico = () => makeMed('Amoxicilina', ['ANTIBIOTICO']);
    const probiotico = () => makeMed('Saccharomyces boulardii', ['PROBIOTICO']);

    it('dispara con antibiótico y sin probiótico', () => {
      expect(engine.evaluate(makeCase({ medications: [antibiotico()] }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya toma un probiótico', () => {
      expect(engine.evaluate(makeCase({
        medications: [antibiotico(), probiotico()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara en inmunocomprometido o gravemente deteriorado (exclusión de la guía)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['inmunocompromiso_deterioro_grave'],
        medications: [antibiotico()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara sin antibiótico', () => {
      expect(engine.evaluate(makeCase({ medications: [] }), [crit(id)])).toEqual([]);
    });
  });
});
