import { Routes } from '@angular/router';

import { PatientStepComponent } from './steps/patient-step/patient-step.component';
import { DiagnosisStepComponent } from './steps/diagnosis-step/diagnosis-step.component';
import { MedsStepComponent } from './steps/meds-step/meds-step.component';
import { ResultsStepComponent } from './steps/result-step/results-step.component';
import { AnaliticaStepComponent } from './steps/analitics-step/analitica-step.component';
import { HistorialComponent } from './historial/historial.component';


export const routes: Routes = [
  { path: '', redirectTo: 'paciente', pathMatch: 'full' },
  { path: 'paciente', component: PatientStepComponent },
  { path: 'diagnosticos', component: DiagnosisStepComponent },
  { path: 'analitica', component: AnaliticaStepComponent },
  { path: 'medicaciones', component: MedsStepComponent },
  { path: 'resultados', component: ResultsStepComponent },
  { path: 'historial', component: HistorialComponent },
  { path: '**', redirectTo: 'paciente' },
];
