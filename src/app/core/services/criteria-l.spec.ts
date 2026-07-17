import { CriteriaEngineService } from './criteria-engine.service';
import { crit, makeCase, makeMed, setupEngine } from './criteria-test-helpers';

describe('Criterios STOPP — Sección L (Analgésicos)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA', () => {
    const c = crit('STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA');
    const paraAlta = () => makeMed('Paracetamol', ['ANALGESICO_SIMPLE'], { doseMgDay: 3000 });

    it('dispara con hepatopatía + paracetamol ≥ 3 g/día', () => {
      const p = makeCase({ diagnoses: ['hepatopatia_cronica'], medications: [paraAlta()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con malnutrición + paracetamol ≥ 3 g/día', () => {
      const p = makeCase({ diagnoses: ['malnutricion'], medications: [paraAlta()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con hepatopatía + paracetamol < 3 g/día', () => {
      const p = makeCase({
        diagnoses: ['hepatopatia_cronica'],
        medications: [makeMed('Paracetamol', ['ANALGESICO_SIMPLE'], { doseMgDay: 2999 })],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con hepatopatía + paracetamol sin dosis', () => {
      const p = makeCase({
        diagnoses: ['hepatopatia_cronica'],
        medications: [makeMed('Paracetamol', ['ANALGESICO_SIMPLE'])],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });
});
