// @linked docs/historial.md
// Si cambias la lógica de carga, eliminación, navegación post-carga o el formateo de fechas, actualiza el doc enlazado.
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { CaseStoreService } from '../core/case-store.service';
import { SavedCase } from '../core/types';
import { ROUTES } from '../app.routes.constants';

@Component({
  selector: 'app-historial',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent {
  constructor(private store: CaseStoreService, private router: Router) {}

  get history() { return this.store.history; }

  load(entry: SavedCase): void {
    this.store.loadFromHistory(entry);
    this.router.navigate([ROUTES.MEDICACIONES]);
  }

  delete(id: string): void {
    this.store.deleteFromHistory(id);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
