import { CriteriaEngineService } from './criteria-engine.service';
import { crit, makeCase, makeMed, setupEngine } from './criteria-test-helpers';

const gabapentinoide = (id = 'Gabapentina') => makeMed(id, ['GABAPENTINOIDE']);
const opioideLp = (id = 'Morfina LP') => makeMed(id, ['OPIOIDE', 'OPIOIDE_LP']);
const opioideRapido = (id = 'Morfina') => makeMed(id, ['OPIOIDE', 'OPIOIDE_RAPIDO']);
const anestesicoTopico = () => makeMed('Lidocaína parche', ['ANESTESICO_TOPICO']);

describe('Criterios STOPP — Sección L (Analgésicos)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('L3-OPIOIDE-PROLONGADO-SIN-RAPIDO', () => {
    const c = crit('STOPP-L3-OPIOIDE-PROLONGADO-SIN-RAPIDO');

    it('dispara con opioide LP + dolor irruptivo sin opioide rápido', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_irruptivo'],
        medications: [opioideLp()],
      }), [c]).length).toBe(1);
    });

    it('dispara con opioide LP + dolor_moderado_grave sin opioide rápido', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_moderado_grave'],
        medications: [opioideLp()],
      }), [c]).length).toBe(1);
    });

    it('no dispara si hay opioide de acción rápida', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_irruptivo'],
        medications: [opioideLp(), opioideRapido()],
      }), [c])).toEqual([]);
    });
  });

  describe('L4-LIDOCAINA-TOPICA-ARTROSIS', () => {
    const c = crit('STOPP-L4-LIDOCAINA-TOPICA-ARTROSIS');

    it('no dispara con artrosis a secas (sin dolor crónico de la artrosis)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['artrosis'],
        medications: [anestesicoTopico()],
      }), [c])).toEqual([]);
    });

    it('dispara con dolor crónico de la artrosis', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_cronico_artrosis'],
        medications: [anestesicoTopico()],
      }), [c]).length).toBe(1);
    });

    it('no dispara con dolor crónico de la artrosis sin anestésico tópico', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_cronico_artrosis'],
      }), [c])).toEqual([]);
    });
  });

  describe('L5-GABAPENTINOIDE-DOLOR-NO-NEUROPATICO', () => {
    const c = crit('STOPP-L5-GABAPENTINOIDE-DOLOR-NO-NEUROPATICO');

    it('no dispara con gabapentina sola', () => {
      expect(engine.evaluate(makeCase({
        medications: [gabapentinoide()],
      }), [c])).toEqual([]);
    });

    it('no dispara con gabapentina + epilepsia (sin dolor no neuropático)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['epilepsia'],
        medications: [gabapentinoide()],
      }), [c])).toEqual([]);
    });

    it('no dispara con pregabalina + ansiedad_grave (sin dolor no neuropático)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['ansiedad_grave'],
        medications: [gabapentinoide('Pregabalina')],
      }), [c])).toEqual([]);
    });

    it('dispara con pregabalina + artrosis', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['artrosis'],
        medications: [gabapentinoide('Pregabalina')],
      }), [c]).length).toBe(1);
    });

    it('dispara con pregabalina + dolor crónico de la artrosis', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['dolor_cronico_artrosis'],
        medications: [gabapentinoide('Pregabalina')],
      }), [c]).length).toBe(1);
    });

    it('no dispara con pregabalina + artrosis + dolor neuropático', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['artrosis', 'dolor_neuropatico'],
        medications: [gabapentinoide('Pregabalina')],
      }), [c])).toEqual([]);
    });
  });

  describe('L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA', () => {
    const c = crit('STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA');
    const para = () => makeMed('Paracetamol', ['ANALGESICO_SIMPLE']);

    it('dispara con hepatopatía + paracetamol sin dosis', () => {
      const p = makeCase({ diagnoses: ['hepatopatia_cronica'], medications: [para()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con malnutrición + paracetamol sin dosis', () => {
      const p = makeCase({ diagnoses: ['malnutricion'], medications: [para()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con hepatopatía sin paracetamol', () => {
      const p = makeCase({ diagnoses: ['hepatopatia_cronica'] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('el summary menciona riesgo ≥ 3 g/día', () => {
      expect(c.summary.toLowerCase()).toMatch(/3 g|≥ 3/);
    });
  });
});
