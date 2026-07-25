import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { DiagnosisStepComponent } from './diagnosis-step.component';
import { CaseStoreService } from '../../core/case-store.service';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { ReportService } from '../../core/report.service';
import { CaseIoService } from '../../core/case-io.service';
import { routes } from '../../app.routes';
import { Med, PatientCase } from '../../core/types';
import { DIAGNOSIS_TABS } from '../../core/data/diagnoses-taxonomy';
import { resolveDiagnosisLabel } from '../../core/data/diagnoses';
import { ALL_CRITERIA } from '../../core/services/criteria-test-helpers';
import { buildDxDependencies } from '../../core/data/dx-dependencies';

const med = (id: string, drugClasses: string[]): Med => ({ id, drugClasses });
const TEST_DX_DEPS = buildDxDependencies(ALL_CRITERIA);

const engineStub = () => ({
  relevance: signal(null),
  dxDependencies: signal(TEST_DX_DEPS),
  evaluate: () => [],
  loadCriteria: () => Promise.resolve([]),
});

describe('DiagnosisStepComponent.toggleDiagnosis — exclusividad de variantes HTA (P15)', () => {
  let store: CaseStoreService;
  let engine: ReturnType<typeof engineStub>;

  const createComponent = (): DiagnosisStepComponent => {
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    return fixture.componentInstance;
  };

  beforeEach(() => {
    engine = engineStub();
    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engine },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });

    store = TestBed.inject(CaseStoreService);
    // DIURETICO_ASA habilita HTA grave, HTA moderada y HTA no complicada.
    store.meds.set([med('Furosemida', ['DIURETICO_ASA'])]);
    store.diagnoses.set([]);
  });

  it('seleccionar HTA grave con HTA moderada activa deja solo hipertension_grave', () => {
    const component = createComponent();
    store.diagnoses.set(['hipertension_moderada']);

    component.toggleDiagnosis('HTA grave');

    expect(store.diagnoses()).toEqual(['hipertension_grave']);
  });

  it('la raíz "HTA (sin especificar)" también desplaza a las variantes', () => {
    const component = createComponent();
    store.diagnoses.set(['hipertension_grave']);

    component.toggleDiagnosis('HTA');

    expect(store.diagnoses()).toEqual(['hta']);
  });

  it('no afecta a diagnósticos de otras familias ya seleccionados', () => {
    const component = createComponent();
    store.diagnoses.set(['bradicardia', 'hipertension_moderada']);

    component.toggleDiagnosis('HTA grave');

    expect(store.diagnoses()).toEqual(['bradicardia', 'hipertension_grave']);
  });

  it('el radio respeta isDxEnabled: una variante deshabilitada no se selecciona', () => {
    // Dependencia sintética: el catálogo real ya no gatea las variantes de HTA
    // (START-B1 las exime), y aquí se ejercita el guard de toggleDiagnosis.
    engine.dxDependencies.set({
      'HTA grave': { classes: ['DIGOXINA'], tooltip: 'Disponible si se marca Digoxina' },
    });
    const component = createComponent();
    store.meds.set([]); // sin medicación habilitante
    store.diagnoses.set(['hipertension_moderada']);

    component.toggleDiagnosis('HTA grave');

    // No se añade la deshabilitada y no se toca el estado previo.
    expect(store.diagnoses()).toEqual(['hipertension_moderada']);
  });

  it('deseleccionar una variante la quita sin tocar otros diagnósticos', () => {
    const component = createComponent();
    store.diagnoses.set(['hipertension_grave', 'bradicardia']);

    component.toggleDiagnosis('HTA grave');

    expect(store.diagnoses()).toEqual(['bradicardia']);
  });
});

describe('DiagnosisStepComponent — UI del árbol de variantes HTA (P15 paso 4)', () => {
  let store: CaseStoreService;
  let engine: ReturnType<typeof engineStub>;

  const hipertensionGroup = () =>
    DIAGNOSIS_TABS.find(t => t.id === 'cardiovascular')!.groups.find(g => g.id === 'hipertension')!;

  const render = () => {
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    engine = engineStub();
    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engine },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });

    store = TestBed.inject(CaseStoreService);
    store.meds.set([med('Furosemida', ['DIURETICO_ASA'])]);
    store.diagnoses.set([]);
    store.activeSystemTab.set('cardiovascular');
  });

  it('renderiza la familia HTA con encabezado, opción raíz "(sin especificar)" y controles radio', () => {
    const fixture = render();
    const host: HTMLElement = fixture.nativeElement;

    const familyHeaders = Array.from(host.querySelectorAll('.dx-family-hd')).map(
      e => e.textContent?.trim(),
    );
    expect(familyHeaders).toContain('HTA');

    const text = host.textContent ?? '';
    expect(text).toContain('HTA (sin especificar)');
    expect(text).toContain('HTA no complicada');
    expect(text).toContain('HTA grave');

    // Las variantes usan control radio (.rbx), no checkbox.
    expect(host.querySelectorAll('.dx-family .rbx').length).toBeGreaterThanOrEqual(4);
  });

  it('no duplica las variantes como filas planas (checkbox) fuera del árbol', () => {
    const fixture = render();
    const host: HTMLElement = fixture.nativeElement;

    // "Intolerancia/fallo a otros antihipertensivos" sí es plano (checkbox);
    // las HTA NO deben aparecer como checkbox plano.
    const plainCheckboxRows = Array.from(host.querySelectorAll('.dx-list > .drug-row .drug-name'))
      .map(e => e.textContent?.trim());
    expect(plainCheckboxRows).not.toContain('HTA grave');
  });

  it('el conteo de grupo cuenta una variante seleccionada como 1', () => {
    const fixture = render();
    fixture.componentInstance.toggleDiagnosis('HTA grave');
    fixture.detectChanges();

    expect(fixture.componentInstance.groupSelectionCount(hipertensionGroup())).toBe(1);
  });

  it('el conteo de tab refleja la variante seleccionada', () => {
    const fixture = render();
    const cardio = DIAGNOSIS_TABS.find(t => t.id === 'cardiovascular')!;
    fixture.componentInstance.toggleDiagnosis('HTA moderada');
    fixture.detectChanges();

    expect(fixture.componentInstance.tabSelectionCount(cardio)).toBe(1);
  });

  it('[B3] seleccionar Otro una vez suma 1 al badge y no renderiza fila personalizada «otro»', () => {
    const fixture = render();
    const group = hipertensionGroup();
    const cardio = DIAGNOSIS_TABS.find(t => t.id === 'cardiovascular')!;
    fixture.componentInstance.toggleOtroDx(group);
    fixture.detectChanges();

    expect(fixture.componentInstance.groupSelectionCount(group)).toBe(1);
    expect(fixture.componentInstance.tabSelectionCount(cardio)).toBe(1);
    expect(fixture.componentInstance.customDxFor(group)).toEqual([]);
    const customLabels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.drug-row .drug-name'),
    ).map(e => e.textContent?.trim().toLowerCase());
    expect(customLabels).not.toContain('otro');
  });

  it('una variante deshabilitada (sin medicación habilitante) se renderiza como dx-disabled', () => {
    // El catálogo real ya no gatea ninguna variante de HTA (START-B1 las exime del
    // gating), así que se inyecta la dependencia para ejercitar el render en sí.
    engine.dxDependencies.set({
      'HTA grave': { classes: ['DIGOXINA'], tooltip: 'Disponible si se marca Digoxina' },
    });
    store.meds.set([]);
    const fixture = render();
    const host: HTMLElement = fixture.nativeElement;

    const graveRow = Array.from(host.querySelectorAll('.dx-family .drug-row')).find(
      row => row.textContent?.includes('HTA grave'),
    );
    expect(graveRow).toBeTruthy();
    expect(graveRow!.classList.contains('dx-disabled')).toBe(true);
  });
});

describe('P15 paso 5 — compatibilidad con JSON antiguo (dos variantes a la vez)', () => {
  let store: CaseStoreService;
  let caseIo: CaseIoService;

  // JSON antiguo: estado clínicamente incoherente hoy posible (grave + moderada).
  const oldCaseJson = (): string =>
    JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patientCase: {
        info: null,
        diagnoses: ['hipertension_grave', 'hipertension_moderada'],
        // Medicación habilitante para que las dependencias no las filtren.
        medications: [med('Furosemida', ['DIURETICO_ASA'])],
        labs: null,
      } as PatientCase,
    });

  const makeFile = (content: string): File =>
    new File([content], 'caso.json', { type: 'application/json' });

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub() },
        { provide: ReportService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
        // CaseStoreService y CaseIoService reales (providedIn root): flujo de import end-to-end.
      ],
    });

    store = TestBed.inject(CaseStoreService);
    caseIo = TestBed.inject(CaseIoService);
  });

  it('respeta ambas variantes al cargar: no se sanea silenciosamente (D15.5)', async () => {
    await caseIo.importFile(makeFile(oldCaseJson()));

    expect(store.diagnoses()).toEqual(['hipertension_grave', 'hipertension_moderada']);
  });

  it('PDF/historial pueden listar ambas: resolveDiagnosisLabel funciona para las dos', async () => {
    await caseIo.importFile(makeFile(oldCaseJson()));

    expect(store.diagnoses().map(resolveDiagnosisLabel)).toEqual(['HTA grave', 'HTA moderada']);
  });

  it('la exclusividad solo aplica desde la siguiente interacción: seleccionar una variante colapsa a una', async () => {
    await caseIo.importFile(makeFile(oldCaseJson()));
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    fixture.detectChanges();

    // Siguiente interacción: el usuario elige una tercera variante.
    fixture.componentInstance.toggleDiagnosis('HTA no complicada');

    expect(store.diagnoses()).toEqual(['hta_no_complicada']);
  });
});

describe('DiagnosisStepComponent — badges de cabecera de criterios activados', () => {
  const render = () => {
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    fixture.detectChanges();
    return fixture;
  };

  const badgeLabel = (host: HTMLElement, selector: string): string =>
    (host.querySelector(selector)?.textContent ?? '').replace(/\d+/g, '').trim();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub() },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });
  });

  it('el badge START se rotula "START"', () => {
    const host: HTMLElement = render().nativeElement;

    expect(badgeLabel(host, '.start-badge-corner')).toBe('START');
  });

  it('el badge STOPP se rotula "STOPP"', () => {
    const host: HTMLElement = render().nativeElement;

    expect(badgeLabel(host, '.stopp-badge-corner')).toBe('STOPP');
  });
});

describe('DiagnosisStepComponent — accesibilidad de filas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub() },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });
    const store = TestBed.inject(CaseStoreService);
    store.meds.set([med('Furosemida', ['DIURETICO_ASA'])]);
    store.diagnoses.set([]);
    store.activeSystemTab.set('cardiovascular');
  });

  it('las filas de diagnóstico son alcanzables por teclado y togglean con Espacio', () => {
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const row = host.querySelector(
      '.drug-row[role="checkbox"]:not(.dx-disabled), .drug-row[role="radio"]:not(.dx-disabled)',
    ) as HTMLElement | null;
    expect(row).toBeTruthy();
    expect(row!.getAttribute('tabindex')).toBe('0');

    const before = row!.getAttribute('aria-checked');
    row!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(row!.getAttribute('aria-checked')).not.toBe(before);
  });
});

describe('DiagnosisStepComponent — copyCriteria / exportPdf errores', () => {
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let report: { exportCase: jasmine.Spy };

  beforeEach(async () => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    report = { exportCase: jasmine.createSpy('exportCase').and.rejectWith(new Error('PDF falló')) };
    await TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub() },
        { provide: CaseIoService, useValue: {} },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    })
      .overrideComponent(DiagnosisStepComponent, {
        set: {
          providers: [
            { provide: MatSnackBar, useValue: snackBar },
            { provide: ReportService, useValue: report },
          ],
        },
      })
      .compileComponents();
  });

  it('[B4] muestra snackbar si el portapapeles rechaza', async () => {
    const clipboard = { writeText: jasmine.createSpy('writeText').and.rejectWith(new Error('denied')) };
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue(clipboard as unknown as Clipboard);
    const component = TestBed.createComponent(DiagnosisStepComponent).componentInstance;
    await component.copyCriteria();
    expect(snackBar.open).toHaveBeenCalled();
    expect(component.copied()).toBe(false);
  });

  it('muestra snackbar si exportCase del PDF falla', async () => {
    const component = TestBed.createComponent(DiagnosisStepComponent).componentInstance;
    await component.onExportPdf();
    expect(report.exportCase).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalled();
  });
});

describe('DiagnosisStepComponent — panel fijo de analítica en «Otros»', () => {
  let store: CaseStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub() },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });
    store = TestBed.inject(CaseStoreService);
    store.meds.set([]);
    store.diagnoses.set([]);
  });

  const labInputs = (host: HTMLElement): HTMLInputElement[] =>
    [...host.querySelectorAll('.clinical-data-panel .clinical-field input')] as HTMLInputElement[];

  it('ofrece los campos de analítica siempre, sin depender de ninguna selección', () => {
    const component = TestBed.createComponent(DiagnosisStepComponent).componentInstance;
    expect(component.labCaptureFields().length).toBeGreaterThan(0);
    expect(component.labCaptureFields().map(f => f.key)).toContain('pas_mmhg');
    expect(component.labCaptureFields().map(f => f.key)).toContain('egfr_ml_min_173');
  });

  it('renderiza el panel en la pestaña «Otros» y no en un tab de sistema', () => {
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.setTab('cardiovascular');
    fixture.detectChanges();
    expect(labInputs(host).length).toBe(0);

    fixture.componentInstance.setTab('otros');
    fixture.detectChanges();
    expect(labInputs(host).length).toBe(fixture.componentInstance.labCaptureFields().length);
  });

  it('updateLab guarda la constante y permite limpiarla sin pisar las demás', () => {
    const component = TestBed.createComponent(DiagnosisStepComponent).componentInstance;

    component.updateLab('pas_mmhg', '150');
    component.updateLab('egfr_ml_min_173', '29');
    expect(store.labs()?.pas_mmhg).toBe(150);
    expect(store.labs()?.egfr_ml_min_173).toBe(29);

    component.updateLab('pas_mmhg', '');
    expect(store.labs()?.pas_mmhg).toBeNull();
    expect(store.labs()?.egfr_ml_min_173).toBe(29);
  });
});
