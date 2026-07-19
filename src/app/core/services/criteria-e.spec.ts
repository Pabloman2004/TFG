import { CriteriaEngineService } from './criteria-engine.service';
import {
  setupEngine, makeCase, makeLabs, makeMed, crit,
  aine, dabigatran, digoxina, aldosterona, inhibidorFactorXa, ieca, ara2,
} from './criteria-test-helpers';

// Factories locales para medicamentos del sistema renal que aún no están en helpers
const colchicina    = () => makeMed('Colchicina',      ['ANTIGOTOSO', 'COLCHICINA']);
const metformina    = () => makeMed('Metformina',      ['BIGUANIDA']);
const nitrofurantoina = () => makeMed('Nitrofurantoína', ['ANTIBIOTICO_URINARIO', 'ANTIBIOTICO', 'NITROFURANTOINA']);
const bifosfonato   = () => makeMed('Alendronato',     ['BIFOSFONATO', 'ANTIRRESORTIVO']);
const metotrexato   = () => makeMed('Metotrexato',     ['ANTIMETABOLITO', 'INMUNOSUPRESOR', 'FAME']);

// Un medicamento "limpio" sin clases de interés para tests negativos
const paracetamol = () => makeMed('Paracetamol', ['ANALGESICO_NO_OPIOIDE']);

// Dosis alta de digoxina (para E1)
const digoxinaDosisAlta = () =>
  makeMed('Digoxina', ['DIGOXINA'], { doseMcgDay: 250, durationDays: 120 });

describe('Criterios STOPP — Sección E (Sistema renal)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  // ─── E1 ────────────────────────────────────────────────────────────────────

  describe('E1-DIGOXINA-RENAL', () => {
    const c = crit('STOPP-E1-DIGOXINA-RENAL');

    it('dispara con TFGe < 30 + digoxina dosis alta > 90 días', () => {
      const p = makeCase({
        medications: [digoxinaDosisAlta()],
        labs: makeLabs({ egfr_ml_min_173: 25 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico enfermedad_renal_grave + digoxina dosis alta', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [digoxinaDosisAlta()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico insuficiencia_renal_terminal + digoxina dosis alta', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [digoxinaDosisAlta()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 30', () => {
      const p = makeCase({
        medications: [digoxinaDosisAlta()],
        labs: makeLabs({ egfr_ml_min_173: 35 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con digoxina a dosis baja', () => {
      const p = makeCase({
        medications: [makeMed('Digoxina', ['DIGOXINA'], { doseMcgDay: 62.5, durationDays: 120 })],
        labs: makeLabs({ egfr_ml_min_173: 20 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  // ─── E2 ────────────────────────────────────────────────────────────────────

  describe('E2-DABIGATRAN-RENAL', () => {
    const c = crit('STOPP-E2-DABIGATRAN-RENAL');

    it('dispara con TFGe < 30 + anticoagulante', () => {
      const p = makeCase({
        medications: [dabigatran()],
        labs: makeLabs({ egfr_ml_min_173: 25 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico enfermedad_renal_grave + anticoagulante', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [dabigatran()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico insuficiencia_renal_terminal + anticoagulante', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [dabigatran()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin anticoagulante', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [paracetamol()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con TFGe ≥ 30 y sin diagnóstico renal', () => {
      const p = makeCase({
        medications: [dabigatran()],
        labs: makeLabs({ egfr_ml_min_173: 45 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con Warfarina ni con inhibidores del factor Xa', () => {
      const renalCase = (medication: ReturnType<typeof makeMed>) => makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [medication],
      });

      expect(engine.evaluate(renalCase(makeMed('Warfarina', ['ANTICOAGULANTE', 'ANTICOAGULANTE_AVK'])), [c])).toEqual([]);
      expect(engine.evaluate(renalCase(inhibidorFactorXa('Apixaban')), [c])).toEqual([]);
    });
  });

  // ─── E3 ────────────────────────────────────────────────────────────────────

  describe('E3-FACTOR-XA-RENAL', () => {
    const c = crit('STOPP-E3-FACTOR-XA-RENAL');

    it('dispara con TFGe < 15 + anticoagulante directo', () => {
      const p = makeCase({
        medications: [inhibidorFactorXa('Apixaban')],
        labs: makeLabs({ egfr_ml_min_173: 10 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico insuficiencia_renal_terminal + anticoagulante', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [inhibidorFactorXa('Rivaroxaban')],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('NO dispara solo con enfermedad_renal_grave (grave ≡ < 30, umbral E3 es < 15)', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [inhibidorFactorXa('Apixaban')],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con TFGe ≥ 15 y sin diagnóstico terminal', () => {
      const p = makeCase({
        medications: [inhibidorFactorXa('Apixaban')],
        labs: makeLabs({ egfr_ml_min_173: 20 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con Warfarina ni Dabigatrán', () => {
      const terminalCase = (medication: ReturnType<typeof makeMed>) => makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [medication],
      });

      expect(engine.evaluate(terminalCase(makeMed('Warfarina', ['ANTICOAGULANTE', 'ANTICOAGULANTE_AVK'])), [c])).toEqual([]);
      expect(engine.evaluate(terminalCase(dabigatran()), [c])).toEqual([]);
    });
  });

  // ─── E4 ────────────────────────────────────────────────────────────────────

  describe('E4-AINE-INSUFICIENCIA-RENAL', () => {
    const c = crit('STOPP-E4-AINE-INSUFICIENCIA-RENAL');

    it('dispara con TFGe < 50 + AINE', () => {
      const p = makeCase({
        medications: [aine()],
        labs: makeLabs({ egfr_ml_min_173: 40 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico enfermedad_renal_grave + AINE', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [aine()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico insuficiencia_renal_terminal + AINE', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [aine()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 50 y sin diagnóstico renal', () => {
      const p = makeCase({
        medications: [aine()],
        labs: makeLabs({ egfr_ml_min_173: 60 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  // ─── E5 ────────────────────────────────────────────────────────────────────

  describe('E5-COLCHICINA-INSUFICIENCIA-RENAL', () => {
    const c = crit('STOPP-E5-COLCHICINA-INSUFICIENCIA-RENAL');

    it('dispara con TFGe < 10 + colchicina', () => {
      const p = makeCase({
        medications: [colchicina()],
        labs: makeLabs({ egfr_ml_min_173: 8 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 10', () => {
      const p = makeCase({
        medications: [colchicina()],
        labs: makeLabs({ egfr_ml_min_173: 12 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    // Nota: ni "grave" (<30) ni "terminal" (<15) garantizan < 10,
    // así que el criterio NO debe disparar solo con esos diagnósticos.
    it('no dispara solo con enfermedad_renal_grave', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [colchicina()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara solo con insuficiencia_renal_terminal', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [colchicina()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  // ─── E6 ────────────────────────────────────────────────────────────────────

  describe('E6-METFORMINA-INSUFICIENCIA-RENAL', () => {
    const c = crit('STOPP-E6-METFORMINA-INSUFICIENCIA-RENAL');

    it('dispara con TFGe < 30 + metformina', () => {
      const p = makeCase({
        medications: [metformina()],
        labs: makeLabs({ egfr_ml_min_173: 20 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico enfermedad_renal_grave + metformina', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [metformina()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico insuficiencia_renal_terminal + metformina', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [metformina()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 30 y sin diagnóstico renal', () => {
      const p = makeCase({
        medications: [metformina()],
        labs: makeLabs({ egfr_ml_min_173: 45 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  // ─── E7 ────────────────────────────────────────────────────────────────────

  describe('E7-ANTAGONISTA-ALDOSTERONA-INSUFICIENCIA-RENAL', () => {
    const c = crit('STOPP-E7-ANTAGONISTA-ALDOSTERONA-INSUFICIENCIA-RENAL');

    it('dispara con TFGe < 30 + espironolactona', () => {
      const p = makeCase({
        medications: [aldosterona()],
        labs: makeLabs({ egfr_ml_min_173: 20 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad_renal_grave + espironolactona', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [aldosterona()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con insuficiencia_renal_terminal + espironolactona', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [aldosterona()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 30 y sin diagnóstico renal', () => {
      const p = makeCase({
        medications: [aldosterona()],
        labs: makeLabs({ egfr_ml_min_173: 50 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  // ─── E8 ────────────────────────────────────────────────────────────────────

  describe('E8-NITROFURANTOINA-INSUFICIENCIA-RENAL', () => {
    const c = crit('STOPP-E8-NITROFURANTOINA-INSUFICIENCIA-RENAL');

    it('dispara con TFGe < 45 + nitrofurantoína', () => {
      const p = makeCase({
        medications: [nitrofurantoina()],
        labs: makeLabs({ egfr_ml_min_173: 30 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad_renal_grave + nitrofurantoína', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [nitrofurantoina()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con insuficiencia_renal_terminal + nitrofurantoína', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [nitrofurantoina()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 45 y sin diagnóstico renal', () => {
      const p = makeCase({
        medications: [nitrofurantoina()],
        labs: makeLabs({ egfr_ml_min_173: 60 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  // ─── E9 ────────────────────────────────────────────────────────────────────

  describe('E9-BIFOSFONATO-INSUFICIENCIA-RENAL', () => {
    const c = crit('STOPP-E9-BIFOSFONATO-INSUFICIENCIA-RENAL');

    it('dispara con TFGe < 30 + bisfosfonato', () => {
      const p = makeCase({
        medications: [bifosfonato()],
        labs: makeLabs({ egfr_ml_min_173: 25 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad_renal_grave + bisfosfonato', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [bifosfonato()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con insuficiencia_renal_terminal + bisfosfonato', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [bifosfonato()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 30 y sin diagnóstico renal', () => {
      const p = makeCase({
        medications: [bifosfonato()],
        labs: makeLabs({ egfr_ml_min_173: 40 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  // ─── E10 ───────────────────────────────────────────────────────────────────

  describe('E10-METOTREXATO-INSUFICIENCIA-RENAL', () => {
    const c = crit('STOPP-E10-METOTREXATO-INSUFICIENCIA-RENAL');

    it('dispara con TFGe < 30 + metotrexato', () => {
      const p = makeCase({
        medications: [metotrexato()],
        labs: makeLabs({ egfr_ml_min_173: 20 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad_renal_grave + metotrexato', () => {
      const p = makeCase({
        diagnoses: ['enfermedad_renal_grave'],
        medications: [metotrexato()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con insuficiencia_renal_terminal + metotrexato', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_renal_terminal'],
        medications: [metotrexato()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con TFGe ≥ 30 y sin diagnóstico renal', () => {
      const p = makeCase({
        medications: [metotrexato()],
        labs: makeLabs({ egfr_ml_min_173: 50 }),
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });
});

describe('Criterios START — Sección E (Sistema renal)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('START-E4-IECA-ARA2-ERC-PROTEINURIA', () => {
    const id = 'START-E4-IECA-ARA2-ERC-PROTEINURIA';
    const dx = ['proteinuria'];

    it('dispara con proteinuria sin IECA/ARA2', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara con dx enfermedad_renal_grave aunque no haya analítica', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: [...dx, 'enfermedad_renal_grave'],
        medications: [],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara con eGFR < 30', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        labs: makeLabs({ egfr_ml_min_173: 29 }),
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe IECA', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [ieca()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe ARA2', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [ara2()],
      }), [crit(id)])).toEqual([]);
    });
  });
});

describe('CriteriaEngineService — operador egfrBelow', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  const rule = (threshold: number) => ({
    id: 'TEST-EGFR',
    type: 'STOPP' as const,
    system: 'Test',
    summary: 'Test',
    logic: { egfrBelow: [threshold, { var: '' }] },
  });

  it('dispara cuando egfr numérico es menor que el umbral', () => {
    const p = makeCase({ labs: makeLabs({ egfr_ml_min_173: 25 }) });
    expect(engine.evaluate(p, [rule(30)]).length).toBe(1);
  });

  it('no dispara cuando egfr numérico es mayor o igual al umbral', () => {
    const p = makeCase({ labs: makeLabs({ egfr_ml_min_173: 30 }) });
    expect(engine.evaluate(p, [rule(30)])).toEqual([]);
  });

  it('dispara con diagnóstico enfermedad_renal_grave cuando umbral ≥ 30', () => {
    const p = makeCase({ diagnoses: ['enfermedad_renal_grave'] });
    expect(engine.evaluate(p, [rule(30)]).length).toBe(1);
    expect(engine.evaluate(p, [rule(45)]).length).toBe(1);
    expect(engine.evaluate(p, [rule(50)]).length).toBe(1);
  });

  it('NO dispara con enfermedad_renal_grave cuando umbral es < 30', () => {
    // "Grave" solo garantiza TFGe < 30, no < 15 ni < 10
    const p = makeCase({ diagnoses: ['enfermedad_renal_grave'] });
    expect(engine.evaluate(p, [rule(15)])).toEqual([]);
    expect(engine.evaluate(p, [rule(10)])).toEqual([]);
  });

  it('dispara con insuficiencia_renal_terminal cuando umbral ≥ 15', () => {
    const p = makeCase({ diagnoses: ['insuficiencia_renal_terminal'] });
    expect(engine.evaluate(p, [rule(15)]).length).toBe(1);
    expect(engine.evaluate(p, [rule(30)]).length).toBe(1);
    expect(engine.evaluate(p, [rule(50)]).length).toBe(1);
  });

  it('NO dispara con insuficiencia_renal_terminal cuando umbral es < 15', () => {
    const p = makeCase({ diagnoses: ['insuficiencia_renal_terminal'] });
    expect(engine.evaluate(p, [rule(10)])).toEqual([]);
  });

  it('no dispara cuando no hay ni lab ni diagnóstico', () => {
    expect(engine.evaluate(makeCase(), [rule(30)])).toEqual([]);
  });
});
