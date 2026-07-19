// @linked docs/navegacion-y-shell.md
// Si añades, eliminas o renombras rutas, actualiza el doc enlazado.
import { Routes } from '@angular/router';

import { DiagnosisStepComponent } from './steps/diagnosis-step/diagnosis-step.component';
import { MedsStepComponent } from './steps/meds-step/meds-step.component';
import { ROUTES } from './app.routes.constants';

export const routes: Routes = [
  { path: '',                   redirectTo: ROUTES.MEDICACIONES, pathMatch: 'full' },
  { path: ROUTES.DIAGNOSTICOS,  component: DiagnosisStepComponent },
  { path: ROUTES.MEDICACIONES,  component: MedsStepComponent },
  { path: '**',                 redirectTo: ROUTES.MEDICACIONES },
];
