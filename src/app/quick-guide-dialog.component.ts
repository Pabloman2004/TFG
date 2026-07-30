// @linked docs/navegacion-y-shell.md
// Si cambias el contenido o el flujo de la guía rápida, actualiza el doc enlazado.
import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** PDF oficial de criterios STOPP/START v3 (Sacyl). */
export const STOPP_START_CRITERIA_PDF_URL =
  'https://www.saludcastillayleon.es/profesionales/es/calidad-seguridad-paciente/seguridad-paciente/medicacion-dano/adherencia-tratamiento-revision-plan-terapeutico/criterios-stopp-start.ficheros/3057685-criterios-stopp-start_v3_espa%C3%B1ol.pdf';

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
      <h3 class="font-medium text-indigo-600 mb-1">Qué es STOPP/START</h3>
      <p><b>STOPP</b>: detecta prescripciones potencialmente inapropiadas.</p>
      <p><b>START</b>: detecta tratamientos indicados omitidos.</p>
      <p class="mt-1">
        Los criterios se evalúan en tiempo real al marcar medicamentos y diagnósticos.
        La columna derecha muestra las alertas STOPP y las sugerencias START agrupadas
        por sistema orgánico.
      </p>
    </section>

    <section>
      <h3 class="font-medium text-indigo-600 mb-1">Flujo del asistente</h3>
      <ol class="list-decimal list-inside space-y-2">
        <li>
          <b>Medicamentos:</b> selecciona los fármacos activos por categoría terapéutica.
          En cada pestaña pueden aparecer también fármacos relevantes de otros sistemas.
        </li>
        <li>
          <b>Diagnósticos:</b> marca los diagnósticos activos. En la pestaña «Otros»
          puedes anotar analítica y constantes (TFGe, PAS/PAD, iones, QTc, etc.)
          que usan algunos criterios.
        </li>
      </ol>
      <p class="mt-2">
        En ambos pasos puedes marcar una pestaña como revisada si no aplica nada,
        exportar el informe en PDF, copiar los criterios o guardar/cargar el caso en JSON.
      </p>
    </section>

    <section>
      <h3 class="font-medium text-indigo-600 mb-1">Documento de criterios</h3>
      <p class="mb-2">
        Consulta el listado oficial STOPP/START v3 en español (Sacyl):
      </p>
      <a
        mat-stroked-button
        color="primary"
        [href]="criteriaPdfUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <mat-icon>picture_as_pdf</mat-icon>
        Abrir criterios STOPP/START (PDF)
      </a>
    </section>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-flat-button color="primary" mat-dialog-close>Cerrar</button>
  </mat-dialog-actions>
  `
})
export class QuickGuideDialogComponent {
  readonly criteriaPdfUrl = STOPP_START_CRITERIA_PDF_URL;
}
