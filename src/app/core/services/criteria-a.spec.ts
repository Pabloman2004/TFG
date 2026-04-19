import { CriteriaEngineService } from './criteria-engine.service';
import {
  setupEngine, makeCase, crit,
  aine, isrs, ieca, ara2, diureticoAsa, tiazida,
  makeMed,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección A (Duplicidades)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('A3-AINE-DUPLICIDAD', () => {
    const c = crit('STOPP-A3-AINE-DUPLICIDAD');

    it('dispara con 2 AINEs simultáneos', () => {
      const p = makeCase({ medications: [aine('Ibuprofeno'), aine('Naproxeno')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 solo AINE', () => {
      expect(engine.evaluate(makeCase({ medications: [aine()] }), [c])).toEqual([]);
    });
  });

  describe('A3-ISRS-DUPLICIDAD', () => {
    const c = crit('STOPP-A3-ISRS-DUPLICIDAD');

    it('dispara con 2 ISRS simultáneos', () => {
      const p = makeCase({ medications: [isrs('Citalopram'), isrs('Fluoxetina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 ISRS', () => {
      expect(engine.evaluate(makeCase({ medications: [isrs()] }), [c])).toEqual([]);
    });
  });

  describe('A3-IECA-DUPLICIDAD', () => {
    const c = crit('STOPP-A3-IECA-DUPLICIDAD');

    it('dispara con 2 IECAs', () => {
      const p = makeCase({ medications: [ieca('Enalapril'), ieca('Ramipril')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 IECA', () => {
      expect(engine.evaluate(makeCase({ medications: [ieca()] }), [c])).toEqual([]);
    });
  });

  describe('A3-ARA2-DUPLICIDAD', () => {
    const c = crit('STOPP-A3-ARA2-DUPLICIDAD');

    it('dispara con 2 ARA-II', () => {
      const p = makeCase({ medications: [ara2('Valsartán'), ara2('Candesartán')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 ARA-II', () => {
      expect(engine.evaluate(makeCase({ medications: [ara2()] }), [c])).toEqual([]);
    });
  });

  describe('A3-DIURETICO-ASA-USO-CONCOMITANTE', () => {
    const c = crit('STOPP-A3-DIURETICO-ASA-USO-CONCOMITANTE');

    it('dispara con 2 diuréticos de asa', () => {
      const p = makeCase({ medications: [diureticoAsa('Furosemida'), diureticoAsa('Torasemida')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 diurético de asa', () => {
      expect(engine.evaluate(makeCase({ medications: [diureticoAsa()] }), [c])).toEqual([]);
    });
  });

  describe('A3-TIAZIDA-USO-CONCOMITANTE', () => {
    const c = crit('STOPP-A3-TIAZIDA-USO-CONCOMITANTE');

    it('dispara con 2 tiazidas', () => {
      const p = makeCase({ medications: [tiazida('Hidroclorotiazida'), tiazida('Indapamida')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 tiazida', () => {
      expect(engine.evaluate(makeCase({ medications: [tiazida()] }), [c])).toEqual([]);
    });
  });

  describe('A3-ANTAGONISTA-ALDOSTERONA-DUPLICIDAD', () => {
    const c = crit('STOPP-A3-ANTAGONISTA-ALDOSTERONA-DUPLICIDAD');
    const aldosterona = (id: string) => makeMed(id, ['ANTAGONISTA_ALDOSTERONA']);

    it('dispara con 2 antagonistas de aldosterona', () => {
      const p = makeCase({ medications: [aldosterona('Espironolactona'), aldosterona('Eplerenona')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 antagonista de aldosterona', () => {
      expect(engine.evaluate(makeCase({ medications: [aldosterona('Espironolactona')] }), [c])).toEqual([]);
    });
  });

  describe('A3-DIURETICO-AHORRADOR-POTASIO-DUPLICIDAD', () => {
    const c = crit('STOPP-A3-DIURETICO-AHORRADOR-POTASIO-DUPLICIDAD');
    const dap = (id: string) => makeMed(id, ['DIURETICO_AHORRADOR_POTASIO']);

    it('dispara con 2 diuréticos ahorradores de potasio', () => {
      const p = makeCase({ medications: [dap('Amilorida'), dap('Triamtereno')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con 1 diurético ahorrador de potasio', () => {
      expect(engine.evaluate(makeCase({ medications: [dap('Amilorida')] }), [c])).toEqual([]);
    });
  });
});
