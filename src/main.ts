import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Importa el store
import { CaseStoreService } from './app/core/case-store.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient()
  ],
})
  .then(appRef => {
    // Exponer CaseStoreService al objeto global window
    (window as any).store = appRef.injector.get(CaseStoreService);

    console.log(
      "%c✔ CaseStoreService disponible en la consola como 'store'",
      "color: green; font-weight: bold;"
    );
  })
  .catch(err => console.error(err));
