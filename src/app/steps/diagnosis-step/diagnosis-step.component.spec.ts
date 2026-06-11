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
import { Med } from '../../core/types';
import { DIAGNOSIS_TABS } from '../../core/data/diagnoses-taxonomy';

const med = (id: string, drugClasses: string[]): Med => ({ id, drugClasses });

describe('DiagnosisStepComponent.toggleDiagnosis — exclusividad de variantes HTA (P15)', () => {
  let store: CaseStoreService;

  const createComponent = (): DiagnosisStepComponent => {
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    return fixture.componentInstance;
  };

  beforeEach(() => {
    const engineStub = {
      relevance: signal(null),
      evaluate: () => [],
      loadCriteria: () => Promise.resolve([]),
    };

    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub },
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

  const hipertensionGroup = () =>
    DIAGNOSIS_TABS.find(t => t.id === 'cardiovascular')!.groups.find(g => g.id === 'hipertension')!;

  const render = () => {
    const fixture = TestBed.createComponent(DiagnosisStepComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    const engineStub = {
      relevance: signal(null),
      evaluate: () => [],
      loadCriteria: () => Promise.resolve([]),
    };

    TestBed.configureTestingModule({
      imports: [DiagnosisStepComponent],
      providers: [
        provideRouter(routes),
        { provide: CriteriaEngineService, useValue: engineStub },
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

  it('una variante deshabilitada (sin medicación habilitante) se renderiza como dx-disabled', () => {
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
