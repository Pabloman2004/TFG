import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { QuickGuideDialogComponent } from './quick-guide-dialog.component';
import { CaseStoreService } from './core/case-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [RouterModule, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
  <mat-sidenav-container class="h-screen">
    <mat-sidenav mode="side" opened class="sidepanel w-72 p-4">
      <div class="brand mb-6">
        <div class="brand-badge">
          <img src="assets/logoTFG.png" alt="Logo" width="28" height="28" />
        </div>
        <div>
          <h3 class="m-0 text-title">STOPP/START</h3>
        </div>
      </div>

      <div class="divider mb-4"></div>
    
      <nav class="steps">
        <a class="nav-item" (click)="go('paciente')" [class.active]="isActive('/paciente')">
          <span class="step-dot">1</span> Paciente
        </a>
        <a class="nav-item" (click)="go('diagnosticos')" [class.active]="isActive('/diagnosticos')">
          <span class="step-dot">2</span> Diagnósticos
        </a>
        <a class="nav-item" (click)="go('analitica')" [class.active]="isActive('/analitica')">
          <span class="step-dot">3</span> Analítica
        </a>
        <a class="nav-item" (click)="go('medicaciones')" [class.active]="isActive('/medicaciones')">
          <span class="step-dot">4</span> Medicaciones
        </a>
        <a class="nav-item" (click)="go('resultados')" [class.active]="isActive('/resultados')">
          <span class="step-dot">5</span> Resultados
        </a>
        <span class="rail"></span>
      </nav>

      <div class="divider mt-4 mb-2"></div>
      <a class="nav-item nav-historial" (click)="go('historial')" [class.active]="isActive('/historial')">
        <mat-icon class="nav-icon">history</mat-icon>
        Historial
      </a>

      <div class="flex-grow"></div>

      <div class="panel-footer">
      </div>
    </mat-sidenav>

    <mat-sidenav-content class="content-area">
      <div class="page-wrap">
        <div class="main-container">
          <div class="card">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>

      <!-- FABs apilados abajo-derecha -->
      <div class="fab-stack" aria-label="Acciones rápidas">
        <button mat-fab class="fab ghost" (click)="openQuickGuide()" aria-label="Guía rápida">
          <mat-icon>help_outline</mat-icon>
        </button>

        <button mat-fab color="warn" class="fab" (click)="resetCase()" aria-label="Reiniciar caso">
          <mat-icon>restart_alt</mat-icon>
        </button>
      </div>
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles: [`
    .h-screen{height:100vh}.w-72{width:18rem}.p-4{padding:1rem}.ml-2{margin-left:.5rem}
    .m-0{margin:0}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mt-4{margin-top:1rem}.mb-2{margin-bottom:.5rem}
    .text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}
    .muted{color:#6b7280}.w-full{width:100%}.flex-grow{flex-grow:1}
    .nav-historial{ display:flex; align-items:center; gap:.5rem; }
    .nav-icon{ font-size:1.1rem; width:1.1rem; height:1.1rem; }

    .page-wrap{ padding:1.5rem; background:#f7f7fb; }
    .main-container{ max-width:980px; margin:0 auto; }
    .card{ background:#fff; border:1px solid #e5e7eb; border-radius:1rem; padding:1.5rem; box-shadow:0 1px 2px rgba(0,0,0,.04); }

    .sidepanel{ background:linear-gradient(180deg,#f8fafc 0%,#f3f4f6 100%); border-right:1px solid #e5e7eb; display:flex; flex-direction:column; gap:.5rem; overflow:auto; }
    .brand{display:flex; align-items:center; gap:.75rem}
    .brand-badge{ width:2.25rem; height:2.25rem; border-radius:9999px; display:flex; align-items:center; justify-content:center; background:#eef2ff; color:#4338ca; font-weight:700; box-shadow:0 1px 2px rgba(0,0,0,.06); overflow:hidden; }
    .text-title{font-size:1rem; font-weight:700; color:#111827}
    .divider{height:1px; background:#e5e7eb}

    /* Asegura que los FABs no se recorten debajo del contenido */
    .content-area{ overflow: visible !important; }

    /* FABs */
    .fab-stack{
      position: fixed;
      right: 24px;
      bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2000; /* por encima de cards/sidenav */
    }
    .fab{
      box-shadow: 0 8px 20px rgba(0,0,0,.18);
    }
    .fab:focus-visible{ outline:2px solid rgba(99,102,241,.6); outline-offset:3px; }

    /* variant "ghost" para Guía rápida (tono suave) */
    .fab.ghost{
      background: #e8eefc;
      color: #1e40af;
    }
    .fab.ghost:hover{ background:#dbe7ff; }
  `]
})
export class AppComponent {
  constructor(private dialog: MatDialog, private router: Router, private store: CaseStoreService) {}

  openQuickGuide() {
    this.dialog.open(QuickGuideDialogComponent, { width: '480px', panelClass: 'rounded-xl' });
  }
  go(path: string) { this.router.navigate([`/${path}`]); }
  isActive(url: string) { return this.router.url.startsWith(url); }

  resetCase() {
    this.store.reset();
    this.router.navigate(['/paciente']);
  }
}
