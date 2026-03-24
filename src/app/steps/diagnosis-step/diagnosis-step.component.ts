// src/app/steps/diagnosis-step/diagnosis-step.component.ts
import {
  Component, ChangeDetectionStrategy, effect
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, map, startWith } from 'rxjs';
import { Router } from '@angular/router';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { CaseStoreService } from '../../core/case-store.service';
import {
  DIAGNOSIS_GROUPS,
  normalizeDiagnosis,
  DIAGNOSIS_REVERSE_MAP
} from '../../core/data/diagnoses';

@Component({
  selector: 'app-diagnosis-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatChipsModule, MatIconModule, MatAutocompleteModule,
    MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  templateUrl: "./diagnosis-step.component.html",
  styleUrls: ["./diagnosis-step.component.css"]
})
export class DiagnosisStepComponent {

  constructor(private router: Router, private store: CaseStoreService) {
    //  Sincroniza siempre selected (etiquetas bonitas) con el store (claves internas)
    effect(() => {
      const codes = this.store.diagnoses();
      this.selected = codes.map(c => DIAGNOSIS_REVERSE_MAP[c] ?? c);
    });
  }

  // En el componente SIEMPRE trabajamos con etiquetas bonitas (HTA, CKD, ...)
  selected: string[] = [];

  // ======================================================
  //  Construcción dinámica de grupos a partir de DIAGNOSIS_GROUPS
  // ======================================================
  readonly allGroups: { group: string; items: string[] }[] = (() => {
    const groups: Record<string, string[]> = {};//es un map de java

    for (const [label, group] of Object.entries(DIAGNOSIS_GROUPS)) {
      if (!groups[group]) groups[group] = []; // crea el array antes de añadir cosas

      groups[group].push(label);
    }

    return Object.entries(groups).map(([group, items]) => ({
      group,
      items
    }));
  })();

  //  Opciones planas para autocomplete
  private allOptions = this.allGroups.flatMap(g =>
    g.items.map(i => ({ group: g.group, name: i }))
  );

  queryCtrl = new FormControl<string>('', { nonNullable: true });

  filtered$: Observable<{ group: string, name: string }[]> =
    this.queryCtrl.valueChanges.pipe(
      startWith(this.queryCtrl.value),
      map(q => this.filterOptions(q))
    );

  // ======================================================
  // 🔹 Normalizador secundario (solo para comparar etiquetas)
  // ======================================================
  private normalize = (s: string) => s.trim().toLowerCase();

  // ======================================================
  // 🔹 Filtrado del buscador
  // ======================================================
  private filterOptions(q: string | null) {
    const n = this.normalize(q ?? '');

    if (!n) {
      // Cuando no hay texto, mostrar solo las opciones que NO estén ya seleccionadas
      return this.allOptions.filter(o => !this.contains(o.name));
    }

    return this.allOptions
      .filter(o => o.name.toLowerCase().includes(n))
      .filter(o => !this.contains(o.name));
  }

  // ======================================================
  // 🔹 Añadir desde autocomplete
  // ======================================================
  addFromAutocomplete(ev: MatAutocompleteSelectedEvent) {
    this.add(ev.option.value as string);
    this.queryCtrl.setValue('');
  }

  // ======================================================
  // 🔹 Añadir escribiendo
  // ======================================================
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.tryAddFromText();
      event.preventDefault();
    }
  }

  tryAddFromText() {
    const v = this.queryCtrl.value?.trim();
    if (v) {
      this.add(v);
      this.queryCtrl.setValue('');
    }
  }

  // ======================================================
  // 🔹 Añadir diagnóstico
  //    UI → etiqueta bonita
  //    Store → clave interna normalizada
  // ======================================================
  add(v: string) {
    const code = normalizeDiagnosis(v);              // p.ej. "hta"
    const currentCodes = this.store.diagnoses();

    // Si ya está en el store, no hacemos nada
    if (currentCodes.includes(code)) return;

    const label = DIAGNOSIS_REVERSE_MAP[code] ?? v.trim();

    // Actualizamos SOLO el store con claves internas
    this.store.diagnoses.set([...currentCodes, code]);

  }

  // ======================================================
  // 🔹 Eliminar diagnóstico
  // ======================================================
  remove(v: string) {
    const code = normalizeDiagnosis(v); // a partir de la etiqueta bonita obtengo la clave interna

    const newCodes = this.store.diagnoses().filter(c => c !== code);
    this.store.diagnoses.set(newCodes);

    const newSelected = this.selected.filter(x => this.normalize(x) !== this.normalize(v));
    this.selected = newSelected;
  }

  // Comprueba por etiqueta bonita (HTA, CKD, ...)
  contains(v: string) {
    const n = this.normalize(v);
    return this.selected.some(s => this.normalize(s) === n);
  }


  // ======================================================
  // 🔹 Navegación
  // ======================================================
  navigateBack() {
    this.router.navigate(['/paciente']);
  }

  navigateNext() {
    this.router.navigate(['/analitica']);
  }



  // ======================================================
  // 🔹 Saber si un grupo tiene algún diagnóstico seleccionado
  // ======================================================
  hasSelectedInGroup(groupItems: string[]): boolean {
    return groupItems.some(item => this.contains(item));
  }
}
