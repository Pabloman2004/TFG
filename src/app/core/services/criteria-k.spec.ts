import { CriteriaEngineService } from './criteria-engine.service';
import {
  ALL_CRITERIA,
  antihipertCentral,
  benzo,
  crit,
  makeCase,
  makeMed,
  setupEngine,
} from './criteria-test-helpers';

const CAIDAS = 'caidas_repeticion';
const RIESGO_CAIDAS = 'riesgo_caidas_repeticion';

const logicText = (logic: unknown): string => JSON.stringify(logic ?? {});

const sectionKCriteria = () =>
  ALL_CRITERIA.filter(c => c.id.startsWith('STOPP-K'));

describe('Criterios STOPP — Sección K (Riesgo de caídas)', () => {
  describe('A9 — códigos de caídas de repetición', () => {
    it('ningún criterio K referencia solo uno de caidas_repeticion / riesgo_caidas_repeticion', () => {
      const soloUno = sectionKCriteria().filter(c => {
        const text = logicText(c.logic);
        const hasCaidas = text.includes(`"${CAIDAS}"`);
        const hasRiesgo = text.includes(`"${RIESGO_CAIDAS}"`);
        return (hasCaidas || hasRiesgo) && !(hasCaidas && hasRiesgo);
      });

      expect(soloUno.map(c => c.id)).toEqual([]);
    });
  });

  describe('comportamiento con ambos códigos', () => {
    let engine: CriteriaEngineService;

    beforeEach(() => { engine = setupEngine(); });

    describe('STOPP-K1-BENZODIACEPINA-CAIDAS', () => {
      const id = 'STOPP-K1-BENZODIACEPINA-CAIDAS';

      it('dispara con caidas_repeticion + benzodiacepina', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [benzo()],
        }), [crit(id)]).length).toBe(1);
      });

      it('dispara con riesgo_caidas_repeticion + benzodiacepina', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [RIESGO_CAIDAS],
          medications: [benzo()],
        }), [crit(id)]).length).toBe(1);
      });
    });

    describe('STOPP-K8-PSICOTROPICO-CAIDAS', () => {
      const id = 'STOPP-K8-PSICOTROPICO-CAIDAS';
      const litio = () => makeMed('Litio', ['ESTABILIZADOR_ANIMO', 'PSICOTROPICO']);

      it('dispara con caidas_repeticion + psicotrópico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [litio()],
        }), [crit(id)]).length).toBe(1);
      });

      it('dispara con riesgo_caidas_repeticion + psicotrópico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [RIESGO_CAIDAS],
          medications: [litio()],
        }), [crit(id)]).length).toBe(1);
      });
    });

    describe('STOPP-K11-ANTIHIPERTENSIVO-CENTRAL-CAIDAS', () => {
      const id = 'STOPP-K11-ANTIHIPERTENSIVO-CENTRAL-CAIDAS';

      it('dispara con caidas_repeticion + antihipertensivo central', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [antihipertCentral()],
        }), [crit(id)]).length).toBe(1);
      });

      it('dispara con riesgo_caidas_repeticion + antihipertensivo central', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [RIESGO_CAIDAS],
          medications: [antihipertCentral()],
        }), [crit(id)]).length).toBe(1);
      });
    });
  });
});
