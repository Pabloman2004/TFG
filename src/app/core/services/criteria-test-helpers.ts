// @linked docs/motor-criterios.md
// Si cambias las factories de PatientCase/Med o setupEngine, actualiza el doc enlazado.

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CriteriaEngineService } from './criteria-engine.service';
import { Crit, Labs, Med, PatientCase } from '../types';
import criteriaData from '../../../assets/data/criteria.json';

// ─── Datos reales de criteria.json ───────────────────────────────────────────

export const ALL_CRITERIA: Crit[] = (criteriaData as { criteria: Crit[] }).criteria;

export const crit = (id: string): Crit => {
  const c = ALL_CRITERIA.find(x => x.id === id);
  if (!c) throw new Error(`Criterio "${id}" no encontrado en criteria.json`);
  return c;
};

// ─── Setup de TestBed ─────────────────────────────────────────────────────────

export const setupEngine = (): CriteriaEngineService => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return TestBed.inject(CriteriaEngineService);
};

// ─── Factories de PatientCase ─────────────────────────────────────────────────

export const makeMed = (id: string, drugClasses: string[], extras: Partial<Med> = {}): Med =>
  ({ id, drugClasses, ...extras });

export const makeLabs = (overrides: Partial<Labs> = {}): Labs => ({
  egfr_ml_min_173: null, tsh_uUl: null, fc_lpm: null, qtc_ms: null,
  potasio_mmol_l: null, sodio_mmol_l: null, calcio_corregido_mmol_l: null,
  pas_mmhg: null, pad_mmhg: null,
  ...overrides,
});

export const makeCase = (overrides: Partial<PatientCase> = {}): PatientCase => ({
  info: null, diagnoses: [], medications: [], labs: null, ...overrides,
});

export const withAge = (age: number): PatientCase['info'] => ({
  name: 'Test', age, sex: 'M', mrn: null, weightKg: null, heightCm: null, notes: null,
});

// ─── Factories de medicamentos ────────────────────────────────────────────────

export const aine          = (id = 'Ibuprofeno')         => makeMed(id, ['AINE']);
export const anticoag      = (id = 'Apixaban')           => makeMed(id, ['ANTICOAGULANTE', 'ANTICOAGULANTE_DIRECTO']);
export const anticoagAvk   = (id = 'Warfarina')          => makeMed(id, ['ANTICOAGULANTE', 'ANTICOAGULANTE_AVK']);
export const anticoagDir   = (id = 'Apixaban')           => makeMed(id, ['ANTICOAGULANTE', 'ANTICOAGULANTE_DIRECTO']);
export const inhibidorFactorXa = (id = 'Apixaban')       => makeMed(id, ['ANTICOAGULANTE', 'ANTICOAGULANTE_DIRECTO', 'INHIBIDOR_FACTOR_XA']);
export const dabigatran    = ()                          => makeMed('Dabigatrán', ['ANTICOAGULANTE', 'ANTICOAGULANTE_DIRECTO', 'INHIBIDOR_DIRECTO_TROMBINA']);
export const antiag        = (id = 'Clopidogrel')        => makeMed(id, ['ANTIAGREGANTE']);
export const aas           = ()                          => makeMed('Ácido acetilsalicílico', ['ANTIAGREGANTE', 'AAS']);
export const betabloq      = (id = 'Bisoprolol')         => makeMed(id, ['BETABLOQUEANTE']);
export const ieca          = (id = 'Enalapril')          => makeMed(id, ['IECA']);
export const ara2          = (id = 'Valsartán')          => makeMed(id, ['ARA2']);
export const calcioNodhp   = (id = 'Verapamilo')         => makeMed(id, ['CALCIOANTAGONISTA_NO_DHP']);
export const calcioDhp     = (id = 'Amlodipino')         => makeMed(id, ['CALCIOANTAGONISTA_DHP']);
export const digoxina      = ()                          => makeMed('Digoxina', ['DIGOXINA']);
export const diureticoAsa  = (id = 'Furosemida')         => makeMed(id, ['DIURETICO_ASA']);
export const tiazida       = (id = 'Hidroclorotiazida')  => makeMed(id, ['DIURETICO_TIAZIDICO']);
export const alfabloqueante = (id = 'Doxazosina')        => makeMed(id, ['ALFABLOQUEANTE']);
export const sacubitriloValsartan = ()                   => makeMed('Sacubitrilo/Valsartán', ['SACUBITRILO_VALSARTAN']);
export const estatina      = (id = 'Atorvastatina')      => makeMed(id, ['ESTATINA']);
export const isrs          = (id = 'Citalopram')         => makeMed(id, ['ISRS']);
export const neuroleptico  = (id = 'Haloperidol')        => makeMed(id, ['NEUROLEPTICO']);
export const adt           = (id = 'Amitriptilina')      => makeMed(id, ['ANTIDEPRESIVO_TRICICLICO', 'ANTICOLINERGICO']);
export const antihipertCentral = (id = 'Metildopa')      => makeMed(id, ['ANTIHIPERTENSIVO_CENTRAL']);
export const antiagTico    = ()                          => makeMed('Ticlopidina', ['ANTIAGREGANTE', 'TICLOPIDINA']);
export const amiodarona    = ()                          => makeMed('Amiodarona', ['ANTIARITMICO', 'ANTIARITMICO_CLASE_III', 'PROLONGADOR_QTC']);
export const nitrato       = ()                          => makeMed('Isosorbide', ['NITRATO']);
export const pde5          = ()                          => makeMed('Sildenafilo', ['INHIBIDOR_PDE5']);
export const aldosterona   = ()                          => makeMed('Espironolactona', ['ANTAGONISTA_ALDOSTERONA']);
export const dronedarona   = ()                          => makeMed('Dronedarona', ['ANTIARITMICO']);
export const isrn              = (id = 'Venlafaxina')        => makeMed(id, ['ISRN']);
export const benzo             = (id = 'Lorazepam')          => makeMed(id, ['BENZODIACEPINA']);
export const hipnoticoZ        = (id = 'Zolpidem')           => makeMed(id, ['HIPNOTICO_Z']);
export const antiparkinsonAcol = (id = 'Trihexifenidilo')    => makeMed(id, ['ANTIPARKINSONIAN_ANTICOLINERGICO']);
export const anticolinergico   = (id = 'Atropina')           => makeMed(id, ['ANTICOLINERGICO']);
export const iace              = (id = 'Donepezilo')         => makeMed(id, ['INHIBIDOR_ACETILCOLINESTERASA']);
export const antagonistaNmda   = ()                          => makeMed('Memantina', ['ANTAGONISTA_NMDA']);
export const nootropico        = (id = 'Piracetam')          => makeMed(id, ['NOOTROPICO']);
export const fenotiazina       = (id = 'Clorpromazina')      => makeMed(id, ['FENOTIAZINA']);
export const dopaminergico     = ()                          => makeMed('Levodopa/Carbidopa', ['DOPAMINERGICO']);
export const agonistaDopa      = (id = 'Pramipexol')         => makeMed(id, ['AGONISTA_DOPAMINERGICO']);
export const antihistaminico1g = (id = 'Difenhidramina')     => makeMed(id, ['ANTIHISTAMINICO_1GEN']);
