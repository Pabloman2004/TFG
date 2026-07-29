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
import { DRUG_CATEGORIES } from '../../core/data/medications-taxonomy';

const ALL_MED_TAB_IDS = DRUG_CATEGORIES.map(c => c.id);

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
  specificClassCriteriaByTab: new Map(),
  classesByCriterion: new Map(),
  requiredClassesByCriterion: new Map(),
  classAlternativesByCriterion: new Map(),
  dxsByTab: new Map(),
  specificDxsByTab: new Map(),
  specificDxCriteriaByTab: new Map(),
  dxsByCriterion: new Map(),
  dxAlternativesByCriterion: new Map(),
  criteriaByRequiredClass: new Map(),
  criteriaByDx: new Map(),
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

describe('MedsStepComponent — sin captura de dosis/duración', () => {
  const realRelevance = buildRelevance(ALL_CRITERIA);

  beforeEach(() => {
    localStorage.clear();
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
  });

  it('no muestra panel de dosis/duración al seleccionar Digoxina, IBP o corticoide', () => {
    const fixture = TestBed.createComponent(MedsStepComponent);
    const component = fixture.componentInstance;
    component.setCategory('cardiovascular');
    fixture.detectChanges();

    component.toggleDrug('Digoxina');
    component.toggleDrug('Omeprazol');
    component.toggleDrug('Prednisona');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.clinical-data-panel')).toBeNull();
    expect(component.store.meds().some(m => m.id === 'Digoxina')).toBeTrue();
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

describe('MedsStepComponent — chip de enlace hacia grupos foráneos', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [MedsStepComponent],
      providers: [
        provideRouter(routes),
        {
          provide: CriteriaEngineService,
          useValue: engineStubWithRelevance(buildRelevance(ALL_CRITERIA, ALL_MED_TAB_IDS)),
        },
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

  it('marcar un diurético de asa enlaza con el grupo foráneo de AINE (B19)', () => {
    const component = setup();
    component.store.activeSystemTab.set('cardiovascular');
    component.store.meds.set([{ id: 'Furosemida', drugClasses: ['DIURETICO_ASA'] }]);

    expect(component.foreignLinks().get('aine')).toContain('Furosemida');
  });

  it('el enlace inverso sigue funcionando hacia grupos propios', () => {
    const component = setup();
    component.store.activeSystemTab.set('cardiovascular');
    component.store.meds.set([{ id: 'Prednisona', drugClasses: ['CORTICOIDE_SISTEMICO'] }]);

    expect(component.foreignLinks().get('diur_asa')).toContain('Prednisona');
  });
});

describe('MedsStepComponent — el resaltado no sobrevive al cambio de pestaña', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      imports: [MedsStepComponent],
      providers: [
        provideRouter(routes),
        {
          provide: CriteriaEngineService,
          useValue: engineStubWithRelevance(buildRelevance(ALL_CRITERIA, ALL_MED_TAB_IDS)),
        },
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

  it('cambiar de pestaña limpia el resaltado', () => {
    const component = setup();
    component.store.activeSystemTab.set('cardiovascular');
    component.toggleDrug('Prednisona');
    expect(component.highlightedGroupIds().size).toBeGreaterThan(0);

    // «Diurét. de asa» también existe en Renal: sin limpiar, se vería iluminado allí.
    component.setCategory('renal');

    expect(component.highlightedGroupIds().size).toBe(0);
  });
});
