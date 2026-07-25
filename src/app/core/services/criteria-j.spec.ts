import { CriteriaEngineService } from './criteria-engine.service';
import {
  ara2,
  crit,
  ieca,
  makeCase,
  makeLabs,
  makeMed,
  setupEngine,
} from './criteria-test-helpers';

const sulfonilurea = (id = 'Glibenclamida') => makeMed(id, ['SULFONILUREA']);
const tiazolidindiona = (id = 'Pioglitazona') => makeMed(id, ['TIAZOLIDINDIONA']);
const isglt2 = (id = 'Empagliflozina') => makeMed(id, ['ISGLT2']);
const estrogeno = (id = 'Estradiol') => makeMed(id, ['ESTROGENO']);
const androgeno = (id = 'Testosterona') => makeMed(id, ['ANDROGENO']);
const hormonaTiroidea = (id = 'Levotiroxina') => makeMed(id, ['HORMONA_TIROIDEA']);
const analogoVasopresina = (id = 'Desmopresina') => makeMed(id, ['ANALOGO_VASOPRESINA']);

describe('Criterios STOPP — Sección J (Sistema endocrino)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('STOPP-J1-SULFONILUREA-VIDA-MEDIA-LARGA', () => {
    const id = 'STOPP-J1-SULFONILUREA-VIDA-MEDIA-LARGA';

    it('no dispara con sulfonilurea sola (sin diabetes)', () => {
      expect(engine.evaluate(makeCase({
        medications: [sulfonilurea()],
      }), [crit(id)])).toEqual([]);
    });

    it('dispara con sulfonilurea + diabetes', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['diabetes'],
        medications: [sulfonilurea()],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con sulfonilurea + diabetes_hipoglucemias_frecuentes', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['diabetes_hipoglucemias_frecuentes'],
        medications: [sulfonilurea()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin sulfonilurea', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['diabetes'],
        medications: [],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J2-TIAZOLIDINDIONA-INSUFICIENCIA-CARDIACA', () => {
    const id = 'STOPP-J2-TIAZOLIDINDIONA-INSUFICIENCIA-CARDIACA';

    it('dispara con insuficiencia cardiaca + tiazolidindiona', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['insuficiencia_cardiaca'],
        medications: [tiazolidindiona()],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara también con IC con FE reducida + tiazolidindiona', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['insuficiencia_cardiaca_fe_reducida'],
        medications: [tiazolidindiona()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin insuficiencia cardiaca', () => {
      expect(engine.evaluate(makeCase({
        medications: [tiazolidindiona()],
      }), [crit(id)])).toEqual([]);
    });
  });

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

  describe('STOPP-J4-ISGLT2-HIPOTENSION', () => {
    const id = 'STOPP-J4-ISGLT2-HIPOTENSION';

    it('dispara con hipotensión sintomática + iSGLT2', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hipotension_sintomatica'],
        medications: [isglt2()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin hipotensión sintomática', () => {
      expect(engine.evaluate(makeCase({
        medications: [isglt2()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J5-ESTROGENOS-CANCER-MAMA-UTERO', () => {
    const id = 'STOPP-J5-ESTROGENOS-CANCER-MAMA-UTERO';

    it('dispara con cáncer mama/útero + estrógeno', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['cancer_mama_utero'],
        medications: [estrogeno()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin diagnóstico', () => {
      expect(engine.evaluate(makeCase({
        medications: [estrogeno()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J6-ESTROGENOS-TROMBOEMBOLISMO-VENOSO', () => {
    const id = 'STOPP-J6-ESTROGENOS-TROMBOEMBOLISMO-VENOSO';

    it('dispara con TEV + estrógeno', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['tromboembolismo_venoso'],
        medications: [estrogeno()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin TEV', () => {
      expect(engine.evaluate(makeCase({
        medications: [estrogeno()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J7-ANDROGENOS-ENFERMEDAD-CORONARIA', () => {
    const id = 'STOPP-J7-ANDROGENOS-ENFERMEDAD-CORONARIA';

    it('dispara con enfermedad coronaria + andrógeno', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['enfermedad_coronaria_vascular'],
        medications: [androgeno()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin enfermedad coronaria', () => {
      expect(engine.evaluate(makeCase({
        medications: [androgeno()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J7-ESTROGENOS-ENFERMEDAD-CORONARIA', () => {
    const id = 'STOPP-J7-ESTROGENOS-ENFERMEDAD-CORONARIA';

    it('dispara con enfermedad coronaria + estrógeno', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['enfermedad_coronaria_vascular'],
        medications: [estrogeno()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin enfermedad coronaria', () => {
      expect(engine.evaluate(makeCase({
        medications: [estrogeno()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J8-ESTROGENOS-SIN-PROGESTAGENOS', () => {
    const id = 'STOPP-J8-ESTROGENOS-SIN-PROGESTAGENOS';

    it('dispara con útero intacto sin progestágenos + estrógeno', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['utero_intacto_sin_progestagenos'],
        medications: [estrogeno()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin diagnóstico', () => {
      expect(engine.evaluate(makeCase({
        medications: [estrogeno()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J9-LEVOTIROXINA-HIPOTIROIDISMO-SUBCLINICO', () => {
    const id = 'STOPP-J9-LEVOTIROXINA-HIPOTIROIDISMO-SUBCLINICO';

    it('dispara con diagnóstico hipotiroidismo subclínico + levotiroxina', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hipotiroidismo_subclinico'],
        medications: [hormonaTiroidea()],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con TSH > 4.5 y < 10 + levotiroxina', () => {
      expect(engine.evaluate(makeCase({
        medications: [hormonaTiroidea()],
        labs: makeLabs({ tsh_uUl: 4.6 }),
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara con TSH = 4.5 (umbral)', () => {
      expect(engine.evaluate(makeCase({
        medications: [hormonaTiroidea()],
        labs: makeLabs({ tsh_uUl: 4.5 }),
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara con TSH = 10 (umbral superior)', () => {
      expect(engine.evaluate(makeCase({
        medications: [hormonaTiroidea()],
        labs: makeLabs({ tsh_uUl: 10 }),
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara sin levotiroxina', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hipotiroidismo_subclinico'],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('STOPP-J10-VASOPRESINA-INCONTINENCIA', () => {
    const id = 'STOPP-J10-VASOPRESINA-INCONTINENCIA';

    it('dispara con incontinencia urinaria + análogo vasopresina', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['incontinencia_urinaria'],
        medications: [analogoVasopresina()],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con polaquiuria + análogo vasopresina', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['poliaquiuria'],
        medications: [analogoVasopresina()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara sin diagnóstico', () => {
      expect(engine.evaluate(makeCase({
        medications: [analogoVasopresina()],
      }), [crit(id)])).toEqual([]);
    });
  });
});

describe('Criterios START — Sección J (Sistema endocrino)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('START-J1-IECA-ARA2-DIABETES-PROTEINURIA', () => {
    const id = 'START-J1-IECA-ARA2-DIABETES-PROTEINURIA';
    const dx = ['diabetes', 'proteinuria'];

    it('dispara con diabetes + proteinuria sin IECA/ARA2', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con eGFR = 30 (umbral inclusive)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        labs: makeLabs({ egfr_ml_min_173: 30 }),
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara con eGFR < 30', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        labs: makeLabs({ egfr_ml_min_173: 29 }),
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara con dx enfermedad_renal_grave aunque no haya analítica', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: [...dx, 'enfermedad_renal_grave'],
        medications: [],
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
