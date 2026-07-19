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
