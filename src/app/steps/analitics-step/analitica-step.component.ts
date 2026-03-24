import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { CaseStoreService } from '../../core/case-store.service';
import { Labs } from '../../core/types';

@Component({
  selector: 'app-analitica-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './analitica-step.component.html',
  styleUrls: ['./analitica-step.component.css']
})
export class AnaliticaStepComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(CaseStoreService);
  private router = inject(Router);

  private sub?: Subscription;

  form = this.fb.group({
    egfr_ml_min_173: [null as number | null, [Validators.min(0), Validators.max(200)]],  // Función renal
    fc_lpm: [null as number | null, [Validators.min(20), Validators.max(250)]],           // Frecuencia cardíaca
    qtc_ms: [null as number | null, [Validators.min(200), Validators.max(700)]],          // Intervalo QTc

    // Electrolitos
    potasio_mmol_l: [null as number | null, [Validators.min(1.0), Validators.max(10.0)]],           // Potasio (normal: 3.5-5.0)
    sodio_mmol_l: [null as number | null, [Validators.min(100), Validators.max(180)]],              // Sodio (normal: 135-145)
    calcio_corregido_mmol_l: [null as number | null, [Validators.min(1.0), Validators.max(4.0)]],   // Calcio (normal: 2.2-2.6)

    // Presión arterial
    pas_mmhg: [null as number | null, [Validators.min(50), Validators.max(250)]],  // PAS (normal: 90-140)

    // Campos no usados (mantenemos en el tipo pero null para no romper Labs)
    glucosa_mg_dl: [null as number | null],
    colesterol_total_mg_dl: [null as number | null],
    trigliceridos_mg_dl: [null as number | null],
    hdl_mg_dl: [null as number | null],
    ldl_mg_dl: [null as number | null],
    creatinina_mg_dl: [null as number | null],
    inr: [null as number | null],
    tsh_uUl: [null as number | null],
  });

  constructor() {
    // Rehidrata si el store cambia desde fuera (reset, cargar caso)
    effect(() => {
      const labs = this.store.labs();
      if (labs) this.form.patchValue(labs, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    const prev = this.store.labs();
    if (prev) this.form.patchValue(prev, { emitEvent: false });

    // Persistencia reactiva
    this.sub = this.form.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged())
      .subscribe(values => this.store.setLabs(values as Labs));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goPrev(): void { this.router.navigate(['/diagnosticos']); }
  goNext(): void { this.router.navigate(['/medicaciones']); }
}
