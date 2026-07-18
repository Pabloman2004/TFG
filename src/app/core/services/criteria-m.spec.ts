import { CriteriaEngineService } from './criteria-engine.service';
import {
  adt,
  anticolinergico,
  crit,
  makeCase,
  makeMed,
  neuroleptico,
  setupEngine,
} from './criteria-test-helpers';

const segundoAnticolinergico = () => makeMed('Oxibutinina', ['ANTICOLINERGICO', 'ANTIESPASMÓDICO_URINARIO']);

describe('Criterios STOPP — Sección M (Anticolinérgicos concomitantes)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('STOPP-M1-ADT-ANTICOLINERGICOS', () => {
    const id = 'STOPP-M1-ADT-ANTICOLINERGICOS';

    it('dispara con ADT + otro anticolinérgico (≥2 anticolinérgicos)', () => {
      // ADT ya aporta clase ANTICOLINERGICO; el segundo completa el umbral
      expect(engine.evaluate(makeCase({
        medications: [adt(), segundoAnticolinergico()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara con ADT solo (1 anticolinérgico)', () => {
      expect(engine.evaluate(makeCase({
        medications: [adt()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara con 2 anticolinérgicos sin ADT', () => {
      expect(engine.evaluate(makeCase({
        medications: [anticolinergico(), segundoAnticolinergico()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-M1-NEUROLEPTICO-ANTICOLINERGICOS', () => {
    const id = 'STOPP-M1-NEUROLEPTICO-ANTICOLINERGICOS';

    it('dispara con neuroléptico + ≥2 anticolinérgicos', () => {
      expect(engine.evaluate(makeCase({
        medications: [neuroleptico(), anticolinergico(), segundoAnticolinergico()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara con neuroléptico + 1 anticolinérgico', () => {
      expect(engine.evaluate(makeCase({
        medications: [neuroleptico(), anticolinergico()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara con ≥2 anticolinérgicos sin neuroléptico', () => {
      expect(engine.evaluate(makeCase({
        medications: [anticolinergico(), segundoAnticolinergico()],
      }), [crit(id)])).toEqual([]);
    });
  });
});
