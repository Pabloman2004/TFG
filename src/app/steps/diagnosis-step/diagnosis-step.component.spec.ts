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
