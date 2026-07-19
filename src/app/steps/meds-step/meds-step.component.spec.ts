import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { MedsStepComponent } from './meds-step.component';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { ReportService } from '../../core/report.service';
import { CaseIoService } from '../../core/case-io.service';
import { routes } from '../../app.routes';
import { Relevance, buildRelevance } from '../../core/data/system-relevance';
import { Crit } from '../../core/types';
import { ALL_CRITERIA } from '../../core/services/criteria-test-helpers';

const engineStub = () => ({
  relevance: signal(null),
  dxDependencies: signal({}),
  evaluate: () => [],
  loadCriteria: () => Promise.resolve([]),
  getExcludedMedications: () => new Map<string, Crit>(),
});

const relevanceWith = (
  classesByTab: Record<string, string[]>,
  specificClassesByTab: Record<string, string[]> = classesByTab,
): Relevance => ({
  classesByTab: new Map(Object.entries(classesByTab).map(([k, v]) => [k, new Set(v)])),
  specificClassesByTab: new Map(Object.entries(specificClassesByTab).map(([k, v]) => [k, new Set(v)])),
  dxsByTab: new Map(),
  specificDxsByTab: new Map(),
});

const engineStubWithRelevance = (relevance: Relevance) => ({
  relevance: signal<Relevance | null>(relevance),
  dxDependencies: signal({}),
  evaluate: (): Crit[] => [],
  loadCriteria: () => Promise.resolve([]),
  getExcludedMedications: () => new Map<string, Crit>(),
});

describe('MedsStepComponent — badges de cabecera de criterios activados', () => {
  const render = () => {
    const fixture = TestBed.createComponent(MedsStepComponent);
    fixture.detectChanges();
    return fixture;
  };

  const badgeLabel = (host: HTMLElement, selector: string): string =>
    (host.querySelector(selector)?.textContent ?? '').replace(/\d+/g, '').trim();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MedsStepComponent],
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
    const fixture = render();
    const host: HTMLElement = fixture.nativeElement;

    expect(badgeLabel(host, '.start-badge-corner')).toBe('START');
  });

  it('el badge STOPP se rotula "STOPP"', () => {
    const fixture = render();
    const host: HTMLElement = fixture.nativeElement;

    expect(badgeLabel(host, '.stopp-badge-corner')).toBe('STOPP');
  });
});

describe('MedsStepComponent — conteo de "Otros" con unitarios que afloran por relevancia', () => {
  const setup = (relevance: Relevance) => {
    TestBed.configureTestingModule({
      imports: [MedsStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStubWithRelevance(relevance) },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });
    const fixture = TestBed.createComponent(MedsStepComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  };

  it('no cuenta Digoxina en "Otros" cuando aflora en cardiovascular por relevancia', () => {
    const component = setup(relevanceWith({ cardiovascular: ['DIGOXINA'] }));
    component.store.meds.set([{ id: 'Digoxina', drugClasses: ['DIGOXINA'] }]);

    expect(component.tabSelectionCount('otros')).toBe(0);
    expect(component.tabSelectionCount('cardiovascular')).toBe(1);
  });

  it('comparte una selección multiclase entre su tab principal y otro relevante', () => {
    const component = setup(relevanceWith({
      anticoagulantes: ['ANTICOAGULANTE_DIRECTO'],
      renal: ['INHIBIDOR_FACTOR_XA'],
    }));
    component.store.meds.set([{
      id: 'Apixaban',
      drugClasses: ['ANTICOAGULANTE', 'ANTICOAGULANTE_DIRECTO', 'INHIBIDOR_FACTOR_XA'],
    }]);

    expect(component.tabSelectionCount('anticoagulantes')).toBe(1);
    expect(component.tabSelectionCount('renal')).toBe(1);
    expect(component.store.meds().length).toBe(1);
  });
});

describe('MedsStepComponent — datos necesarios para criterios renales', () => {
  const setup = (): MedsStepComponent => {
    TestBed.configureTestingModule({
      imports: [MedsStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub() },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });
    return TestBed.createComponent(MedsStepComponent).componentInstance;
  };

  beforeEach(() => localStorage.clear());

  it('guarda dosis y duración de Digoxina sin mutar el medicamento previo', () => {
    const component = setup();
    component.toggleDrug('Digoxina');
    const original = component.store.meds()[0];

    component.updateMedicationNumber('Digoxina', 'doseMcgDay', '125');
    component.updateMedicationNumber('Digoxina', 'durationDays', '91');

    expect(component.store.meds()[0]).not.toBe(original);
    expect(component.store.meds()[0]).toEqual({
      id: 'Digoxina',
      drugClasses: ['DIGOXINA'],
      doseMcgDay: 125,
      durationDays: 91,
    });
  });

  it('guarda TFGe numérica y permite limpiarla', () => {
    const component = setup();

    component.updateEgfr('29');
    expect(component.store.labs()?.egfr_ml_min_173).toBe(29);

    component.updateEgfr('');
    expect(component.store.labs()?.egfr_ml_min_173).toBeNull();
  });

  it('guarda dosis de hierro en mg y duración de IBP', () => {
    const component = setup();
    component.toggleDrug('Sulfato ferroso');
    component.toggleDrug('Omeprazol');

    component.updateMedicationNumber('Sulfato ferroso', 'doseMgDay', '201');
    component.updateMedicationNumber('Omeprazol', 'durationDays', '57');

    expect(component.store.meds().find(m => m.id === 'Sulfato ferroso')?.doseMgDay).toBe(201);
    expect(component.store.meds().find(m => m.id === 'Omeprazol')?.durationDays).toBe(57);
  });

  it('guarda dosis de AAS, duración de SNC y dosis de paracetamol', () => {
    const component = setup();
    component.toggleDrug('Ácido acetilsalicílico');
    component.toggleDrug('Lorazepam');
    component.toggleDrug('Paracetamol');

    component.updateMedicationNumber('Ácido acetilsalicílico', 'doseMgDay', '150');
    component.updateMedicationNumber('Lorazepam', 'durationDays', '28');
    component.updateMedicationNumber('Paracetamol', 'doseMgDay', '3000');

    expect(component.store.meds().find(m => m.id === 'Ácido acetilsalicílico')?.doseMgDay).toBe(150);
    expect(component.store.meds().find(m => m.id === 'Lorazepam')?.durationDays).toBe(28);
    expect(component.store.meds().find(m => m.id === 'Paracetamol')?.doseMgDay).toBe(3000);
  });
});

describe('MedsStepComponent — campos numéricos en el tab donde está el medicamento', () => {
  const realRelevance = buildRelevance(ALL_CRITERIA);

  const renderOnTab = (tabId: string) => {
    TestBed.configureTestingModule({
      imports: [MedsStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStubWithRelevance(realRelevance) },
        { provide: ReportService, useValue: {} },
        { provide: CaseIoService, useValue: {} },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    });
    const fixture = TestBed.createComponent(MedsStepComponent);
    const component = fixture.componentInstance;
    component.setCategory(tabId);
    fixture.detectChanges();
    return { fixture, component, host: fixture.nativeElement as HTMLElement };
  };

  const clinicalLabels = (host: HTMLElement): string[] =>
    [...host.querySelectorAll('.clinical-data-panel .clinical-field span')]
      .map(el => el.textContent?.trim() ?? '');

  beforeEach(() => localStorage.clear());

  it('muestra dosis de Digoxina en Cardiovascular, no solo en Renal', () => {
    const { fixture, component, host } = renderOnTab('cardiovascular');
    component.toggleDrug('Digoxina');
    fixture.detectChanges();

    expect(clinicalLabels(host)).toContain('Digoxina (µg/día)');
    expect(clinicalLabels(host)).toContain('Duración (días)');
  });

  it('muestra duración de corticoide en Respiratorio cuando se marca ahí (C2)', () => {
    const { fixture, component, host } = renderOnTab('respiratorio');
    component.toggleDrug('Prednisona');
    fixture.detectChanges();

    expect(clinicalLabels(host)).toContain('Prednisona (días)');
  });

  it('muestra duración de corticoide en Endocrino cuando se marca ahí', () => {
    const { fixture, component, host } = renderOnTab('endocrino');
    component.toggleDrug('Prednisona');
    fixture.detectChanges();

    expect(clinicalLabels(host)).toContain('Prednisona (días)');
  });

  it('muestra paracetamol mg/día en Osteo', () => {
    const { fixture, component, host } = renderOnTab('osteo');
    component.toggleDrug('Paracetamol');
    fixture.detectChanges();

    expect(clinicalLabels(host)).toContain('Paracetamol (mg/día)');
  });

  it('muestra duración de benzo en SNC', () => {
    const { fixture, component, host } = renderOnTab('snc');
    component.toggleDrug('Lorazepam');
    fixture.detectChanges();

    expect(clinicalLabels(host)).toContain('Lorazepam (días)');
  });
});

describe('MedsStepComponent — accesibilidad de filas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MedsStepComponent],
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

  it('las filas de fármaco son alcanzables por teclado y togglean con Enter', () => {
    const fixture = TestBed.createComponent(MedsStepComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const row = host.querySelector('.drug-row[role="checkbox"]') as HTMLElement | null;
    expect(row).toBeTruthy();
    expect(row!.getAttribute('tabindex')).toBe('0');

    const name = row!.querySelector('.drug-name')?.textContent?.trim() ?? '';
    expect(name.length).toBeGreaterThan(0);
    expect(fixture.componentInstance.isSelected(name)).toBe(false);

    row!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.isSelected(name)).toBe(true);

    row!.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.isSelected(name)).toBe(false);
  });
});

describe('MedsStepComponent — copyCriteria / exportPdf errores', () => {
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let report: { exportCase: jasmine.Spy };

  beforeEach(async () => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    report = { exportCase: jasmine.createSpy('exportCase').and.rejectWith(new Error('PDF falló')) };
    await TestBed.configureTestingModule({
      imports: [MedsStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub() },
        { provide: CaseIoService, useValue: {} },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    })
      .overrideComponent(MedsStepComponent, {
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
    const component = TestBed.createComponent(MedsStepComponent).componentInstance;
    await component.copyCriteria();
    expect(snackBar.open).toHaveBeenCalled();
    expect(component.copied()).toBe(false);
  });

  it('muestra snackbar si exportCase del PDF falla', async () => {
    const component = TestBed.createComponent(MedsStepComponent).componentInstance;
    await component.onExportPdf();
    expect(report.exportCase).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalled();
  });
});
