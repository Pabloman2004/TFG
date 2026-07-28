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
      makeMed('Prednisona', ['CORTICOIDE_SISTEMICO']),
    ]);
    expectActive('STOPP-H5-CORTICOIDE-ARTROSIS', ['artrosis'], [
      makeMed('Prednisona', ['CORTICOIDE_SISTEMICO']),
    ]);
  });

  it('H4 no dispara sin artritis reumatoide', () => {
    const c = crit('STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE');
    expect(engine.evaluate(makeCase({
      medications: [makeMed('Prednisona', ['CORTICOIDE_SISTEMICO'])],
    }), [c])).toEqual([]);
  });

  it('H4 summary menciona > 3 meses', () => {
    expect(crit('STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE').summary.toLowerCase())
      .toMatch(/3 meses|> 3/);
  });

  it('START-H2 no dispara sin corticoide', () => {
    const c = crit('START-H2-BIFOSFONATO-VITAMINA-D-CORTICOIDE');
    expect(engine.evaluate(makeCase({ medications: [] }), [c])).toEqual([]);
  });

  it('START-H2 dispara con corticoide sin protección ósea (sin duración)', () => {
    const c = crit('START-H2-BIFOSFONATO-VITAMINA-D-CORTICOIDE');
    expect(engine.evaluate(makeCase({
      medications: [makeMed('Prednisona', ['CORTICOIDE_SISTEMICO'])],
    }), [c]).length).toBe(1);
    expect(c.summary.toLowerCase()).toMatch(/largo plazo|prolongad/);
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

  describe('START-H5-VITAMINA-D-DEFICIT-CAIDAS-OSTEOPENIA', () => {
    const c = crit('START-H5-VITAMINA-D-DEFICIT-CAIDAS-OSTEOPENIA');

    it('no dispara con caídas de repetición sin déficit confirmado', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['caidas_repeticion'] }), [c])).toEqual([]);
    });

    it('no dispara con osteopenia sin déficit confirmado', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['osteopenia'] }), [c])).toEqual([]);
    });

    it('no dispara con déficit de vitamina D sin factor de riesgo', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['deficit_vitamina_d'] }), [c])).toEqual([]);
    });

    it('dispara con déficit confirmado + caídas de repetición', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['deficit_vitamina_d', 'caidas_repeticion'],
      }), [c]).length).toBe(1);
    });

    it('dispara con déficit confirmado + osteopenia', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['deficit_vitamina_d', 'osteopenia'],
      }), [c]).length).toBe(1);
    });

    it('dispara con déficit confirmado + no sale de casa', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['deficit_vitamina_d', 'no_sale_de_casa'],
      }), [c]).length).toBe(1);
    });

    it('no dispara si ya recibe vitamina D', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['deficit_vitamina_d', 'caidas_repeticion'],
        medications: [makeMed('Colecalciferol', ['VITAMINA_D'])],
      }), [c])).toEqual([]);
    });
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

describe('Criterios START — Sección H: retirada de tratamiento óseo', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  const bifosfonato = () => makeMed('Alendronato', ['BIFOSFONATO', 'ANTIRRESORTIVO']);

  describe('START-H6-ANTIRRESORTIVO-TRAS-RETIRADA-DENOSUMAB', () => {
    const id = 'START-H6-ANTIRRESORTIVO-TRAS-RETIRADA-DENOSUMAB';

    it('dispara tras retirar denosumab si no hay antirresortivo de relevo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['retirada_denosumab'],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe un antirresortivo de relevo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['retirada_denosumab'],
        medications: [bifosfonato()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara por tener osteoporosis sin retirada de denosumab', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['osteoporosis'] }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-H7-ANTIRRESORTIVO-TRAS-RETIRADA-ANABOLIZANTE-OSEO', () => {
    const id = 'START-H7-ANTIRRESORTIVO-TRAS-RETIRADA-ANABOLIZANTE-OSEO';

    it('dispara tras retirar teriparatida/abaloparatida sin antirresortivo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['retirada_anabolizante_oseo'],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe un antirresortivo de consolidación', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['retirada_anabolizante_oseo'],
        medications: [bifosfonato()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara mientras sigue con el anabolizante óseo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['osteoporosis'],
        medications: [makeMed('Teriparatida', ['ANABOLIZANTE_OSEO'])],
      }), [crit(id)])).toEqual([]);
    });
  });
});
