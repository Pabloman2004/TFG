import { Routes } from '@angular/router';

import { DiagnosisStepComponent } from './steps/diagnosis-step/diagnosis-step.component';
import { MedsStepComponent } from './steps/meds-step/meds-step.component';
import { HistorialComponent } from './historial/historial.component';
import { ROUTES } from './app.routes.constants';

export const routes: Routes = [
  { path: '',                          redirectTo: ROUTES.MEDICACIONES, pathMatch: 'full' },
  { path: ROUTES.DIAGNOSTICOS,        component: DiagnosisStepComponent },
  { path: ROUTES.MEDICACIONES,        component: MedsStepComponent },
  { path: ROUTES.HISTORIAL,           component: HistorialComponent },
  { path: '**',                        redirectTo: ROUTES.MEDICACIONES },
];
