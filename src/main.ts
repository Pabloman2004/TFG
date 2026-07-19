// @linked docs/navegacion-y-shell.md
// Si cambias el bootstrap o los providers globales, actualiza el doc enlazado.
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
