// @linked docs/navegacion-y-shell.md
// Si cambias el bootstrap o los providers globales, actualiza el doc enlazado.
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient()
  ],
}).catch(err => console.error(err));
//commit