import { CriteriaEngineService } from './criteria-engine.service';
import {
  setupEngine, makeCase, crit, withAge, makeLabs,
  adt, isrn, betabloq, neuroleptico, isrs, benzo, hipnoticoZ,
  antiparkinsonAcol, anticolinergico, iace, digoxina, calcioNodhp,
  antagonistaNmda, nootropico, fenotiazina, dopaminergico, agonistaDopa,
  antihistaminico1g,
} from './criteria-test-helpers';

describe('Criterios STOPP — Sección D (Sistema nervioso central)', () => {
  let engine: CriteriaEngineService;

  beforeEach(() => { engine = setupEngine(); });

  // ─── D1 ───────────────────────────────────────────────────────────────────

  describe('D1-ADT-CONDUCCION-CARDIACA', () => {
    const c = crit('STOPP-D1-ADT-CONDUCCION-CARDIACA');

    it('dispara con trastornos conducción cardíaca + ADT', () => {
      const p = makeCase({ diagnoses: ['trastornos_conduccion_cardiaca'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin ADT', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['trastornos_conduccion_cardiaca'] }), [c])).toEqual([]);
    });

    it('no dispara sin diagnóstico', () => {
      expect(engine.evaluate(makeCase({ medications: [adt()] }), [c])).toEqual([]);
    });
  });

  describe('D1-ADT-ESTRENIMIENTO', () => {
    const c = crit('STOPP-D1-ADT-ESTRENIMIENTO');

    it('dispara con estreñimiento crónico + ADT', () => {
      const p = makeCase({ diagnoses: ['estrenimiento_cronico'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin ADT', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['estrenimiento_cronico'] }), [c])).toEqual([]);
    });
  });

  describe('D1-ADT-PROSTATISMO', () => {
    const c = crit('STOPP-D1-ADT-PROSTATISMO');

    it('dispara con prostatismo + ADT', () => {
      const p = makeCase({ diagnoses: ['prostatismo'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con retención urinaria + ADT', () => {
      const p = makeCase({ diagnoses: ['retencion_urinaria'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico', () => {
      expect(engine.evaluate(makeCase({ medications: [adt()] }), [c])).toEqual([]);
    });
  });

  describe('D1-D14_1-ADT-DEMENCIA', () => {
    const c = crit('STOPP-D1-D14_1-ADT-DEMENCIA');

    it('dispara con demencia + ADT', () => {
      const p = makeCase({ diagnoses: ['demencia'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con deterioro cognitivo + ADT', () => {
      const p = makeCase({ diagnoses: ['deterioro_cognitivo'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con delirio + ADT', () => {
      const p = makeCase({ diagnoses: ['delirio'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico cognitivo', () => {
      expect(engine.evaluate(makeCase({ medications: [adt()] }), [c])).toEqual([]);
    });
  });

  describe('D1-I2-ADT-GLAUCOMA', () => {
    const c = crit('STOPP-D1-I2-ADT-GLAUCOMA');

    it('dispara con glaucoma ángulo estrecho + ADT', () => {
      const p = makeCase({ diagnoses: ['glaucoma_angulo_estrecho'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin glaucoma', () => {
      expect(engine.evaluate(makeCase({ medications: [adt()] }), [c])).toEqual([]);
    });
  });

  // ─── D2 ───────────────────────────────────────────────────────────────────

  describe('D2-ADT-DEPRESION-PRIMERA-LINEA', () => {
    const c = crit('STOPP-D2-ADT-DEPRESION-PRIMERA-LINEA');

    it('dispara con episodio depresivo + ADT', () => {
      const p = makeCase({ diagnoses: ['episodio_depresivo'], medications: [adt()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin episodio depresivo', () => {
      expect(engine.evaluate(makeCase({ medications: [adt()] }), [c])).toEqual([]);
    });
  });

  // ─── D3 ───────────────────────────────────────────────────────────────────

  describe('D3-ISRN-HIPERTENSION-GRAVE', () => {
    const c = crit('STOPP-D3-ISRN-HIPERTENSION-GRAVE');

    it('dispara con HTA grave + Venlafaxina', () => {
      const p = makeCase({ diagnoses: ['hipertension_grave'], medications: [isrn()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con HTA grave + Duloxetina', () => {
      const p = makeCase({ diagnoses: ['hipertension_grave'], medications: [isrn('Duloxetina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin HTA grave', () => {
      expect(engine.evaluate(makeCase({ medications: [isrn()] }), [c])).toEqual([]);
    });

    it('no dispara sin ISRN', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['hipertension_grave'] }), [c])).toEqual([]);
    });
  });

  // ─── D4 ───────────────────────────────────────────────────────────────────

  describe('D4-BETABLOQUEANTE-BLOQUEO-CARDIACO', () => {
    const c = crit('STOPP-D4-BETABLOQUEANTE-BLOQUEO-CARDIACO');

    it('dispara con bloqueo AV grado 2 + betabloqueante', () => {
      const p = makeCase({ diagnoses: ['bloqueo_av_grado_2'], medications: [betabloq()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con bloqueo AV completo + betabloqueante', () => {
      const p = makeCase({ diagnoses: ['bloqueo_av_completo'], medications: [betabloq()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin bloqueo cardíaco', () => {
      expect(engine.evaluate(makeCase({ medications: [betabloq()] }), [c])).toEqual([]);
    });
  });

  describe('D4-NEUROLEPTICO-PROSTATISMO', () => {
    const c = crit('STOPP-D4-NEUROLEPTICO-PROSTATISMO');

    it('dispara con prostatismo + Haloperidol', () => {
      const p = makeCase({ diagnoses: ['prostatismo'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con retención urinaria + Risperidona', () => {
      const p = makeCase({ diagnoses: ['retencion_urinaria'], medications: [neuroleptico('Risperidona')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico urológico', () => {
      expect(engine.evaluate(makeCase({ medications: [neuroleptico()] }), [c])).toEqual([]);
    });
  });

  // ─── D5 ───────────────────────────────────────────────────────────────────

  describe('D5-D15-NEUROLEPTICO-SINTOMAS-DEMENCIA', () => {
    const c = crit('STOPP-D5-D15-NEUROLEPTICO-SINTOMAS-DEMENCIA');

    it('dispara con síntomas conductuales demencia + Haloperidol', () => {
      const p = makeCase({ diagnoses: ['sintomas_conductuales_demencia'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con síntomas conductuales demencia + Risperidona', () => {
      const p = makeCase({ diagnoses: ['sintomas_conductuales_demencia'], medications: [neuroleptico('Risperidona')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico de demencia conductual', () => {
      expect(engine.evaluate(makeCase({ medications: [neuroleptico()] }), [c])).toEqual([]);
    });
  });

  // ─── D6 ───────────────────────────────────────────────────────────────────

  describe('D6-ISRS-HIPONATREMIA', () => {
    const c = crit('STOPP-D6-ISRS-HIPONATREMIA');

    it('dispara con diagnóstico hiponatremia + ISRS', () => {
      const p = makeCase({ diagnoses: ['hiponatremia'], medications: [isrs()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con diagnóstico hiponatremia significativa + ISRS', () => {
      const p = makeCase({ diagnoses: ['hiponatremia_significativa'], medications: [isrs()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Na+ < 130 en laboratorio + ISRS', () => {
      const p = makeCase({ medications: [isrs()], labs: makeLabs({ sodio_mmol_l: 128 }) });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con Na+ >= 130', () => {
      const p = makeCase({ medications: [isrs()], labs: makeLabs({ sodio_mmol_l: 132 }) });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara sin ISRS', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['hiponatremia'] }), [c])).toEqual([]);
    });
  });

  // ─── D7 ───────────────────────────────────────────────────────────────────

  describe('D7-ISRS-SANGRADO', () => {
    const c = crit('STOPP-D7-ISRS-SANGRADO');

    it('dispara con riesgo significativo de sangrado + ISRS', () => {
      const p = makeCase({ diagnoses: ['riesgo_significativo_sangrado'], medications: [isrs()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico de sangrado', () => {
      expect(engine.evaluate(makeCase({ medications: [isrs()] }), [c])).toEqual([]);
    });
  });

  // ─── D8 ───────────────────────────────────────────────────────────────────

  describe('D8-BENZODIACEPINA-USO-PROLONGADO', () => {
    const c = crit('STOPP-D8-BENZODIACEPINA-USO-PROLONGADO');

    it('dispara con edad ≥65 + benzodiacepina', () => {
      const p = makeCase({ info: withAge(65), medications: [benzo()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con edad > 65 + benzodiacepina', () => {
      const p = makeCase({ info: withAge(80), medications: [benzo()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con edad < 65', () => {
      const p = makeCase({ info: withAge(64), medications: [benzo()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara sin edad informada', () => {
      expect(engine.evaluate(makeCase({ medications: [benzo()] }), [c])).toEqual([]);
    });
  });

  // ─── D9 ───────────────────────────────────────────────────────────────────

  describe('D9-BENZODIACEPINA-DEMENCIA-AGITACION', () => {
    const c = crit('STOPP-D9-BENZODIACEPINA-DEMENCIA-AGITACION');

    it('dispara con demencia + benzodiacepina', () => {
      const p = makeCase({ diagnoses: ['demencia'], medications: [benzo()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con síntomas conductuales demencia + benzodiacepina', () => {
      const p = makeCase({ diagnoses: ['sintomas_conductuales_demencia'], medications: [benzo()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico de demencia', () => {
      expect(engine.evaluate(makeCase({ medications: [benzo()] }), [c])).toEqual([]);
    });
  });

  // ─── D10 ──────────────────────────────────────────────────────────────────

  describe('D10-BENZODIACEPINA-INSOMNIO', () => {
    const c = crit('STOPP-D10-BENZODIACEPINA-INSOMNIO');

    it('dispara con insomnio + benzodiacepina', () => {
      const p = makeCase({ diagnoses: ['insomnio'], medications: [benzo()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin insomnio', () => {
      expect(engine.evaluate(makeCase({ medications: [benzo()] }), [c])).toEqual([]);
    });
  });

  // ─── D11 ──────────────────────────────────────────────────────────────────

  describe('D11-HIPNOTICO-Z-INSOMNIO', () => {
    const c = crit('STOPP-D11-HIPNOTICO-Z-INSOMNIO');

    it('dispara con insomnio + Zolpidem', () => {
      const p = makeCase({ diagnoses: ['insomnio'], medications: [hipnoticoZ()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con insomnio + Zopiclona', () => {
      const p = makeCase({ diagnoses: ['insomnio'], medications: [hipnoticoZ('Zopiclona')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin insomnio', () => {
      expect(engine.evaluate(makeCase({ medications: [hipnoticoZ()] }), [c])).toEqual([]);
    });
  });

  // ─── D12 ──────────────────────────────────────────────────────────────────

  describe('D12-F1-NEUROLEPTICO-PARKINSON-LEWY', () => {
    const c = crit('STOPP-D12-F1-NEUROLEPTICO-PARKINSON-LEWY');

    it('dispara con parkinsonismo + Haloperidol', () => {
      const p = makeCase({ diagnoses: ['parkinsonismo'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con demencia por cuerpos de Lewy + Risperidona', () => {
      const p = makeCase({ diagnoses: ['demencia_cuerpos_lewy'], medications: [neuroleptico('Risperidona')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico de parkinsonismo/Lewy', () => {
      expect(engine.evaluate(makeCase({ medications: [neuroleptico()] }), [c])).toEqual([]);
    });

    it('bloquea Haloperidol con parkinsonismo', () => {
      const p = makeCase({ diagnoses: ['parkinsonismo'] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('haloperidol')).toBeTrue();
    });
  });

  // ─── D13 ──────────────────────────────────────────────────────────────────

  describe('D13-ANTIPARKINSONIAN-ANTICOLINERGICO-NEUROLEPTICO', () => {
    const c = crit('STOPP-D13-ANTIPARKINSONIAN-ANTICOLINERGICO-NEUROLEPTICO');

    it('dispara con Haloperidol + Trihexifenidilo', () => {
      const p = makeCase({ medications: [neuroleptico(), antiparkinsonAcol()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Risperidona + Biperideno', () => {
      const p = makeCase({ medications: [neuroleptico('Risperidona'), antiparkinsonAcol('Biperideno')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo neuroléptico', () => {
      expect(engine.evaluate(makeCase({ medications: [neuroleptico()] }), [c])).toEqual([]);
    });

    it('no dispara con solo antiparkinsonian', () => {
      expect(engine.evaluate(makeCase({ medications: [antiparkinsonAcol()] }), [c])).toEqual([]);
    });

    it('bloquea Trihexifenidilo cuando ya hay neuroléptico', () => {
      const p = makeCase({ medications: [neuroleptico()] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('trihexifenidilo')).toBeTrue();
    });

    it('bloquea Haloperidol cuando ya hay antiparkinsonian', () => {
      const p = makeCase({ medications: [antiparkinsonAcol()] });
      const excluded = engine.getExcludedMedications(p, [c]);
      expect(excluded.has('haloperidol')).toBeTrue();
    });
  });

  // ─── D14 ──────────────────────────────────────────────────────────────────

  describe('D14-ANTICOLINERGICO-DEMENCIA', () => {
    const c = crit('STOPP-D14-ANTICOLINERGICO-DEMENCIA');

    it('dispara con demencia + anticolinérgico', () => {
      const p = makeCase({ diagnoses: ['demencia'], medications: [anticolinergico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con delirio + anticolinérgico', () => {
      const p = makeCase({ diagnoses: ['delirio'], medications: [anticolinergico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico cognitivo', () => {
      expect(engine.evaluate(makeCase({ medications: [anticolinergico()] }), [c])).toEqual([]);
    });
  });

  // ─── D16 ──────────────────────────────────────────────────────────────────

  describe('D16-NEUROLEPTICO-HIPNOTICO', () => {
    const c = crit('STOPP-D16-NEUROLEPTICO-HIPNOTICO');

    it('dispara con insomnio + neuroléptico (sin psicosis ni demencia)', () => {
      const p = makeCase({ diagnoses: ['insomnio'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con insomnio + neuroléptico + psicosis (excepción)', () => {
      const p = makeCase({ diagnoses: ['insomnio', 'psicosis'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara con insomnio + neuroléptico + síntomas conductuales demencia (excepción)', () => {
      const p = makeCase({ diagnoses: ['insomnio', 'sintomas_conductuales_demencia'], medications: [neuroleptico()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara sin insomnio', () => {
      expect(engine.evaluate(makeCase({ medications: [neuroleptico()] }), [c])).toEqual([]);
    });
  });

  // ─── D17 ──────────────────────────────────────────────────────────────────

  describe('D17-IACE-BRADICARDIA-BLOQUEO-SINCOPE', () => {
    const c = crit('STOPP-D17-IACE-BRADICARDIA-BLOQUEO-SINCOPE');

    it('dispara con diagnóstico bradicardia + Donepezilo', () => {
      const p = makeCase({ diagnoses: ['bradicardia'], medications: [iace()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con fc_lpm < 60 en laboratorio + Donepezilo', () => {
      const p = makeCase({ medications: [iace()], labs: makeLabs({ fc_lpm: 55 }) });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con bloqueo AV grado 2 + Rivastigmina', () => {
      const p = makeCase({ diagnoses: ['bloqueo_av_grado_2'], medications: [iace('Rivastigmina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con bloqueo AV completo + Galantamina', () => {
      const p = makeCase({ diagnoses: ['bloqueo_av_completo'], medications: [iace('Galantamina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con síncopes recurrentes + IACE', () => {
      const p = makeCase({ diagnoses: ['sincopes_recurrentes'], medications: [iace()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con fc_lpm >= 60', () => {
      const p = makeCase({ medications: [iace()], labs: makeLabs({ fc_lpm: 62 }) });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara sin condición cardíaca', () => {
      expect(engine.evaluate(makeCase({ medications: [iace()] }), [c])).toEqual([]);
    });
  });

  // ─── D18 ──────────────────────────────────────────────────────────────────

  describe('D18-BETABLOQUEANTE-INTERACCION-FC', () => {
    const c = crit('STOPP-D18-BETABLOQUEANTE-INTERACCION-FC');

    it('dispara con betabloqueante + Digoxina', () => {
      const p = makeCase({ medications: [betabloq(), digoxina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con betabloqueante + Verapamilo', () => {
      const p = makeCase({ medications: [betabloq(), calcioNodhp()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con betabloqueante + Diltiazem', () => {
      const p = makeCase({ medications: [betabloq(), calcioNodhp('Diltiazem')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo betabloqueante', () => {
      expect(engine.evaluate(makeCase({ medications: [betabloq()] }), [c])).toEqual([]);
    });

    it('bloquea Digoxina cuando hay betabloqueante', () => {
      const excluded = engine.getExcludedMedications(makeCase({ medications: [betabloq()] }), [c]);
      expect(excluded.has('digoxina')).toBeTrue();
    });

    it('bloquea Bisoprolol cuando hay Digoxina', () => {
      const excluded = engine.getExcludedMedications(makeCase({ medications: [digoxina()] }), [c]);
      expect(excluded.has('bisoprolol')).toBeTrue();
    });
  });

  describe('D18-DIGOXINA-INHIBIDORES-ACETILCOLINESTERASA', () => {
    const c = crit('STOPP-D18-DIGOXINA-INHIBIDORES-ACETILCOLINESTERASA');

    it('dispara con Digoxina + Donepezilo', () => {
      const p = makeCase({ medications: [digoxina(), iace()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo Digoxina', () => {
      expect(engine.evaluate(makeCase({ medications: [digoxina()] }), [c])).toEqual([]);
    });

    it('no dispara con solo IACE', () => {
      expect(engine.evaluate(makeCase({ medications: [iace()] }), [c])).toEqual([]);
    });
  });

  describe('D18-VERAPAMILO-INHIBIDORES-ACETILCOLINESTERASA', () => {
    const c = crit('STOPP-D18-VERAPAMILO-INHIBIDORES-ACETILCOLINESTERASA');

    it('dispara con Verapamilo + Donepezilo', () => {
      const p = makeCase({ medications: [calcioNodhp(), iace()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con Diltiazem + Rivastigmina', () => {
      const p = makeCase({ medications: [calcioNodhp('Diltiazem'), iace('Rivastigmina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con solo Verapamilo', () => {
      expect(engine.evaluate(makeCase({ medications: [calcioNodhp()] }), [c])).toEqual([]);
    });
  });

  // ─── D19 ──────────────────────────────────────────────────────────────────

  describe('D19-MEMANTINA-EPILEPSIA', () => {
    const c = crit('STOPP-D19-MEMANTINA-EPILEPSIA');

    it('dispara con epilepsia + Memantina', () => {
      const p = makeCase({ diagnoses: ['epilepsia'], medications: [antagonistaNmda()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin epilepsia', () => {
      expect(engine.evaluate(makeCase({ medications: [antagonistaNmda()] }), [c])).toEqual([]);
    });

    it('no dispara sin Memantina', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['epilepsia'] }), [c])).toEqual([]);
    });
  });

  // ─── D20 ──────────────────────────────────────────────────────────────────

  describe('D20-NOOTROPICO-DEMENCIA', () => {
    const c = crit('STOPP-D20-NOOTROPICO-DEMENCIA');

    it('dispara con demencia + Piracetam', () => {
      const p = makeCase({ diagnoses: ['demencia'], medications: [nootropico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con demencia + Ginkgo biloba', () => {
      const p = makeCase({ diagnoses: ['demencia'], medications: [nootropico('Ginkgo biloba')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin demencia', () => {
      expect(engine.evaluate(makeCase({ medications: [nootropico()] }), [c])).toEqual([]);
    });
  });

  // ─── D21 ──────────────────────────────────────────────────────────────────

  describe('D21-FENOTIAZINA-PRIMERA-LINEA-PSICOSIS', () => {
    const c = crit('STOPP-D21-FENOTIAZINA-PRIMERA-LINEA-PSICOSIS');

    it('dispara con psicosis + Clorpromazina', () => {
      const p = makeCase({ diagnoses: ['psicosis'], medications: [fenotiazina()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con síntomas conductuales demencia + Levomepromazina', () => {
      const p = makeCase({ diagnoses: ['sintomas_conductuales_demencia'], medications: [fenotiazina('Levomepromazina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin psicosis ni demencia conductual', () => {
      expect(engine.evaluate(makeCase({ medications: [fenotiazina()] }), [c])).toEqual([]);
    });
  });

  // ─── D22 ──────────────────────────────────────────────────────────────────

  describe('D22-DOPAMINERGICO-TEMBLOR-ESENCIAL', () => {
    const c = crit('STOPP-D22-DOPAMINERGICO-TEMBLOR-ESENCIAL');

    it('dispara con temblor esencial benigno + Levodopa', () => {
      const p = makeCase({ diagnoses: ['temblor_esencial_benigno'], medications: [dopaminergico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con temblor esencial benigno + Pramipexol', () => {
      const p = makeCase({ diagnoses: ['temblor_esencial_benigno'], medications: [agonistaDopa()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con temblor esencial benigno + Rotigotina', () => {
      const p = makeCase({ diagnoses: ['temblor_esencial_benigno'], medications: [agonistaDopa('Rotigotina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin temblor esencial benigno', () => {
      expect(engine.evaluate(makeCase({ medications: [dopaminergico()] }), [c])).toEqual([]);
    });
  });

  // ─── D23 ──────────────────────────────────────────────────────────────────

  describe('D23-DOPAMINERGICO-PARKINSONISMO-FARMACOLOGICO', () => {
    const c = crit('STOPP-D23-DOPAMINERGICO-PARKINSONISMO-FARMACOLOGICO');

    it('dispara con parkinsonismo inducido por fármacos + Levodopa', () => {
      const p = makeCase({ diagnoses: ['parkinsonismo_inducido_por_farmacos'], medications: [dopaminergico()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con parkinsonismo inducido por fármacos + Pramipexol', () => {
      const p = makeCase({ diagnoses: ['parkinsonismo_inducido_por_farmacos'], medications: [agonistaDopa()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara con parkinsonismo ordinario (no inducido)', () => {
      const p = makeCase({ diagnoses: ['parkinsonismo'], medications: [dopaminergico()] });
      expect(engine.evaluate(p, [c])).toEqual([]);
    });

    it('no dispara sin dopaminérgico', () => {
      expect(engine.evaluate(makeCase({ diagnoses: ['parkinsonismo_inducido_por_farmacos'] }), [c])).toEqual([]);
    });
  });

  // ─── D24 ──────────────────────────────────────────────────────────────────

  describe('D24-ANTIHISTAMINICO-1GEN-ALERGIA', () => {
    const c = crit('STOPP-D24-ANTIHISTAMINICO-1GEN-ALERGIA');

    it('dispara con alergia + antihistamínico 1ª gen', () => {
      const p = makeCase({ diagnoses: ['alergia'], medications: [antihistaminico1g()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con prurito + antihistamínico 1ª gen', () => {
      const p = makeCase({ diagnoses: ['prurito'], medications: [antihistaminico1g()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('dispara con alergia + Dexclorfeniramina', () => {
      const p = makeCase({ diagnoses: ['alergia'], medications: [antihistaminico1g('Dexclorfeniramina')] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin diagnóstico alérgico', () => {
      expect(engine.evaluate(makeCase({ medications: [antihistaminico1g()] }), [c])).toEqual([]);
    });
  });

  // ─── D25 ──────────────────────────────────────────────────────────────────

  describe('D25-ANTIHISTAMINICO-1GEN-INSOMNIO', () => {
    const c = crit('STOPP-D25-ANTIHISTAMINICO-1GEN-INSOMNIO');

    it('dispara con insomnio + antihistamínico 1ª gen', () => {
      const p = makeCase({ diagnoses: ['insomnio'], medications: [antihistaminico1g()] });
      expect(engine.evaluate(p, [c]).length).toBe(1);
    });

    it('no dispara sin insomnio', () => {
      expect(engine.evaluate(makeCase({ medications: [antihistaminico1g()] }), [c])).toEqual([]);
    });
  });
});
