import { CriteriaEngineService } from './criteria-engine.service';
import {
  crit,
  isrn,
  makeCase,
  makeMed,
  setupEngine,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección I (Sistema urogenital)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('I7-DULOXETINA-INCONTINENCIA-URGENCIA', () => {
    const c = crit('STOPP-I7-DULOXETINA-INCONTINENCIA-URGENCIA');
    const duloxetina = () => makeMed('Duloxetina', ['ISRN', 'DULOXETINA']);

    it('no dispara con venlafaxina + incontinencia urinaria de urgencia', () => {
      const p = makeCase({
        diagnoses: ['incontinencia_urinaria_urgencia'],
        medications: [isrn('Venlafaxina')],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('dispara con duloxetina + incontinencia urinaria de urgencia', () => {
      const p = makeCase({
        diagnoses: ['incontinencia_urinaria_urgencia'],
        medications: [duloxetina()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('excluye Duloxetina del greying cuando dispara', () => {
      const p = makeCase({
        diagnoses: ['incontinencia_urinaria_urgencia'],
        medications: [duloxetina()],
      });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('duloxetina')).toBe(true);
    });
  });
});

describe('Criterios START — Sección I (Sistema urogenital)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  const femaleInfo = {
    name: 'Test', age: 80, sex: 'F' as const, mrn: null, weightKg: null, heightCm: null, notes: null,
  };
  const maleInfo = {
    name: 'Test', age: 80, sex: 'M' as const, mrn: null, weightKg: null, heightCm: null, notes: null,
  };

  describe('START-I3-ESTROGENO-TOPICO-VAGINITIS-ATROFICA', () => {
    const id = 'START-I3-ESTROGENO-TOPICO-VAGINITIS-ATROFICA';

    it('dispara con mujer, vaginitis atrófica y sin estrógeno tópico', () => {
      const result = engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['vaginitis_atrofica'],
        medications: [],
      }), [crit(id)]);

      expect(result.length).toBe(1);
    });

    it('no dispara con varón y vaginitis atrófica', () => {
      expect(engine.evaluate(makeCase({
        info: maleInfo,
        diagnoses: ['vaginitis_atrofica'],
        medications: [],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe estrógeno tópico', () => {
      expect(engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['vaginitis_atrofica'],
        medications: [makeMed('Estriol vaginal', ['ESTROGENO_TOPICO'])],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-I4-ESTROGENO-TOPICO-ITU-RECURRENTES', () => {
    const id = 'START-I4-ESTROGENO-TOPICO-ITU-RECURRENTES';

    it('dispara con mujer, ITU recurrentes y sin estrógeno tópico', () => {
      const result = engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['infecciones_urinarias_recurrentes'],
        medications: [],
      }), [crit(id)]);

      expect(result.length).toBe(1);
    });

    it('no dispara con varón e ITU recurrentes', () => {
      expect(engine.evaluate(makeCase({
        info: maleInfo,
        diagnoses: ['infecciones_urinarias_recurrentes'],
        medications: [],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe estrógeno tópico', () => {
      expect(engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['infecciones_urinarias_recurrentes'],
        medications: [makeMed('Estriol vaginal', ['ESTROGENO_TOPICO'])],
      }), [crit(id)])).toEqual([]);
    });
  });
});
