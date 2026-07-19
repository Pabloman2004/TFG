import { CriteriaEngineService } from './criteria-engine.service';
import {
  adt,
  anticolinergico,
  crit,
  makeCase,
  makeMed,
  setupEngine,
} from './criteria-test-helpers';

const oxibutinina = () => makeMed('Oxibutinina', ['ANTICOLINERGICO', 'ANTIESPASMÓDICO_URINARIO']);
const solifenacina = () => makeMed('Solifenacina', ['ANTICOLINERGICO', 'ANTIESPASMÓDICO_URINARIO']);

describe('Criterios STOPP — Sección M (Anticolinérgicos concomitantes)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('STOPP-M1-ANTICOLINERGICOS', () => {
    const id = 'STOPP-M1-ANTICOLINERGICOS';

    it('dispara con oxibutinina + solifenacina (≥2 anticolinérgicos puros)', () => {
      expect(engine.evaluate(makeCase({
        medications: [oxibutinina(), solifenacina()],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con amitriptilina + solifenacina (una sola alerta)', () => {
      const hits = engine.evaluate(makeCase({
        medications: [adt(), solifenacina()],
      }), [crit(id)]);
      expect(hits.length).toBe(1);
      expect(hits[0].id).toBe(id);
    });

    it('no dispara con un solo anticolinérgico', () => {
      expect(engine.evaluate(makeCase({
        medications: [anticolinergico()],
      }), [crit(id)])).toEqual([]);
    });
  });
});
