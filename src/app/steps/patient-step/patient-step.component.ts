import {
  Component, ChangeDetectionStrategy, OnInit, effect
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CaseStoreService } from '../../core/case-store.service';
import { PatientInfo, Sex } from '../../core/types';



@Component({
  selector: 'app-patient-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule
  ],
  templateUrl: "./patient-step.component.html",
  styleUrl: "./patient-step.component.css"
})

export class PatientStepComponent implements OnInit {

  // aqui recojo los valores que rellena el usuario en el formulario 
  form = new FormGroup({
    name: new FormControl<string | null>(null, { validators: [Validators.required, Validators.minLength(2)] }),
    age: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0), Validators.max(120)] }),
    sex: new FormControl<Sex | null>(null, { validators: [Validators.required] }),
    mrn: new FormControl<string | null>(null),
    weightKg: new FormControl<number | null>(null, { validators: [Validators.min(0), Validators.max(400)] }),
    heightCm: new FormControl<number | null>(null, { validators: [Validators.min(0), Validators.max(300)] }),
    notes: new FormControl<string | null>(null)
  });


  constructor(private router: Router, private store: CaseStoreService) {
    const formValues = toSignal(this.form.valueChanges);
    // v es el valor que this.form.valueChanges emite cada vez que su valor cambia
    effect(() => {
      const v = formValues();
      if (v) {
        const p: PatientInfo = {
          name: v.name ?? null,
          age: v.age ?? null,
          sex: v.sex ?? null,
          mrn: v.mrn ?? null,
          weightKg: v.weightKg ?? null,
          heightCm: v.heightCm ?? null,
          notes: v.notes ?? null
        };
        this.store.patient.set(p);
      }
    });

    //sirve para borrar los valores de los campos cuando es da a reiniciar caso
    effect(() => {
      const p = this.store.patient();
      if (p === null) {
        this.form.reset();
      }
    });
  }

  ngOnInit() {
    // Precarga si ya había datos (volver atrás)
    const saved = this.store.patient();
    //pathValue carga valores en el formulario
    if (saved) this.form.patchValue(saved, { emitEvent: false });
  }

  submit() {

    if (this.form.valid) {
      const p = this.form.value as PatientInfo;
      this.store.patient.set(p);
      this.router.navigate(['/diagnosticos']);
    } else {
      this.form.markAllAsTouched();
    }
  }

  // no hay un meotdo naviagteNext() porque el boton siguiente es de type submit entonces llama a submit() cuando se clicka 
}
