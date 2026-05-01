import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { QuickGuideDialogComponent } from './quick-guide-dialog.component';
import { CaseStoreService } from './core/case-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <router-outlet></router-outlet>

    <div class="fab-stack" aria-label="Acciones rápidas">
      <button mat-fab class="fab ghost" (click)="openQuickGuide()" aria-label="Guía rápida">
        <mat-icon>help_outline</mat-icon>
      </button>
      <button mat-fab color="warn" class="fab" (click)="resetCase()" aria-label="Reiniciar caso">
        <mat-icon>restart_alt</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .fab-stack {
      position: fixed;
      right: 24px;
      bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2000;
    }
    .fab { box-shadow: 0 8px 20px rgba(0,0,0,.18); }
    .fab.ghost { background: #e8eefc; color: #1e40af; }
    .fab.ghost:hover { background: #dbe7ff; }
    .fab:focus-visible { outline: 2px solid rgba(99,102,241,.6); outline-offset: 3px; }
  `]
})
export class AppComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private store: CaseStoreService,
  ) {}

  openQuickGuide(): void {
    this.dialog.open(QuickGuideDialogComponent, { width: '480px', panelClass: 'rounded-xl' });
  }

  resetCase(): void {
    this.store.reset();
    this.router.navigate(['/medicaciones']);
  }
}
