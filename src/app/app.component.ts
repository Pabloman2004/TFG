// @linked docs/navegacion-y-shell.md
// Si cambias las acciones globales (guardar/cargar/reset/guía) o la navegación, actualiza el doc enlazado.
import { Component, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { QuickGuideDialogComponent } from './quick-guide-dialog.component';
import { ConfirmResetDialogComponent } from './confirm-reset-dialog.component';
import { CaseStoreService } from './core/case-store.service';
import { CaseIoService } from './core/case-io.service';
import { DisplaySettingsService } from './core/display-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  template: `
    <router-outlet></router-outlet>

    <input #fileInput type="file" accept=".json" (change)="onLoad($event)"
           style="display:none" aria-hidden="true">
  `,
  styles: [`
    .fab-stack {
      position: fixed;
      left: 24px;
      bottom: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      z-index: 2000;
    }
    .fab { box-shadow: 0 8px 20px rgba(0,0,0,.18); }
    .fab.ghost { background: #e8eefc; color: #1e40af; }
    .fab.ghost:hover { background: #dbe7ff; }
    .fab:focus-visible { outline: 2px solid rgba(99,102,241,.6); outline-offset: 3px; }

    .io-ctrl {
      display: flex;
      gap: 4px;
      background: #fff;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,.12);
    }
    .io-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      background: #f9fafb;
      color: #374151;
      cursor: pointer;
      transition: background .12s, color .12s;
      line-height: 1.4;
    }
    .io-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .io-btn:hover { background: #e8eefc; color: #1e40af; }
    .io-btn:focus-visible { outline: 2px solid rgba(99,102,241,.6); outline-offset: 2px; }

  `]
})
export class AppComponent {
  @ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: CaseStoreService,
    private caseIo: CaseIoService,
    private displaySettings: DisplaySettingsService,
  ) {}

  onSave(): void {
    this.caseIo.exportCase();
  }

  async onLoad(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await this.caseIo.importFile(file);
      this.snackBar.open('Caso cargado correctamente.', 'OK', { duration: 3000 });
      this.router.navigate(['/medicaciones']);
    } catch (err) {
      this.snackBar.open(
        err instanceof Error ? err.message : 'Error al cargar el archivo.',
        'Cerrar',
        { duration: 6000 },
      );
    } finally {
      (event.target as HTMLInputElement).value = '';
    }
  }

  openQuickGuide(): void {
    this.dialog.open(QuickGuideDialogComponent, { width: '480px', panelClass: 'rounded-xl' });
  }

  resetCase(): void {
    this.dialog.open(ConfirmResetDialogComponent, { width: '360px', panelClass: 'rounded-xl' })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) {
          this.store.reset();
          this.router.navigate(['/medicaciones']);
        }
      });
  }
}
