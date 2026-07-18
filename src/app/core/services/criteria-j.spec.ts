import { CriteriaEngineService } from './criteria-engine.service';
import {
  crit,
  makeCase,
  makeMed,
  setupEngine,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección J (Sistema endocrino)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('STOPP-J3-BETABLOQUEANTE-DIABETES-HIPOGLUCEMIA', () => {
    const id = 'STOPP-J3-BETABLOQUEANTE-DIABETES-HIPOGLUCEMIA';
    const dx = ['diabetes_hipoglucemias_frecuentes'];

    it('no dispara con bisoprolol cardioselectivo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [makeMed('Bisoprolol', ['BETABLOQUEANTE', 'BETABLOQUEANTE_CARDIOSELECTIVO'])],
      }), [crit(id)])).toEqual([]);
    });

    it('dispara con carvedilol no cardioselectivo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [makeMed('Carvedilol', ['BETABLOQUEANTE', 'BETABLOQUEANTE_NO_CARDIOSELECTIVO'])],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con propranolol no cardioselectivo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [makeMed('Propranolol', ['BETABLOQUEANTE', 'BETABLOQUEANTE_NO_CARDIOSELECTIVO'])],
      }), [crit(id)]).length).toBe(1);
    });
  });
});
