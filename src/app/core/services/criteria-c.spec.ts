import { CriteriaEngineService } from './criteria-engine.service';
import {
  setupEngine, makeCase, makeMed, crit, withAge, ALL_CRITERIA,
  aine, anticoag, anticoagAvk, anticoagDir, dabigatran,
  antiag, aas, calcioNodhp, isrs, antiagTico, amiodarona,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección C (Anticoagulantes/Antiagregantes)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('C1-AAS-DOSIS-ALTA', () => {
    const c = crit('STOPP-C1-AAS-DOSIS-ALTA');
    const aasAlta = () => makeMed('Ácido acetilsalicílico', ['ANTIAGREGANTE', 'AAS'], { doseMgDay: 101 });

    it('dispara con AAS > 100 mg/día', () => {
      const p = makeCase({ medications: [aasAlta()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con AAS ≤ 100 mg/día', () => {
      const p = makeCase({
        medications: [makeMed('Ácido acetilsalicílico', ['ANTIAGREGANTE', 'AAS'], { doseMgDay: 100 })],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con AAS sin dosis', () => {
      expect(engine.evaluate(makeCase({ medications: [aas()] }), [c])).toEqual([]);
    });
  });

  describe('C2-ANTIAGREGANTE-RIESGO-SANGRADO', () => {
    const c = crit('STOPP-C2-ANTIAGREGANTE-RIESGO-SANGRADO');

    it('dispara con HTA grave + antiagregante', () => {
      const p = makeCase({ diagnoses: ['hipertension_grave'], medications: [antiag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diátesis hemorrágica + antiagregante', () => {
      const p = makeCase({ diagnoses: ['diatesis_hemorragica'], medications: [antiag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con "riesgo significativo de sangrado" + antiagregante', () => {
      const p = makeCase({ diagnoses: ['riesgo_significativo_sangrado'], medications: [antiag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con AAS + riesgo significativo de sangrado (AAS es antiagregante)', () => {
      const p = makeCase({ diagnoses: ['riesgo_significativo_sangrado'], medications: [aas()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con antiagregante sin riesgo de sangrado', () => {
      expect(engine.evaluate(makeCase({ medications: [antiag()] }), [c])).toEqual([]);
    });
  });

  describe('C3-AAS-CLOPIDOGREL-ICTUS', () => {
    const c = crit('STOPP-C3-AAS-CLOPIDOGREL-ICTUS');

    it('dispara con ictus previo + AAS + Clopidogrel', () => {
      const p = makeCase({ diagnoses: ['ictus_previo'], medications: [aas(), antiag('Clopidogrel')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo AAS sin Clopidogrel', () => {
      const p = makeCase({ diagnoses: ['ictus_previo'], medications: [aas()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara sin ictus previo', () => {
      const p = makeCase({ medications: [aas(), antiag('Clopidogrel')] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('C4-ANTICOAGULANTE-ANTIAGREGANTE-FA', () => {
    const c = crit('STOPP-C4-ANTICOAGULANTE-ANTIAGREGANTE-FA');

    it('dispara con FA + antiagregante + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [antiag(), anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con FA + solo antiagregante', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [antiag()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('C5-ANTIAGREGANTE-ANTICOAGULANTE-VASCULAR-ESTABLE', () => {
    const c = crit('STOPP-C5-ANTIAGREGANTE-ANTICOAGULANTE-VASCULAR-ESTABLE');

    it('dispara con enfermedad vascular cerebral + antiagregante + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_cerebral'], medications: [antiag(), anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad vascular coronaria + antiagregante + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_coronaria'], medications: [antiag(), anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad vascular periférica + antiagregante + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_periferica'], medications: [antiag(), anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad vascular estable + antiagregante + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_estable'], medications: [antiag(), anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con vascular + solo antiagregante (falta anticoagulante)', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_cerebral'], medications: [antiag()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con vascular + solo anticoagulante (falta antiagregante)', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_cerebral'], medications: [anticoag()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara sin diagnóstico vascular', () => {
      const p = makeCase({ medications: [antiag(), anticoag()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('bloquea anticoagulante con antiagregante + vascular ya presentes', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_cerebral'], medications: [antiag()] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('apixaban')).toBeTrue();
    });

    it('bloquea antiagregante con anticoagulante + vascular ya presentes', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_cerebral'], medications: [anticoag()] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('clopidogrel')).toBeTrue();
    });
  });

  describe('C6-TICLOPIDINA-OBSOLETA', () => {
    const c = crit('STOPP-C6-TICLOPIDINA-OBSOLETA');

    it('dispara con Ticlopidina sin requerir edad', () => {
      const p = makeCase({ medications: [antiagTico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara aunque la edad sea inferior a 65', () => {
      const p = makeCase({ info: withAge(64), medications: [antiagTico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });
  });

  describe('C7-ANTIAGREGANTE-FA-SIN-ANTICOAGULANTE', () => {
    const c = crit('STOPP-C7-ANTIAGREGANTE-FA-SIN-ANTICOAGULANTE');

    it('dispara con FA + antiagregante + sin anticoagulante', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [antiag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con FA + antiagregante + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [antiag(), anticoag()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con FA sin medicamentos (no hay antiagregante)', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['fibrilacion_auricular'] }), [c])).toEqual([]);
    });

    it('no dispara sin FA', () => {
      expect(engine.evaluate(makeCase({ medications: [antiag()] }), [c])).toEqual([]);
    });

    it('bloquea antiagregante cuando paciente tiene FA sin anticoagulante', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('clopidogrel')).toBeTrue();
    });

    it('no bloquea antiagregante si ya hay anticoagulante', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [anticoag()] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('clopidogrel')).toBeFalse();
    });
  });

  describe('C8-ANTICOAGULANTE-TVP-PRIMER-EPISODIO', () => {
    const c = crit('STOPP-C8-ANTICOAGULANTE-TVP-PRIMER-EPISODIO');

    it('dispara con TVP primer episodio + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['tvp_primer_episodio_sin_factores_persistentes'], medications: [anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin ese diagnóstico', () => {
      expect(engine.evaluate(makeCase({ medications: [anticoag()] }), [c])).toEqual([]);
    });
  });

  describe('C9-ANTICOAGULANTE-TEP-PRIMER-EPISODIO', () => {
    const c = crit('STOPP-C9-ANTICOAGULANTE-TEP-PRIMER-EPISODIO');

    it('dispara con TEP primer episodio + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['tep_primer_episodio_sin_factores_persistentes'], medications: [anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin ese diagnóstico', () => {
      expect(engine.evaluate(makeCase({ medications: [anticoag()] }), [c])).toEqual([]);
    });
  });

  describe('C10-AINE-ANTICOAGULANTES', () => {
    const c = crit('STOPP-C10-AINE-ANTICOAGULANTES');

    it('dispara con AINE + anticoagulante', () => {
      const p = makeCase({ medications: [aine(), anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo AINE', () => {
      expect(engine.evaluate(makeCase({ medications: [aine()] }), [c])).toEqual([]);
    });

    it('no dispara con solo anticoagulante', () => {
      expect(engine.evaluate(makeCase({ medications: [anticoag()] }), [c])).toEqual([]);
    });

    it('bloquea anticoagulante cuando ya hay un AINE', () => {
      const excluded = engine.getExcludedMedications(makeCase({ medications: [aine()] }), [c]);
      expect(excluded.has('apixaban')).toBeTrue();
    });

    it('bloquea AINE cuando ya hay un anticoagulante', () => {
      const excluded = engine.getExcludedMedications(makeCase({ medications: [anticoag()] }), [c]);
      expect(excluded.has('ibuprofeno')).toBeTrue();
    });

    it('no bloquea anticoagulante sin AINE presente', () => {
      const excluded = engine.getExcludedMedications(makeCase(), [c]);
      expect(excluded.has('apixaban')).toBeFalse();
    });
  });

  describe('C11-AVK-FA-PRIMERA-LINEA', () => {
    const c = crit('STOPP-C11-AVK-FA-PRIMERA-LINEA');

    it('dispara con FA + warfarina (sin excepciones)', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [anticoagAvk()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con FA + warfarina + prótesis valvular metálica (excepción)', () => {
      const p = makeCase({
        diagnoses: ['fibrilacion_auricular', 'protesis_valvular_metalica'],
        medications: [anticoagAvk()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con FA + warfarina + estenosis mitral moderada-grave (excepción)', () => {
      const p = makeCase({
        diagnoses: ['fibrilacion_auricular', 'estenosis_mitral_moderada_grave'],
        medications: [anticoagAvk()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con FA + ACOD (no es AVK)', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [anticoagDir()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('C12-ISRS-ANTICOAGULANTE-SANGRADO', () => {
    const c = crit('STOPP-C12-ISRS-ANTICOAGULANTE-SANGRADO');

    it('dispara con antecedentes sangrado grave + ISRS + anticoagulante', () => {
      const p = makeCase({ diagnoses: ['antecedentes_sangrado_grave'], medications: [isrs(), anticoag()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con ISRS + anticoagulante sin antecedentes de sangrado', () => {
      expect(engine.evaluate(makeCase({ medications: [isrs(), anticoag()] }), [c])).toEqual([]);
    });

    it('no dispara con anticoagulante + antecedentes de sangrado sin ISRS', () => {
      const p = makeCase({ diagnoses: ['antecedentes_sangrado_grave'], medications: [anticoag()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('C13-VERAPAMILO-INHIBIDORES-TROMBINA', () => {
    const c = crit('STOPP-C13-VERAPAMILO-INHIBIDORES-TROMBINA');

    it('dispara con Verapamilo + Dabigatrán', () => {
      const p = makeCase({ medications: [calcioNodhp(), dabigatran()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Diltiazem + Dabigatrán', () => {
      const p = makeCase({ medications: [calcioNodhp('Diltiazem'), dabigatran()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Verapamilo sin Dabigatrán', () => {
      expect(engine.evaluate(makeCase({ medications: [calcioNodhp()] }), [c])).toEqual([]);
    });

    it('no dispara con Dabigatrán sin Verapamilo', () => {
      expect(engine.evaluate(makeCase({ medications: [dabigatran()] }), [c])).toEqual([]);
    });

    it('bloquea Dabigatrán cuando ya hay Verapamilo', () => {
      const excluded = engine.getExcludedMedications(makeCase({ medications: [calcioNodhp()] }), [c]);
      expect(excluded.has('dabigatrán')).toBeTrue();
    });

    it('bloquea Verapamilo cuando ya hay Dabigatrán', () => {
      const excluded = engine.getExcludedMedications(makeCase({ medications: [dabigatran()] }), [c]);
      expect(excluded.has('verapamilo')).toBeTrue();
    });
  });

  // C14 unificado: un único criterio general (ACOD + inhibidor de la glucoproteína P)
  // cubre amiodarona, dronedarona, verapamilo y diltiazem, que ya portan la clase
  // INHIBIDOR_GLUCOPROTEINA_P. Las antiguas subreglas específicas (C14-AMIODARONA-AOD,
  // C14-VERAPAMILO-INHIBIDORES-GLUCOPROTEINA-P) se eliminaron por subsunción para
  // evitar el doble disparo.
  describe('C14-ACOD-INHIBIDORES-GLUCOPROTEINA-P', () => {
    const c = crit('STOPP-C14-ACOD-INHIBIDORES-GLUCOPROTEINA-P');
    const amiodaronaReal = () =>
      makeMed('Amiodarona', ['ANTIARITMICO', 'PROLONGADOR_QTC', 'INHIBIDOR_GLUCOPROTEINA_P']);
    const verapamiloReal = () =>
      makeMed('Verapamilo', ['CALCIOANTAGONISTA_NO_DHP', 'INHIBIDOR_GLUCOPROTEINA_P']);
    const diltiazemReal = () =>
      makeMed('Diltiazem', ['CALCIOANTAGONISTA_NO_DHP', 'INHIBIDOR_GLUCOPROTEINA_P']);

    it('dispara con Amiodarona + anticoagulante directo', () => {
      const p = makeCase({ medications: [amiodaronaReal(), anticoagDir()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Verapamilo + anticoagulante directo', () => {
      const p = makeCase({ medications: [verapamiloReal(), anticoagDir()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Diltiazem + anticoagulante directo', () => {
      const p = makeCase({ medications: [diltiazemReal(), anticoagDir()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con inhibidor P-gp + AVK (no es anticoagulante directo)', () => {
      const p = makeCase({ medications: [verapamiloReal(), anticoagAvk()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con solo el inhibidor P-gp', () => {
      expect(engine.evaluate(makeCase({ medications: [amiodaronaReal()] }), [c])).toEqual([]);
    });

    it('no produce doble disparo de C14 con Amiodarona + ACOD en el set completo', () => {
      const p = makeCase({ medications: [amiodaronaReal(), anticoagDir()] });
      const firedC14 = engine.evaluate(p, ALL_CRITERIA).filter(x => x.id.startsWith('STOPP-C14-'));
      expect(firedC14.map(x => x.id)).toEqual(['STOPP-C14-ACOD-INHIBIDORES-GLUCOPROTEINA-P']);
    });

    it('no produce doble disparo de C14 con Verapamilo + ACOD en el set completo', () => {
      const p = makeCase({ medications: [verapamiloReal(), anticoagDir()] });
      const firedC14 = engine.evaluate(p, ALL_CRITERIA).filter(x => x.id.startsWith('STOPP-C14-'));
      expect(firedC14.map(x => x.id)).toEqual(['STOPP-C14-ACOD-INHIBIDORES-GLUCOPROTEINA-P']);
    });
  });

  describe('C16-AAS-PREVENCION-PRIMARIA', () => {
    const c = crit('STOPP-C16-AAS-PREVENCION-PRIMARIA');

    it('dispara con AAS sin enfermedad cardiovascular establecida', () => {
      expect(engine.evaluate(makeCase({ medications: [aas()] }), [c]).length).toBe(1);
    });

    it('no dispara con ictus previo + AAS (prevención secundaria)', () => {
      const p = makeCase({ diagnoses: ['ictus_previo'], medications: [aas()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con cardiopatía isquémica + AAS (prevención secundaria)', () => {
      const p = makeCase({ diagnoses: ['cardiopatia_isquemica'], medications: [aas()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });
});
