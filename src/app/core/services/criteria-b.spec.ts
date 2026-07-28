import { CriteriaEngineService } from './criteria-engine.service';
import { critCode } from '../criteria-groups';
import {
  setupEngine, makeCase, makeLabs, crit, withAge, makeMed, ALL_CRITERIA,
  aine, betabloq, ieca, ara2, calcioNodhp, calcioDhp, digoxina,
  diureticoAsa, tiazida, alfabloqueante, sacubitriloValsartan, estatina, antihipertCentral,
  amiodarona, nitrato, pde5, aldosterona, neuroleptico,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección B (Sistema cardiovascular)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('B1-DIGOXINA', () => {
    const c = crit('STOPP-B1-DIGOXINA');

    it('dispara con IC función sistólica conservada + Digoxina', () => {
      const p = makeCase({ diagnoses: ['ic_funcion_sistolica_conservada'], medications: [digoxina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Digoxina sin ese diagnóstico', () => {
      expect(engine.evaluate(makeCase({ medications: [digoxina()] }), [c])).toEqual([]);
    });
  });

  describe('B3-VERAPAMILO-BETABLOQUEANTES', () => {
    const c = crit('STOPP-B3-VERAPAMILO-BETABLOQUEANTES');

    it('dispara con Verapamilo + betabloqueante', () => {
      const p = makeCase({ medications: [calcioNodhp(), betabloq()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo Verapamilo', () => {
      expect(engine.evaluate(makeCase({ medications: [calcioNodhp()] }), [c])).toEqual([]);
    });

    it('no dispara con solo betabloqueante', () => {
      expect(engine.evaluate(makeCase({ medications: [betabloq()] }), [c])).toEqual([]);
    });
  });

  describe('B4-BETABLOQUEANTE-BRADICARDIA', () => {
    const c = crit('STOPP-B4-BETABLOQUEANTE-BRADICARDIA');

    it('dispara con Bradicardia + betabloqueante', () => {
      const p = makeCase({ diagnoses: ['bradicardia'], medications: [betabloq()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con betabloqueante sin bradicardia', () => {
      expect(engine.evaluate(makeCase({ medications: [betabloq()] }), [c])).toEqual([]);
    });
  });

  describe('B4-DIGOXINA-BRADICARDIA', () => {
    const c = crit('STOPP-B4-DIGOXINA-BRADICARDIA');

    it('dispara con Bradicardia + Digoxina', () => {
      const p = makeCase({ diagnoses: ['bradicardia'], medications: [digoxina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Digoxina sin bradicardia', () => {
      expect(engine.evaluate(makeCase({ medications: [digoxina()] }), [c])).toEqual([]);
    });
  });

  describe('B4-DIGOXINA-BLOQUEO-CARDIACO', () => {
    const c = crit('STOPP-B4-DIGOXINA-BLOQUEO-CARDIACO');

    it('dispara con Bloqueo AV de segundo grado + Digoxina', () => {
      const p = makeCase({ diagnoses: ['bloqueo_av_grado_2'], medications: [digoxina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Bloqueo AV completo + Digoxina', () => {
      const p = makeCase({ diagnoses: ['bloqueo_av_completo'], medications: [digoxina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Digoxina sin bloqueo AV', () => {
      expect(engine.evaluate(makeCase({ medications: [digoxina()] }), [c])).toEqual([]);
    });
  });

  describe('B5-BETABLOQUEANTE-HTA-NO-COMPLICADA', () => {
    const c = crit('STOPP-B5-BETABLOQUEANTE-HTA-NO-COMPLICADA');

    it('dispara con HTA no complicada + betabloqueante', () => {
      const p = makeCase({ diagnoses: ['hta_no_complicada'], medications: [betabloq()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con betabloqueante sin HTA no complicada', () => {
      expect(engine.evaluate(makeCase({ medications: [betabloq()] }), [c])).toEqual([]);
    });
  });

  describe('B6-AMIODARONA-TAQUIARRITMIA-PRIMERA-LINEA', () => {
    const c = crit('STOPP-B6-AMIODARONA-TAQUIARRITMIA-PRIMERA-LINEA');
    const flecainida = () => makeMed('Flecainida', ['ANTIARITMICO', 'ANTIARITMICO_CLASE_IC']);
    const amiodaronaClaseIii = () =>
      makeMed('Amiodarona', ['ANTIARITMICO', 'ANTIARITMICO_CLASE_III', 'PROLONGADOR_QTC']);

    it('no dispara con flecainida + taquiarritmias supraventriculares', () => {
      const p = makeCase({
        diagnoses: ['taquiarritmias_supraventriculares'],
        medications: [flecainida()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('dispara con amiodarona + taquiarritmias supraventriculares', () => {
      const p = makeCase({
        diagnoses: ['taquiarritmias_supraventriculares'],
        medications: [amiodaronaClaseIii()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });
  });

  describe('B7-DIURETICO-ASA-PRIMERA-LINEA-HTA', () => {
    const c = crit('STOPP-B7-DIURETICO-ASA-PRIMERA-LINEA-HTA');

    it('dispara con HTA + diurético de asa', () => {
      const p = makeCase({ diagnoses: ['hta'], medications: [diureticoAsa()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con diurético de asa sin HTA', () => {
      expect(engine.evaluate(makeCase({ medications: [diureticoAsa()] }), [c])).toEqual([]);
    });

    it('no dispara (excepción) si además hay IC con FE reducida', () => {
      const p = makeCase({
        diagnoses: ['hta', 'insuficiencia_cardiaca_fe_reducida'],
        medications: [diureticoAsa()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara (excepción) si además hay IC grave', () => {
      const p = makeCase({
        diagnoses: ['hta', 'insuficiencia_cardiaca_grave'],
        medications: [diureticoAsa()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B8-DIURETICO-ASA-EDEMAS-MALEOLARES', () => {
    const c = crit('STOPP-B8-DIURETICO-ASA-EDEMAS-MALEOLARES');

    it('dispara con Edemas maleolares + diurético de asa', () => {
      const p = makeCase({ diagnoses: ['edemas_maleolares'], medications: [diureticoAsa()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin ese diagnóstico', () => {
      expect(engine.evaluate(makeCase({ medications: [diureticoAsa()] }), [c])).toEqual([]);
    });

    it('no dispara (excepción) si los edemas se explican por IC con FE reducida', () => {
      const p = makeCase({
        diagnoses: ['edemas_maleolares', 'insuficiencia_cardiaca_fe_reducida'],
        medications: [diureticoAsa()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B9-TIAZIDA-GOTA', () => {
    const c = crit('STOPP-B9-TIAZIDA-GOTA');

    it('dispara con Gota activa + tiazida', () => {
      const p = makeCase({ diagnoses: ['gota_activa'], medications: [tiazida()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Gota recurrente + tiazida', () => {
      const p = makeCase({ diagnoses: ['gota_recurrente'], medications: [tiazida()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Antecedentes de gota + tiazida', () => {
      const p = makeCase({ diagnoses: ['antecedentes_gota'], medications: [tiazida()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con tiazida sin gota', () => {
      expect(engine.evaluate(makeCase({ medications: [tiazida()] }), [c])).toEqual([]);
    });
  });

  describe('B9-TIAZIDA-HIPONATREMIA', () => {
    const c = crit('STOPP-B9-TIAZIDA-HIPONATREMIA');

    it('dispara con diagnóstico de hiponatremia + tiazida', () => {
      const p = makeCase({ diagnoses: ['hiponatremia'], medications: [tiazida()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con analítica Na < 130 + tiazida', () => {
      const p = makeCase({ medications: [tiazida()], labs: makeLabs({ sodio_mmol_l: 129 }) });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Na normal', () => {
      const p = makeCase({ medications: [tiazida()], labs: makeLabs({ sodio_mmol_l: 135 }) });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B9-TIAZIDA-HIPOPOTASEMIA', () => {
    const c = crit('STOPP-B9-TIAZIDA-HIPOPOTASEMIA');

    it('dispara con K < 3.0 + tiazida', () => {
      const p = makeCase({ medications: [tiazida()], labs: makeLabs({ potasio_mmol_l: 2.9 }) });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con K normal', () => {
      const p = makeCase({ medications: [tiazida()], labs: makeLabs({ potasio_mmol_l: 4.0 }) });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B9-TIAZIDA-HIPERCALCEMIA', () => {
    const c = crit('STOPP-B9-TIAZIDA-HIPERCALCEMIA');

    it('dispara con Ca > 2.65 + tiazida', () => {
      const p = makeCase({ medications: [tiazida()], labs: makeLabs({ calcio_corregido_mmol_l: 2.7 }) });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Ca normal', () => {
      const p = makeCase({ medications: [tiazida()], labs: makeLabs({ calcio_corregido_mmol_l: 2.4 }) });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B10-DIURETICO-ASA-INCONTINENCIA', () => {
    const c = crit('STOPP-B10-DIURETICO-ASA-INCONTINENCIA');

    it('dispara con Incontinencia urinaria + HTA + diurético de asa', () => {
      const p = makeCase({ diagnoses: ['incontinencia_urinaria', 'hta'], medications: [diureticoAsa()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin incontinencia', () => {
      expect(engine.evaluate(makeCase({ medications: [diureticoAsa()] }), [c])).toEqual([]);
    });
  });

  describe('B11-ANTIHIPERTENSIVO-CENTRAL-ANCIANOS', () => {
    const c = crit('STOPP-B11-ANTIHIPERTENSIVO-CENTRAL-ANCIANOS');

    it('dispara con HTA + antihipertensivo central sin requerir edad', () => {
      const p = makeCase({ diagnoses: ['hta'], medications: [antihipertCentral()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con HTA grave en lugar de HTA', () => {
      const p = makeCase({ diagnoses: ['hipertension_grave'], medications: [antihipertCentral()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara si tiene intolerancia a otros antihipertensivos (excepción)', () => {
      const p = makeCase({
        diagnoses: ['hta', 'intolerancia_otros_antihipertensivos'],
        medications: [antihipertCentral()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('dispara aunque la edad sea inferior a 65', () => {
      const p = makeCase({ info: withAge(60), diagnoses: ['hta'], medications: [antihipertCentral()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico de HTA', () => {
      const p = makeCase({ medications: [antihipertCentral()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B12-IECA-HIPERPOTASEMIA', () => {
    const c = crit('STOPP-B12-IECA-HIPERPOTASEMIA');

    it('dispara con diagnóstico hiperpotasemia + IECA', () => {
      const p = makeCase({ diagnoses: ['hiperpotasemia'], medications: [ieca()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con analítica K > 5.5 + IECA', () => {
      const p = makeCase({ medications: [ieca()], labs: makeLabs({ potasio_mmol_l: 5.6 }) });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con K normal', () => {
      const p = makeCase({ medications: [ieca()], labs: makeLabs({ potasio_mmol_l: 4.5 }) });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B12-ARA2-HIPERPOTASEMIA', () => {
    const c = crit('STOPP-B12-ARA2-HIPERPOTASEMIA');

    it('dispara con hiperpotasemia + ARA-II', () => {
      const p = makeCase({ diagnoses: ['hiperpotasemia'], medications: [ara2()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con ARA-II sin hiperpotasemia', () => {
      expect(engine.evaluate(makeCase({ medications: [ara2()] }), [c])).toEqual([]);
    });
  });

  describe('B13 — sin tarjetas duplicadas', () => {
    it('produce exactamente un resultado con código B13 al marcar IECA + antagonista de aldosterona', () => {
      const p = makeCase({ medications: [ieca(), aldosterona()] });
      const b13Results = engine.evaluate(p, ALL_CRITERIA).filter(c => critCode(c.id) === 'B13');
      expect(b13Results.length).toBe(1);
    });
  });

  describe('B14-INHIBIDOR-PDE5-INSUFICIENCIA-CARDIACA-HIPOTENSION', () => {
    const c = crit('STOPP-B14-INHIBIDOR-PDE5-INSUFICIENCIA-CARDIACA-HIPOTENSION');

    it('dispara con PDE5 + IC grave + Hipotensión sintomática', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_cardiaca_grave', 'hipotension_sintomatica'],
        medications: [pde5()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con PDE5 + IC grave + PAS < 90 medida', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_cardiaca_grave'],
        medications: [pde5()],
        labs: makeLabs({ pas_mmhg: 85 }),
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con PDE5 + IC grave sin hipotensión', () => {
      const p = makeCase({ diagnoses: ['insuficiencia_cardiaca_grave'], medications: [pde5()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con PDE5 + Hipotensión sin IC grave', () => {
      const p = makeCase({ diagnoses: ['hipotension_sintomatica'], medications: [pde5()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B14-INHIBIDOR-PDE5-NITRATOS', () => {
    const c = crit('STOPP-B14-INHIBIDOR-PDE5-NITRATOS');

    it('dispara con PDE5 + nitrato', () => {
      const p = makeCase({ medications: [pde5(), nitrato()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo PDE5', () => {
      expect(engine.evaluate(makeCase({ medications: [pde5()] }), [c])).toEqual([]);
    });
  });

  describe('B16-ESTATINA-PREVENCION-PRIMARIA-ANCIANO', () => {
    const c = crit('STOPP-B16-ESTATINA-PREVENCION-PRIMARIA-ANCIANO');

    it('dispara con edad ≥85 + fragilidad + estatina (sin enfermedad vascular)', () => {
      const p = makeCase({ info: withAge(85), diagnoses: ['fragilidad'], medications: [estatina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con edad < 85', () => {
      const p = makeCase({ info: withAge(80), diagnoses: ['fragilidad'], medications: [estatina()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con enfermedad cardiovascular establecida (excepción)', () => {
      const p = makeCase({
        info: withAge(85),
        diagnoses: ['fragilidad', 'enfermedad_cardiovascular'],
        medications: [estatina()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B17-AINE-ENFERMEDAD-VASCULAR', () => {
    const c = crit('STOPP-B17-AINE-ENFERMEDAD-VASCULAR');

    it('dispara con enfermedad vascular coronaria + AINE', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_coronaria'], medications: [aine()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con enfermedad vascular cerebral + AINE', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_cerebral'], medications: [aine()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con el antecedente combinado (enfermedad coronaria/cerebrovascular/periférica) + AINE', () => {
      const p = makeCase({ diagnoses: ['enfermedad_coronaria_vascular'], medications: [aine()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con AINE sin enfermedad vascular', () => {
      expect(engine.evaluate(makeCase({ medications: [aine()] }), [c])).toEqual([]);
    });
  });

  describe('B18-NEUROLEPTICO-ENFERMEDAD-VASCULAR', () => {
    const c = crit('STOPP-B18-NEUROLEPTICO-ENFERMEDAD-VASCULAR');

    it('dispara con enfermedad vascular periférica + neuroléptico', () => {
      const p = makeCase({ diagnoses: ['enfermedad_vascular_periferica'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con el antecedente combinado (enfermedad coronaria/cerebrovascular/periférica) + neuroléptico', () => {
      const p = makeCase({ diagnoses: ['enfermedad_coronaria_vascular'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con neuroléptico sin enfermedad vascular', () => {
      expect(engine.evaluate(makeCase({ medications: [neuroleptico()] }), [c])).toEqual([]);
    });
  });

  describe('B19-AINE-INSUFICIENCIA-CARDIACA', () => {
    const c = crit('STOPP-B19-AINE-INSUFICIENCIA-CARDIACA');

    it('dispara con insuficiencia cardíaca + AINE + diurético de asa', () => {
      const p = makeCase({ diagnoses: ['insuficiencia_cardiaca'], medications: [aine(), diureticoAsa()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara también con IC con FE reducida', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_cardiaca_fe_reducida'],
        medications: [aine(), diureticoAsa()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara también con IC grave', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_cardiaca_grave'],
        medications: [aine(), diureticoAsa()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con AINE sin insuficiencia cardíaca', () => {
      expect(engine.evaluate(makeCase({ medications: [aine()] }), [c])).toEqual([]);
    });
  });

  describe('B19-CORTICOIDE-SISTEMICO-IC', () => {
    const c = crit('STOPP-B19-CORTICOIDE-SISTEMICO-IC');
    const corticoide = () => makeMed('Prednisona', ['CORTICOIDE_SISTEMICO']);

    it('dispara con IC con FE reducida + corticoide + diurético de asa', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_cardiaca_fe_reducida'],
        medications: [corticoide(), diureticoAsa()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con insuficiencia cardíaca genérica + corticoide + diurético de asa', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_cardiaca'],
        medications: [corticoide(), diureticoAsa()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diurético de asa', () => {
      const p = makeCase({
        diagnoses: ['insuficiencia_cardiaca_fe_reducida'],
        medications: [corticoide()],
      });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });
  });

  describe('B20-ANTIHIPERTENSIVO-ESTENOSIS-AORTICA', () => {
    const c = crit('STOPP-B20-ANTIHIPERTENSIVO-ESTENOSIS-AORTICA');

    it('dispara con estenosis aórtica grave + furosemida', () => {
      const p = makeCase({
        diagnoses: ['estenosis_aortica_grave_sintomatica'],
        medications: [diureticoAsa()],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con estenosis aórtica grave + doxazosina', () => {
      const p = makeCase({
        diagnoses: ['estenosis_aortica_grave_sintomatica'],
        medications: [makeMed('Doxazosina', ['ALFABLOQUEANTE'])],
      });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('greying de diurético de asa sin antihipertensivo central en el caso', () => {
      const p = makeCase({ diagnoses: ['estenosis_aortica_grave_sintomatica'] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('furosemida')).toBeTrue();
    });

    it('greying de alfabloqueante sin antihipertensivo central en el caso', () => {
      const p = makeCase({ diagnoses: ['estenosis_aortica_grave_sintomatica'] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('doxazosina')).toBeTrue();
    });

    it('no dispara con furosemida sin estenosis aórtica', () => {
      expect(engine.evaluate(makeCase({ medications: [diureticoAsa()] }), [c])).toEqual([]);
    });
  });

  describe('B21-DIGOXINA-FA', () => {
    const c = crit('STOPP-B21-DIGOXINA-FA');

    it('dispara con FA + Digoxina sin duración capturada', () => {
      const p = makeCase({ diagnoses: ['fibrilacion_auricular'], medications: [digoxina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Digoxina sin FA', () => {
      expect(engine.evaluate(makeCase({ medications: [digoxina()] }), [c])).toEqual([]);
    });

    it('el summary indica revisar uso a largo plazo (> 3 meses)', () => {
      expect(c.summary.toLowerCase()).toContain('3 meses');
    });
  });
});

describe('Criterios START — Sección B (Sistema cardiovascular)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  describe('START-B1-ANTIHIPERTENSIVO-HTA', () => {
    const id = 'START-B1-ANTIHIPERTENSIVO-HTA';

    it('dispara con HTA sin antihipertensivo', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hta'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe amlodipino (DHP de primera línea)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hta'],
        medications: [calcioDhp()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe furosemida', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hta'],
        medications: [diureticoAsa()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe doxazosina', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hta'],
        medications: [alfabloqueante()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe sacubitrilo/valsartán', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hta'],
        medications: [sacubitriloValsartan()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe IECA', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['hta'],
        medications: [ieca()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-B2-ESTATINA-ENFERMEDAD-VASCULAR', () => {
    const id = 'START-B2-ESTATINA-ENFERMEDAD-VASCULAR';

    it('dispara con enfermedad vascular sin estatina', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['enfermedad_vascular_coronaria'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara en paciente con fragilidad', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['enfermedad_vascular_coronaria', 'fragilidad'],
        medications: [],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara si ya recibe estatina', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['enfermedad_vascular_coronaria'],
        medications: [estatina()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-B8-ISGLT2-INSUFICIENCIA-CARDIACA', () => {
    const id = 'START-B8-ISGLT2-INSUFICIENCIA-CARDIACA';

    it('dispara con IC con FE reducida', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['insuficiencia_cardiaca_fe_reducida'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con IC con función sistólica conservada (FE preservada)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['ic_funcion_sistolica_conservada'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('dispara con IC grave', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['insuficiencia_cardiaca_grave'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe iSGLT2', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['ic_funcion_sistolica_conservada'],
        medications: [makeMed('Empagliflozina', ['ISGLT2'])],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-B7-ANTAGONISTA-ALDOSTERONA-IC', () => {
    const id = 'START-B7-ANTAGONISTA-ALDOSTERONA-IC';
    const dx = ['insuficiencia_cardiaca_fe_reducida'];

    it('dispara con IC-FE-reducida sin antagonista de aldosterona', () => {
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

    it('dispara con eGFR = 30 (umbral inclusive vía egfrBelow)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        labs: makeLabs({ egfr_ml_min_173: 30 }),
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe espironolactona', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: dx,
        medications: [aldosterona()],
      }), [crit(id)])).toEqual([]);
    });
  });

  describe('START-B10-BETABLOQUEANTE-FA-MAL-CONTROL', () => {
    const id = 'START-B10-BETABLOQUEANTE-FA-MAL-CONTROL';

    it('dispara con «FA crónica con mal control de frecuencia» sin betabloqueante', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['fa_mal_control_frecuencia'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no exige marcar además la FA genérica (el diagnóstico específico la implica)', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['fa_mal_control_frecuencia', 'fibrilacion_auricular'],
        medications: [],
      }), [crit(id)]).length).toBe(1);
    });

    it('no dispara si ya recibe betabloqueante', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['fa_mal_control_frecuencia'],
        medications: [betabloq()],
      }), [crit(id)])).toEqual([]);
    });

    it('no dispara con FA sin mal control de frecuencia documentado', () => {
      expect(engine.evaluate(makeCase({
        diagnoses: ['fibrilacion_auricular'],
        medications: [],
      }), [crit(id)])).toEqual([]);
    });
  });
});
