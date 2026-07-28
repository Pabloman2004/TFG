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

describe('CaseIoService — exportCase()', () => {
  let service: CaseIoService;
  let store: jasmine.SpyObj<CaseStoreService>;

  beforeEach(() => {
    store = jasmine.createSpyObj('CaseStoreService', ['loadCase'], {
      patient: jasmine.createSpy('patient').and.returnValue({ name: 'María Gómez', age: 70, sex: 'F' }),
    });
    (store as unknown as { patientCase: PatientCase }).patientCase = makePatientCase({
      diagnoses: ['hta'],
      medications: [{ id: 'Ibuprofeno', drugClasses: ['AINE'] }],
    });

    TestBed.configureTestingModule({
      providers: [
        CaseIoService,
        { provide: CaseStoreService, useValue: store },
      ],
    });
    service = TestBed.inject(CaseIoService);
  });

  it('nombra el fichero con el paciente y la fecha, y dispara la descarga', () => {
    const createObjectURL = spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    spyOn(URL, 'revokeObjectURL');
    const click = jasmine.createSpy('click');
    const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement;
    spyOn(document, 'createElement').and.returnValue(anchor);

    service.exportCase();

    expect(createObjectURL).toHaveBeenCalled();
    const blob = createObjectURL.calls.mostRecent().args[0] as Blob;
    expect(blob.type).toBe('application/json');
    expect(click).toHaveBeenCalled();
    expect(anchor.download).toMatch(/^stopp-start_maría_gómez_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('revoca la object URL de forma diferida tras el click', async () => {
    spyOn(URL, 'createObjectURL').and.returnValue('blob:deferred');
    const revokeObjectURL = spyOn(URL, 'revokeObjectURL');
    spyOn(document, 'createElement').and.returnValue({
      href: '', download: '', click: jasmine.createSpy('click'),
    } as unknown as HTMLAnchorElement);

    service.exportCase();
    expect(revokeObjectURL).not.toHaveBeenCalled();

    await new Promise<void>(resolve => setTimeout(resolve, 0));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:deferred');
  });

  it('el blob contiene el patientCase exportado en versión 1.0', async () => {
    let captured: Blob | null = null;
    spyOn(URL, 'createObjectURL').and.callFake((blob: Blob) => {
      captured = blob;
      return 'blob:content';
    });
    spyOn(URL, 'revokeObjectURL');
    spyOn(document, 'createElement').and.returnValue({
      href: '', download: '', click: jasmine.createSpy('click'),
    } as unknown as HTMLAnchorElement);

    service.exportCase();
    expect(captured).toBeTruthy();
    const parsed = JSON.parse(await captured!.text()) as { version: string; patientCase: PatientCase };
    expect(parsed.version).toBe('1.0');
    expect(parsed.patientCase.diagnoses).toEqual(['hta']);
    expect(parsed.patientCase.medications[0]?.id).toBe('Ibuprofeno');
  });
});

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

  it('carga sin error un caso antiguo con doseMgDay/doseMcgDay/durationDays', async () => {
    const pc = makePatientCase({
      medications: [{
        id: 'Digoxina',
        drugClasses: ['DIGOXINA'],
        doseMcgDay: 125,
        doseMgDay: 0.125,
        durationDays: 91,
      }],
    });
    await expectAsync(service.importFile(makeFile(makeExportJson(pc)))).toBeResolved();
    expect(store.loadCase).toHaveBeenCalledWith(jasmine.objectContaining({
      medications: jasmine.arrayContaining([jasmine.objectContaining({
        id: 'Digoxina',
        doseMcgDay: 125,
        durationDays: 91,
      })]),
    }));
  });

  it('rechaza un archivo con JSON malformado', async () => {
    await expectAsync(service.importFile(makeFile('esto no es json')))
      .toBeRejectedWithError(/formato/i);
  });

  it('rechaza un JSON sin la propiedad patientCase', async () => {
    const bad = JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString() });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
  });

  it('rechaza un JSON con diagnoses que no es array', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      patientCase: { info: null, diagnoses: 'hta', medications: [], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
  });

  it('rechaza un JSON con medications que no es array', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      patientCase: { info: null, diagnoses: [], medications: 'ibuprofeno', labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
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
      .toBeRejectedWithError(/caso válido/i);
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
      .toBeRejectedWithError(/caso válido/i);
  });

  it('[T4] rechaza cuando patientCase es null', async () => {
    const bad = JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), patientCase: null });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
  });

  it('[T4] rechaza export sin campo version', async () => {
    const bad = JSON.stringify({
      exportedAt: new Date().toISOString(),
      patientCase: { info: null, diagnoses: [], medications: [], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
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

  // B2 — frontera de importación

  it('[B2] rechaza info que no es objeto ni null', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: { info: 'x', diagnoses: [], medications: [], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
    expect(store.loadCase).not.toHaveBeenCalled();
  });

  it('[B2] rechaza diagnoses con elementos que no son string', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: { info: null, diagnoses: ['hta', 123, {}], medications: [], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
    expect(store.loadCase).not.toHaveBeenCalled();
  });

  it('[B2] rechaza reviewedMedTabs que no es array', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: {
        info: null, diagnoses: [], medications: [], labs: null, reviewedMedTabs: 42,
      },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
    expect(store.loadCase).not.toHaveBeenCalled();
  });

  it('[B2] rechaza labs como objeto vacío', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: { info: null, diagnoses: [], medications: [], labs: {} },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/caso válido/i);
    expect(store.loadCase).not.toHaveBeenCalled();
  });

  it('[B14] rechaza versión desconocida con mensaje claro', async () => {
    const bad = JSON.stringify({
      version: '99.0',
      exportedAt: new Date().toISOString(),
      patientCase: { info: null, diagnoses: [], medications: [], labs: null },
    });
    await expectAsync(service.importFile(makeFile(bad)))
      .toBeRejectedWithError(/versión|caso válido/i);
    expect(store.loadCase).not.toHaveBeenCalled();
  });

  it('el mensaje de rechazo no expone el dump técnico de Zod', async () => {
    const bad = JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: { info: 'x', diagnoses: [], medications: [], labs: null },
    });
    try {
      await service.importFile(makeFile(bad));
      fail('debería rechazar');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      expect(message).toMatch(/caso válido/i);
      expect(message).not.toMatch(/ZodError|expected|Received/i);
    }
  });
});
