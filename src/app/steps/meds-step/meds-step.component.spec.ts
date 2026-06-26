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
});

const relevanceWith = (classesByTab: Record<string, string[]>): Relevance => ({
  classesByTab: new Map(Object.entries(classesByTab).map(([k, v]) => [k, new Set(v)])),
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
});
