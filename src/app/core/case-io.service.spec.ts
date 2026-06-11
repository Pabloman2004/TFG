import { TestBed } from '@angular/core/testing';

import { CaseIoService } from './case-io.service';
import { CaseStoreService } from './case-store.service';
import { PatientCase } from './types';

const makePatientCase = (overrides: Partial<PatientCase> = {}): PatientCase => ({
  info: null,
  diagnoses: [],
  medications: [],
  labs: null,
  ...overrides,
});

const makeExportJson = (patientCase: PatientCase = makePatientCase()): string =>
  JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), patientCase });

const makeFile = (content: string): File =>
  new File([content], 'caso.json', { type: 'application/json' });

describe('CaseIoService — importFile()', () => {
  let service: CaseIoService;
  let store: jasmine.SpyObj<CaseStoreService>;

  beforeEach(() => {
    store = jasmine.createSpyObj('CaseStoreService', ['loadCase', 'patientCase'], {
      patient: jasmine.createSpy().and.returnValue(null),
    });
    (store as unknown as { patientCase: PatientCase }).patientCase = makePatientCase();

    TestBed.configureTestingModule({
      providers: [
        CaseIoService,
        { provide: CaseStoreService, useValue: store },
      ],
    });
    service = TestBed.inject(CaseIoService);
  });

  it('restaura el caso al importar un JSON válido', async () => {
    const pc = makePatientCase({ diagnoses: ['hta', 'dm2'] });
    await service.importFile(makeFile(makeExportJson(pc)));
    expect(store.loadCase).toHaveBeenCalledWith(jasmine.objectContaining({ diagnoses: ['hta', 'dm2'] }));
  });

  it('restaura medicamentos correctamente', async () => {
    const pc = makePatientCase({ medications: [{ id: 'Ibuprofeno', drugClasses: ['AINE'] }] });
    await service.importFile(makeFile(makeExportJson(pc)));
    expect(store.loadCase).toHaveBeenCalledWith(jasmine.objectContaining({
      medications: jasmine.arrayContaining([jasmine.objectContaining({ id: 'Ibuprofeno' })])
    }));
  });

  it('rechaza un archivo con JSON malformado', async () => {
    await expectAsync(service.importFile(makeFile('esto no es json')))
      .toBeRejectedWithError(/formato/i);
  });

  it('rechaza un JSON sin la propiedad patientCase', async () => {
    const bad = JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString() });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/formato/i);
  });

  it('rechaza un JSON con diagnoses que no es array', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      patientCase: { info: null, diagnoses: 'hta', medications: [], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/formato/i);
  });

  it('rechaza un JSON con medications que no es array', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      patientCase: { info: null, diagnoses: [], medications: 'ibuprofeno', labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/formato/i);
  });

  it('restaura los sets de tabs revisados al importar un caso', async () => {
    const pc = makePatientCase({
      reviewedMedTabs: ['cardiovascular', 'snc'],
      reviewedDxTabs: ['otros'],
    });
    await service.importFile(makeFile(makeExportJson(pc)));
    expect(store.loadCase).toHaveBeenCalledWith(jasmine.objectContaining({
      reviewedMedTabs: ['cardiovascular', 'snc'],
      reviewedDxTabs: ['otros'],
    }));
  });

  it('acepta JSON antiguo sin los campos de tabs revisados', async () => {
    const pc = makePatientCase();
    await service.importFile(makeFile(makeExportJson(pc)));
    expect(store.loadCase).toHaveBeenCalled();
  });

  // T4 — validación de tipos internos

  it('[T4] rechaza un Med sin id', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: { info: null, diagnoses: [], medications: [{ drugClasses: ['AINE'] }], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/formato/i);
  });

  it('[T4] rechaza Labs con string donde va número', async () => {
    const badLabs = {
      glucosa_mg_dl: null, colesterol_total_mg_dl: null, trigliceridos_mg_dl: null,
      hdl_mg_dl: null, ldl_mg_dl: null, creatinina_mg_dl: null,
      egfr_ml_min_173: 'invalid', // ← debería ser number | null
      inr: null, tsh_uUl: null, fc_lpm: null, qtc_ms: null,
      potasio_mmol_l: null, sodio_mmol_l: null, calcio_corregido_mmol_l: null,
      pas_mmhg: null, pad_mmhg: null,
    };
    const bad = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: { info: null, diagnoses: [], medications: [], labs: badLabs },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/formato/i);
  });

  it('[T4] rechaza cuando patientCase es null', async () => {
    const bad = JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), patientCase: null });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/formato/i);
  });

  it('[T4] rechaza export sin campo version', async () => {
    const bad = JSON.stringify({
      exportedAt: new Date().toISOString(),
      patientCase: { info: null, diagnoses: [], medications: [], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/formato/i);
  });

  it('[T4] acepta un fixture válido completo', async () => {
    const valid = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: {
        info: { name: 'Paciente', age: 75, sex: 'F', mrn: null, weightKg: null, heightCm: null, notes: null },
        diagnoses: ['hta'],
        medications: [{ id: 'Ibuprofeno', drugClasses: ['AINE'] }],
        labs: null,
      },
    });
    await expectAsync(service.importFile(makeFile(valid))).toBeResolved();
  });
});
