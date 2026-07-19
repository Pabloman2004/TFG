import { CriteriaEngineService } from './criteria-engine.service';
import {
  aine,
  crit,
  makeCase,
  makeMed,
  setupEngine,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección H (Sistema musculoesquelético)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  const expectActive = (id: string, diagnoses: string[], medications: ReturnType<typeof makeMed>[]) => {
    expect(engine.evaluate(makeCase({ diagnoses, medications }), [crit(id)]).length).toBe(1);
  };

  it('verifica H1–H5', () => {
    expectActive('STOPP-H1-AINE-ULCERA-HEMORRAGIA', ['antecedentes_ulcera_peptica'], [aine()]);
    expectActive('STOPP-H2-AINE-HIPERTENSION-GRAVE', ['hipertension_grave'], [aine()]);
    expectActive('STOPP-H3-AINE-ARTRITIS-ARTROSIS', ['artrosis'], [aine()]);
    expectActive('STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE', ['artritis_reumatoide'], [
      makeMed('Prednisona', ['CORTICOIDE_SISTEMICO'], { durationDays: 91 }),
    ]);
    expectActive('STOPP-H5-CORTICOIDE-ARTROSIS', ['artrosis'], [
      makeMed('Prednisona', ['CORTICOIDE_SISTEMICO']),
    ]);
  });

  it('H4 no dispara con corticoide ≤ 3 meses en AR', () => {
    const c = crit('STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE');
    expect(engine.evaluate(makeCase({
      diagnoses: ['artritis_reumatoide'],
      medications: [makeMed('Prednisona', ['CORTICOIDE_SISTEMICO'], { durationDays: 90 })],
    }), [c])).toEqual([]);
  });

  it('START-H2 no dispara con corticoide oral a corto plazo', () => {
    const c = crit('START-H2-BIFOSFONATO-VITAMINA-D-CORTICOIDE');
    expect(engine.evaluate(makeCase({
      medications: [makeMed('Prednisona', ['CORTICOIDE_SISTEMICO'], { durationDays: 5 })],
    }), [c])).toEqual([]);
  });

  it('START-H2 dispara con corticoide >90 días sin protección ósea', () => {
    const c = crit('START-H2-BIFOSFONATO-VITAMINA-D-CORTICOIDE');
    expect(engine.evaluate(makeCase({
      medications: [makeMed('Prednisona', ['CORTICOIDE_SISTEMICO'], { durationDays: 91 })],
    }), [c]).length).toBe(1);
  });

  it('H6 dispara con AINE o colchicina y gota recurrente', () => {
    const c = crit('STOPP-H6-AINE-COLCHICINA-GOTA-CRONICA');

    expect(engine.evaluate(makeCase({
      diagnoses: ['gota_recurrente'],
      medications: [aine()],
    }), [c]).length).toBe(1);
    expect(engine.evaluate(makeCase({
      diagnoses: ['gota_recurrente'],
      medications: [makeMed('Colchicina', ['COLCHICINA'])],
    }), [c]).length).toBe(1);
  });

  it('verifica H7–H9', () => {
    expectActive('STOPP-H7-AINE-CORTICOIDES', ['artritis'], [
      aine(),
      makeMed('Prednisona', ['CORTICOIDE_SISTEMICO']),
    ]);
    expectActive('STOPP-H8-BIFOSFONATO-ENFERMEDAD-DIGESTIVA-ALTA', ['disfagia'], [
      makeMed('Alendronato', ['BIFOSFONATO']),
    ]);
    expectActive('STOPP-H9-OPIOIDE-ARTROSIS', ['artrosis'], [
      makeMed('Morfina', ['OPIOIDE']),
    ]);
  });
});
