import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


import { ReportService } from '../../core/report.service';
import { CaseStoreService } from '../../core/case-store.service';
import { Crit, PatientInfo, Med } from '../../core/types';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { HttpClientModule } from '@angular/common/http';



@Component({
  selector: 'app-results-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // Angular core y formularios
    NgClass, FormsModule,

    // Angular Material
    MatButtonModule, MatChipsModule, MatCardModule,
    MatExpansionModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatSnackBarModule,
    HttpClientModule
  ],
  templateUrl: './results-step.component.html',
  styleUrls: ['./results-step.component.css']
})
export class ResultsStepComponent implements OnInit {
  constructor(
    private engine: CriteriaEngineService,
    private router: Router,
    private report: ReportService,
    protected store: CaseStoreService,
    private snackBar: MatSnackBar
  ) { }

  caseSaved = signal(false);

  //  Campo del buscador
  searchTerm = '';

  //  Lista completa de sistemas (ajustada a tus resultados actuales)
  readonly systems = [
    'Indicación de la medicación',       // A
    'Sistema cardiovascular',            // B
    'Anticoagulantes/Antiagregantes',    // C
    'Sistema nervioso central',          // D
    'Sistema renal',                     // E
    'Sistema gastrointestinal',          // F
    'Sistema respiratorio',              // G
    'Sistema musculoesquelético',        // H
    'Sistema urogenital',                // I
    'Sistema endocrino',                 // J
    'Riesgo de caídas',                  // K
    'Analgésicos',                       // L
    'Carga antimuscarínica/anticolinérgica', // M
  ] as const;

  //  getter reactivo
  get activeSystem() {
    return this.store.activeSystem;
  }

  async ngOnInit() {
    const patient = this.store.patientCase;

    const criteria = await this.engine.loadCriteria();
    const applicable = this.engine.evaluate(patient, criteria);
    this.store.setResults(applicable);
  }

  //  Señal reactiva de resultados
  filtered = computed(() => {
    const sys = this.activeSystem();
    const data = this.store.results();
    return sys === 'Todos' ? data : data.filter(c => c.system === sys);
  });

  //  Filtra los resultados de un sistema + búsqueda + orden STOPP/START
  getBySystem(system: string) {
    const results = this.store.results();  // <-- NO filtered()

    return results
      .filter(r => r.system.toLowerCase() === system.toLowerCase())
      .filter(r =>
        r.summary.toLowerCase().includes(this.searchTerm.toLowerCase())
      )
      .sort((a, b) => a.type.localeCompare(b.type));
  }


  // 🔹 Devuelve solo las secciones con resultados
  getActiveSystems() {
    const results = this.store.results();
    const term = this.searchTerm.toLowerCase();

    // Si no hay texto en el buscador, muestra todos los sistemas con resultados.
    if (!term) {
      return this.systems.filter(sys =>
        results.some(r => r.system.toLowerCase() === sys.toLowerCase())
      );
    }

    // Si hay texto, solo muestra sistemas con coincidencias en el resumen
    return this.systems.filter(sys =>
      results.some(
        r =>
          r.system.toLowerCase() === sys.toLowerCase() &&
          r.summary.toLowerCase().includes(term)
      )
    );
  }


  setFilter(s: string) {
    this.store.setActiveSystem(s);
  }

  get patient(): PatientInfo | null {
    return this.store.patient();
  }
  get diagnoses(): string[] {
    return this.store.diagnoses();
  }
  get meds(): Med[] {
    return this.store.meds();
  }

  track = (_: number, item: string) => item;
  trackCard = (_: number, c: Crit) => c.id;

  navigateBack() {
    this.router.navigate(['/medicaciones']);
  }



  saveToHistory(): void {
    this.store.saveToHistory();
    this.caseSaved.set(true);
    this.snackBar.open('Caso guardado en el historial', 'Cerrar', { duration: 3000 });
  }

  onExportPdf() {
    this.report.exportCase({
      patient: this.patient,
      diagnoses: this.diagnoses,
      meds: this.meds,
      results: this.filtered(),
      fileName: 'stopp-start_informe.pdf'
    });
  }
}
