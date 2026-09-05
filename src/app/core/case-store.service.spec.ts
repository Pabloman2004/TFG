import { TestBed } from '@angular/core/testing';

import { CaseStoreService } from './case-store.service';

describe('CaseStoreService — tabs revisados', () => {
  let store: CaseStoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(CaseStoreService);
  });

  afterEach(() => localStorage.clear());

  it('inicia los sets de revisión vacíos', () => {
    expect(store.reviewedMedTabs().size).toBe(0);
    expect(store.reviewedDxTabs().size).toBe(0);
    expect(store.isMedTabReviewed('cardiovascular')).toBe(false);
    expect(store.isDxTabReviewed('cardiovascular')).toBe(false);
  });

  it('toggleMedTabReviewed añade y quita el id del set', () => {
    store.toggleMedTabReviewed('cardiovascular');
    expect(store.isMedTabReviewed('cardiovascular')).toBe(true);
    store.toggleMedTabReviewed('cardiovascular');
    expect(store.isMedTabReviewed('cardiovascular')).toBe(false);
  });

  it('toggleDxTabReviewed actúa de forma independiente del set de meds', () => {
    store.toggleDxTabReviewed('renal');
    expect(store.isDxTabReviewed('renal')).toBe(true);
    expect(store.isMedTabReviewed('renal')).toBe(false);
  });

  it('clearMedTabReviewed quita el id sin tocar el resto', () => {
    store.toggleMedTabReviewed('cardiovascular');
    store.toggleMedTabReviewed('renal');
    store.clearMedTabReviewed('cardiovascular');
    expect(store.isMedTabReviewed('cardiovascular')).toBe(false);
    expect(store.isMedTabReviewed('renal')).toBe(true);
  });

  it('reset() vacía ambos sets de revisión', () => {
    store.toggleMedTabReviewed('cardiovascular');
    store.toggleDxTabReviewed('cardiovascular');
    store.reset();
    expect(store.reviewedMedTabs().size).toBe(0);
    expect(store.reviewedDxTabs().size).toBe(0);
  });

  it('patientCase incluye los sets serializados como arrays', () => {
    store.toggleMedTabReviewed('cardiovascular');
    store.toggleDxTabReviewed('renal');
    store.toggleDxTabReviewed('otros');
    const pc = store.patientCase;
    expect(pc.reviewedMedTabs).toEqual(['cardiovascular']);
    expect(pc.reviewedDxTabs?.sort()).toEqual(['otros', 'renal']);
  });

  it('loadCase restaura los sets de revisión desde arrays', () => {
    store.loadCase({
      info: null,
      diagnoses: [],
      medications: [],
      labs: null,
      reviewedMedTabs: ['cardiovascular', 'snc'],
      reviewedDxTabs: ['otros'],
    });
    expect(store.isMedTabReviewed('cardiovascular')).toBe(true);
    expect(store.isMedTabReviewed('snc')).toBe(true);
    expect(store.isDxTabReviewed('otros')).toBe(true);
  });

  it('loadCase sin sets reseteados deja los sets vacíos (compat con JSON antiguos)', () => {
    store.toggleMedTabReviewed('cardiovascular');
    store.loadCase({ info: null, diagnoses: [], medications: [], labs: null });
    expect(store.reviewedMedTabs().size).toBe(0);
    expect(store.reviewedDxTabs().size).toBe(0);
  });

  it('persiste los sets en localStorage y los rehidrata al recrear el store', () => {
    store.toggleMedTabReviewed('cardiovascular');
    store.toggleDxTabReviewed('renal');
    TestBed.tick();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const newStore = TestBed.inject(CaseStoreService);
    expect(newStore.isMedTabReviewed('cardiovascular')).toBe(true);
    expect(newStore.isDxTabReviewed('renal')).toBe(true);
  });

  it('al arrancar elimina la clave legado historial de localStorage', () => {
    localStorage.setItem('historial', JSON.stringify([{ id: 'x' }]));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    TestBed.inject(CaseStoreService);
    expect(localStorage.getItem('historial')).toBeNull();
  });
});

const validLabs = {
  egfr_ml_min_173: 42,
  tsh_uUl: null,
  fc_lpm: null,
  qtc_ms: null,
  potasio_mmol_l: null,
  sodio_mmol_l: null,
  calcio_corregido_mmol_l: null,
  pas_mmhg: 158,
  pad_mmhg: 92,
};

function storeFromLocalStorage(): CaseStoreService {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({});
  return TestBed.inject(CaseStoreService);
}

describe('CaseStoreService — rehidratación con esquema Zod', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('descarta medicaciones persistidas que no cumplen el esquema y arranca vacío', () => {
    localStorage.setItem('meds', JSON.stringify([{ id: 12, drugClasses: 'AINE' }]));
    localStorage.setItem('diagnoses', JSON.stringify(['hta']));
    const store = storeFromLocalStorage();
    expect(store.meds()).toEqual([]);
    expect(store.diagnoses()).toEqual([]);
  });

  it('descarta un paciente persistido con sexo inválido y no mezcla el resto del caso', () => {
    localStorage.setItem('patient', JSON.stringify({
      name: 'Ana', age: 80, sex: 'X',
    }));
    localStorage.setItem('meds', JSON.stringify([
      { id: 'Amlodipino', drugClasses: ['CALCIOANTAGONISTA_DHP'] },
    ]));
    const store = storeFromLocalStorage();
    expect(store.patient()).toBeNull();
    expect(store.meds()).toEqual([]);
  });

  it('rehidrata un caso persistido válido, descartando claves de analítica retiradas', () => {
    localStorage.setItem('diagnoses', JSON.stringify(['hta']));
    localStorage.setItem('meds', JSON.stringify([
      { id: 'Amlodipino', drugClasses: ['CALCIOANTAGONISTA_DHP'] },
    ]));
    localStorage.setItem('labs', JSON.stringify({
      ...validLabs,
      glucose_mg_dl: 110,
    }));
    const store = storeFromLocalStorage();
    expect(store.diagnoses()).toEqual(['hta']);
    expect(store.meds()).toEqual([
      { id: 'Amlodipino', drugClasses: ['CALCIOANTAGONISTA_DHP'] },
    ]);
    expect(store.labs()).toEqual(validLabs);
  });

  it('si los diagnósticos persistidos no son un array, arranca con la lista vacía', () => {
    localStorage.setItem('diagnoses', JSON.stringify({ hta: true }));
    const store = storeFromLocalStorage();
    expect(store.diagnoses()).toEqual([]);
  });
});
