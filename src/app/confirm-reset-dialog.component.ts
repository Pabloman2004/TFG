import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-reset-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="text-lg font-semibold text-gray-800 flex items-center gap-2">
      <mat-icon color="warn">warning_amber</mat-icon>
      Limpiar todo
    </h2>
    <mat-dialog-content class="text-sm text-gray-700 leading-relaxed">
      <p>Se perderán todos los datos del caso actual (medicaciones, diagnósticos y resultados).</p>
      <p class="mt-2">¿Deseas continuar?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Limpiar todo</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmResetDialogComponent {}
