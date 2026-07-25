import { CriteriaEngineService } from './criteria-engine.service';
import {
  anticolinergico,
  crit,
  isrn,
  makeCase,
  makeMed,
  pde5,
  setupEngine,
} from './criteria-test-helpers';

const antiespasmodicoUrinario = (id = 'Oxibutinina') =>
  makeMed(id, ['ANTIESPASMÓDICO_URINARIO']);
const alfabloqueante = (id = 'Tamsulosina') =>
  makeMed(id, ['ALFABLOQUEANTE', 'ALFABLOQUEANTE_PROSTATICO']);
const mirabegron = () => makeMed('Mirabegrón', ['AGONISTA_BETA3']);
const antibiotico = (id = 'Amoxicilina') => makeMed(id, ['ANTIBIOTICO']);
const inhibidor5alfa = (id = 'Finasterida') =>
  makeMed(id, ['INHIBIDOR_5ALFA_REDUCTASA']);
const estrogenoTopico = () => makeMed('Estriol vaginal', ['ESTROGENO_TOPICO']);

const femaleInfo = {
  name: 'Test', age: 80, sex: 'F' as const, mrn: null, weightKg: null, heightCm: null, notes: null,
};

describe('Criterios STOPP — Sección I (Sistema urogenital)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('I1-ANTIMUSCARÍNICO-URINARIO-DEMENCIA', () => {
    const c = crit('STOPP-I1-ANTIMUSCARÍNICO-URINARIO-DEMENCIA');

    it('dispara con demencia + antiespasmódico urinario', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['demencia'],
        medications: [antiespasmodicoUrinario()],
      }), [c]).length).toBe(1);
    });

    it('dispara con deterioro cognitivo + antiespasmódico urinario', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['deterioro_cognitivo'],
        medications: [antiespasmodicoUrinario()],
      }), [c]).length).toBe(1);
    });

    it('no dispara sin antiespasmódico urinario', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['demencia'],
        medications: [],
      }), [c])).toEqual([]);
    });
  });

  describe('I2-ANTICOLINERGICO-GLAUCOMA', () => {
    const c = crit('STOPP-I2-ANTICOLINERGICO-GLAUCOMA');

    it('dispara con glaucoma ángulo estrecho + anticolinérgico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['glaucoma_angulo_estrecho'],
        medications: [anticolinergico()],
      }), [c]).length).toBe(1);
    });

    it('no dispara sin glaucoma', () => {
      expect(engine.evaluate(makeCase({
        medications: [anticolinergico()],
      }), [c])).toEqual([]);
    });
  });

  describe('I3-ANTIMUSCARÍNICO-HBP-VOLUMEN-RESIDUAL', () => {
    const c = crit('STOPP-I3-ANTIMUSCARÍNICO-HBP-VOLUMEN-RESIDUAL');

    it('dispara con HBP + antiespasmódico urinario', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hiperplasia_benigna_prostata'],
        medications: [antiespasmodicoUrinario()],
      }), [c]).length).toBe(1);
    });

    it('no dispara sin HBP', () => {
      expect(engine.evaluate(makeCase({
        medications: [antiespasmodicoUrinario()],
      }), [c])).toEqual([]);
    });
  });

  describe('I4-ANTIMUSCARINICO-ESTRENIMIENTO', () => {
    const c = crit('STOPP-I4-ANTIMUSCARINICO-ESTRENIMIENTO');

    it('pertenece al sistema urogenital', () => {
      expect(c.system).toBe('Sistema urogenital');
    });

    it('dispara con estreñimiento crónico + anticolinérgico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['estrenimiento_cronico'],
        medications: [anticolinergico()],
      }), [c]).length).toBe(1);
    });

    it('no dispara sin estreñimiento', () => {
      expect(engine.evaluate(makeCase({
        medications: [anticolinergico()],
      }), [c])).toEqual([]);
    });
  });

  describe('I5-ALFABLOQUEANTE-HIPOTENSION-SINCOPE', () => {
    const c = crit('STOPP-I5-ALFABLOQUEANTE-HIPOTENSION-SINCOPE');

    it('dispara con hipotensión ortostática + alfabloqueante', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hipotension_ortostatica'],
        medications: [alfabloqueante()],
      }), [c]).length).toBe(1);
    });

    it('dispara con síncopes recurrentes + alfabloqueante', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['sincopes_recurrentes'],
        medications: [alfabloqueante()],
      }), [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico', () => {
      expect(engine.evaluate(makeCase({
        medications: [alfabloqueante()],
      }), [c])).toEqual([]);
    });
  });

  describe('I6-MIRABEGRON-HIPERTENSION-GRAVE', () => {
    const c = crit('STOPP-I6-MIRABEGRON-HIPERTENSION-GRAVE');

    it('dispara con HTA grave + mirabegrón', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hipertension_grave'],
        medications: [mirabegron()],
      }), [c]).length).toBe(1);
    });

    it('no dispara sin HTA grave', () => {
      expect(engine.evaluate(makeCase({
        medications: [mirabegron()],
      }), [c])).toEqual([]);
    });
  });

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

  describe('I8-ANTIBIOTICO-BACTERIURIA-ASINTOMATICA', () => {
    const c = crit('STOPP-I8-ANTIBIOTICO-BACTERIURIA-ASINTOMATICA');

    it('dispara con bacteriuria asintomática + antibiótico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['bacteriuria_asintomatica'],
        medications: [antibiotico()],
      }), [c]).length).toBe(1);
    });

    it('no dispara sin antibiótico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['bacteriuria_asintomatica'],
      }), [c])).toEqual([]);
    });
  });
});

describe('Criterios START — Sección I (Sistema urogenital)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('START-I1-ALFABLOQUEANTE-HBP', () => {
    const id = 'START-I1-ALFABLOQUEANTE-HBP';

    it('dispara con HBP sin alfabloqueante ni inhibidor 5-alfa', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hiperplasia_benigna_prostata'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe alfabloqueante', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hiperplasia_benigna_prostata'],
        medications: [alfabloqueante()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-I2-INHIBIDOR-5ALFA-REDUCTASA-HBP', () => {
    const id = 'START-I2-INHIBIDOR-5ALFA-REDUCTASA-HBP';

    it('dispara con HBP sin inhibidor 5-alfa ni alfabloqueante', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hiperplasia_benigna_prostata'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe inhibidor 5-alfa', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hiperplasia_benigna_prostata'],
        medications: [inhibidor5alfa()],
      }), [crit(id)])).toEqual([]);
    });
  });

  // I3 e I4 dejaron de comprobar info.sex: la UI no captura el sexo, así que la
  // cláusula los hacía inalcanzables. El matiz «en mujeres» queda en el summary.
  describe('START-I3-ESTROGENO-TOPICO-VAGINITIS-ATROFICA', () => {
    const id = 'START-I3-ESTROGENO-TOPICO-VAGINITIS-ATROFICA';

    it('dispara con vaginitis atrófica y sin estrógeno tópico', () => {
      const result = engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['vaginitis_atrofica'],
        medications: [],
      }), [crit(id)]);

      expect(result.length).toBe(1);
    });

    it('dispara sin datos de paciente: no depende del sexo registrado', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['vaginitis_atrofica'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe estrógeno tópico', () => {
      expect(engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['vaginitis_atrofica'],
        medications: [estrogenoTopico()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-I4-ESTROGENO-TOPICO-ITU-RECURRENTES', () => {
    const id = 'START-I4-ESTROGENO-TOPICO-ITU-RECURRENTES';

    it('dispara con ITU recurrentes y sin estrógeno tópico', () => {
      const result = engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['infecciones_urinarias_recurrentes'],
        medications: [],
      }), [crit(id)]);

      expect(result.length).toBe(1);
    });

    it('dispara sin datos de paciente: no depende del sexo registrado', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['infecciones_urinarias_recurrentes'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe estrógeno tópico', () => {
      expect(engine.evaluate(makeCase({
        info: femaleInfo,
        diagnoses: ['infecciones_urinarias_recurrentes'],
        medications: [estrogenoTopico()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-I5-INHIBIDOR-PDE5-DISFUNCION-ERECTIL', () => {
    const id = 'START-I5-INHIBIDOR-PDE5-DISFUNCION-ERECTIL';

    it('dispara con disfunción eréctil sin inhibidor PDE5', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['disfuncion_erectil'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe inhibidor PDE5', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['disfuncion_erectil'],
        medications: [pde5()],
      }), [crit(id)])).toEqual([]);
    });
  });
});
