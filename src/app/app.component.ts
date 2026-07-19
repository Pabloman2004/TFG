// @linked docs/navegacion-y-shell.md
// Si cambias el shell o la inyección de DisplaySettingsService, actualiza el doc enlazado.
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

import { DisplaySettingsService } from './core/display-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  // Inyectar DisplaySettingsService aplica --font-scale al arrancar; no eliminar.
  constructor(private readonly displaySettings: DisplaySettingsService) {}
}
