import { Component, ViewEncapsulation, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule, MatButtonToggleChange } from '@angular/material/button-toggle';

import { DisplaySettingsService, FontScale } from './core/display-settings.service';

@Component({
  selector: 'app-display-options-dialog',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatButtonToggleModule],
  template: `
    <h2 mat-dialog-title class="dlg-title">
      <span class="dlg-title-text">
        <mat-icon color="primary">tune</mat-icon>
        Opciones de visualización
      </span>
      <button mat-icon-button mat-dialog-close aria-label="Cerrar" class="dlg-close">
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <mat-dialog-content>
      <section class="opt-section">
        <h3 class="opt-section-title">Tamaño del texto</h3>
        <mat-button-toggle-group
          class="font-toggle"
          [value]="fontScale()"
          (change)="onScaleChange($event)"
          aria-label="Tamaño del texto"
        >
          <mat-button-toggle [value]="scales[0]">
            <span class="prev prev-sm">A</span>
            <span class="prev-lbl">Pequeño</span>
          </mat-button-toggle>
          <mat-button-toggle [value]="scales[1]">
            <span class="prev prev-md">A</span>
            <span class="prev-lbl">Mediano</span>
          </mat-button-toggle>
          <mat-button-toggle [value]="scales[2]">
            <span class="prev prev-lg">A</span>
            <span class="prev-lbl">Grande</span>
          </mat-button-toggle>
        </mat-button-toggle-group>
      </section>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dlg-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
      }
      .dlg-title-text {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .dlg-close {
        color: #6b7280;
      }

      .opt-section {
        padding: 4px 0 8px;
      }
      .opt-section-title {
        font-size: 13px;
        font-weight: 600;
        color: #374151;
        margin: 0 0 12px;
      }

      .font-toggle {
        display: flex;
        width: 100%;
      }
      .font-toggle .mat-button-toggle {
        flex: 1;
      }
      .font-toggle .mat-button-toggle-label-content {
        display: flex !important;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 12px 8px !important;
        line-height: 1.1 !important;
      }
      .font-toggle .prev {
        font-weight: 700;
        color: #1f2937;
        line-height: 1;
      }
      .font-toggle .prev-sm {
        font-size: 15px;
      }
      .font-toggle .prev-md {
        font-size: 19px;
      }
      .font-toggle .prev-lg {
        font-size: 24px;
      }
      .font-toggle .prev-lbl {
        font-size: 12px;
        font-weight: 500;
        color: #6b7280;
      }
    `,
  ],
})
export class DisplayOptionsDialogComponent {
  private readonly settings = inject(DisplaySettingsService);
  readonly scales = this.settings.scales;
  readonly fontScale = this.settings.fontScale;

  onScaleChange(change: MatButtonToggleChange): void {
    this.settings.setFontScale(change.value as FontScale);
  }
}
