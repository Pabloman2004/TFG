import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quick-guide-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
  <h2 mat-dialog-title class="text-lg font-semibold text-gray-800 flex items-center gap-2">
    <mat-icon color="primary">help_outline</mat-icon>
    Guía rápida STOPP/START
  </h2>

  <mat-dialog-content class="text-sm text-gray-700 space-y-4 leading-relaxed">
    <section>
      <h3 class="font-medium text-indigo-600 mb-1">Flujo del asistente</h3>
      <ol class="list-decimal list-inside space-y-1">
        <li><b>Paciente:</b> datos básicos (edad, sexo, patologías).</li>
        <li><b>Diagnósticos:</b> selecciona diagnósticos/factores.</li>
        <li><b>Medicaciones:</b> tratamientos activos.</li>
        <li><b>Resultados:</b> criterios STOPP/START aplicables y exportación a PDF.</li>
      </ol>
    </section>
    <section>
      <h3 class="font-medium text-indigo-600 mb-1">Resumen teórico</h3>
      <p><b>STOPP</b>: detecta prescripciones potencialmente inapropiadas.</p>
      <p><b>START</b>: detecta tratamientos indicados omitidos.</p>
    </section>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-flat-button color="primary" mat-dialog-close>Cerrar</button>
  </mat-dialog-actions>
  `
})
export class QuickGuideDialogComponent {}
