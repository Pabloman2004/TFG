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
import { Relevance } from '../../core/data/system-relevance';
import { Crit } from '../../core/types';

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

    expect(component.medicationById('Sulfato ferroso')?.doseMgDay).toBe(201);
    expect(component.medicationById('Omeprazol')?.durationDays).toBe(57);
  });
});
