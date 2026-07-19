import { CriteriaEngineService } from './criteria-engine.service';
import {
  ALL_CRITERIA,
  adt,
  antihipertCentral,
  antihistaminico1g,
  benzo,
  crit,
  hipnoticoZ,
  isrn,
  isrs,
  makeCase,
  makeMed,
  neuroleptico,
  nitrato,
  setupEngine,
} from './criteria-test-helpers';

const CAIDAS = 'caidas_repeticion';
const RIESGO_CAIDAS = 'riesgo_caidas_repeticion';

const logicText = (logic: unknown): string => JSON.stringify(logic ?? {});

const sectionKCriteria = () =>
  ALL_CRITERIA.filter(c => c.id.startsWith('STOPP-K'));

const opioide = (id = 'Morfina') => makeMed(id, ['OPIOIDE']);
const antiepileptico = (id = 'Carbamazepina') => makeMed(id, ['ANTIEPILÉPTICO']);
const alfabloqueante = (id = 'Doxazosina') => makeMed(id, ['ALFABLOQUEANTE']);
const antiespasmodicoUrinario = (id = 'Oxibutinina') =>
  makeMed(id, ['ANTIESPASMÓDICO_URINARIO']);
const laxante = (id = 'Lactulosa') => makeMed(id, ['LAXANTE']);
const anestesicoTopico = (id = 'Lidocaína tópica') =>
  makeMed(id, ['ANESTESICO_TOPICO']);

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

      it('no dispara sin benzodiacepina', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K2-NEUROLEPTICO-CAIDAS', () => {
      const id = 'STOPP-K2-NEUROLEPTICO-CAIDAS';

      it('dispara con caídas + neuroléptico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [neuroleptico()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin neuroléptico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K3-VASODILATADOR-CAIDAS-HIPOTENSION', () => {
      const id = 'STOPP-K3-VASODILATADOR-CAIDAS-HIPOTENSION';

      it('dispara con caídas + hipotensión ortostática + nitrato', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS, 'hipotension_ortostatica'],
          medications: [nitrato()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin hipotensión ortostática', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [nitrato()],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K4-ADT-CAIDAS', () => {
      const id = 'STOPP-K4-ADT-CAIDAS';

      it('dispara con caídas + ADT', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [adt()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin ADT', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K4-HIPNOTICO-Z-CAIDAS', () => {
      const id = 'STOPP-K4-HIPNOTICO-Z-CAIDAS';

      it('dispara con caídas + hipnótico-Z', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [hipnoticoZ()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin hipnótico-Z', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K5-ANTIEPILÉPTICO-CAIDAS', () => {
      const id = 'STOPP-K5-ANTIEPILÉPTICO-CAIDAS';

      it('dispara con caídas + antiepiléptico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [antiepileptico()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin antiepiléptico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K6-ANTIHISTAMINICO-1GEN-CAIDAS', () => {
      const id = 'STOPP-K6-ANTIHISTAMINICO-1GEN-CAIDAS';

      it('dispara con caídas + antihistamínico 1ª gen', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [antihistaminico1g()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin antihistamínico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K7-OPIOIDE-CAIDAS', () => {
      const id = 'STOPP-K7-OPIOIDE-CAIDAS';

      it('dispara con caídas + opioide', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [opioide()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin opioide', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K8-ISRS-CAIDAS', () => {
      const id = 'STOPP-K8-ISRS-CAIDAS';

      it('dispara con caídas + ISRS', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [isrs()],
        }), [crit(id)]).length).toBe(1);
      });

      it('dispara con caídas + venlafaxina (ISRN)', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [isrn('Venlafaxina')],
        }), [crit(id)]).length).toBe(1);
      });

      it('dispara con riesgo_caidas + duloxetina (ISRN)', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [RIESGO_CAIDAS],
          medications: [isrn('Duloxetina')],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin ISRS ni ISRN', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
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

      it('no dispara sin psicotrópico', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K9-ALFABLOQUEANTE-HTA-CAIDAS', () => {
      const id = 'STOPP-K9-ALFABLOQUEANTE-HTA-CAIDAS';

      it('dispara con caídas + HTA + alfabloqueante', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS, 'hta'],
          medications: [alfabloqueante()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin HTA', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [alfabloqueante()],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K10-ALFABLOQUEANTE-PROSTATICO-CAIDAS', () => {
      const id = 'STOPP-K10-ALFABLOQUEANTE-PROSTATICO-CAIDAS';

      it('dispara con caídas + HBP + alfabloqueante', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS, 'hiperplasia_benigna_prostata'],
          medications: [alfabloqueante()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin HBP', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [alfabloqueante()],
        }), [crit(id)])).toEqual([]);
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

      it('no dispara sin antihipertensivo central', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
        }), [crit(id)])).toEqual([]);
      });
    });

    describe('STOPP-K12-ANTIMUSCARÍNICO-VEJIGA-CAIDAS', () => {
      const id = 'STOPP-K12-ANTIMUSCARÍNICO-VEJIGA-CAIDAS';

      it('no dispara con caídas + antiespasmódico sin indicación', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS],
          medications: [antiespasmodicoUrinario()],
        }), [crit(id)])).toEqual([]);
      });

      it('dispara con caídas + antiespasmódico + incontinencia de urgencia', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS, 'incontinencia_urinaria_urgencia'],
          medications: [antiespasmodicoUrinario()],
        }), [crit(id)]).length).toBe(1);
      });

      it('dispara con caídas + antiespasmódico + vejiga hiperactiva', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS, 'vejiga_hiperactiva'],
          medications: [antiespasmodicoUrinario()],
        }), [crit(id)]).length).toBe(1);
      });

      it('no dispara sin antiespasmódico urinario', () => {
        expect(engine.evaluate(makeCase({
          diagnoses: [CAIDAS, 'vejiga_hiperactiva'],
        }), [crit(id)])).toEqual([]);
      });
    });
  });
});

describe('Criterios START — Sección K', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('START-K1-OPIOIDE-DOLOR-MODERADO-GRAVE', () => {
    const id = 'START-K1-OPIOIDE-DOLOR-MODERADO-GRAVE';

    it('dispara con dolor moderado-grave sin artrosis ni opioide', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_moderado_grave'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara con artrosis', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_moderado_grave', 'artrosis'],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe opioide', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_moderado_grave'],
        medications: [opioide()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-K2-LAXANTE-CON-OPIOIDE', () => {
    const id = 'START-K2-LAXANTE-CON-OPIOIDE';

    it('dispara con opioide sin laxante', () => {
      expect(engine.evaluate(makeCase({
        medications: [opioide()],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe laxante', () => {
      expect(engine.evaluate(makeCase({
        medications: [opioide(), laxante()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-K3-LIDOCAINA-TOPICA-DOLOR-NEUROPATICO', () => {
    const id = 'START-K3-LIDOCAINA-TOPICA-DOLOR-NEUROPATICO';

    it('dispara con dolor neuropático sin anestésico tópico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_neuropatico'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con neuralgia postherpética sin anestésico tópico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['neuralgia_postherpetica'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe anestésico tópico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_neuropatico'],
        medications: [anestesicoTopico()],
      }), [crit(id)])).toEqual([]);
    });
  });
});
