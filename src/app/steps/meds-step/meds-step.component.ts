import { Component, ChangeDetectionStrategy, OnInit, effect, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { Router } from '@angular/router';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CaseStoreService } from '../../core/case-store.service';
import { CriteriaEngineService } from '../../core/services/criteria-engine.service';
import { Med, Crit } from '../../core/types';
import { MEDICATIONS, MED_NAMES } from '../../core/data/medications';

interface MedicationOption {
  name: string;
  disabled: boolean;
  criterion: Crit | null;
}

@Component({
  selector: 'app-meds-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatChipsModule, MatIconModule, MatAutocompleteModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: "./meds-step.component.html",
  styleUrl: "./meds-step.component.css"
})
export class MedsStepComponent implements OnInit {

  @ViewChild('medInput') medInput!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private store: CaseStoreService,
    private criteriaEngine: CriteriaEngineService
  ) {
    // Recalcular cuando cambien las medicaciones
    effect(() => {
      this.selected = [...this.store.meds()];
      this.updateExclusions();
    });

    // Recalcular cuando cambien diagnósticos o analíticas
    effect(() => {
      // Acceder a los diagnoses y labs para que Angular los trackee
      this.store.diagnoses();
      this.store.labs();
      this.updateExclusions();
    });
  }

  selected: Med[] = [];

  // 🔹 Criterios cargados
  criteria = signal<Crit[]>([]);

  // 🔹 Mapa de exclusiones: nombre medicación -> criterio que la excluye
  exclusions = signal<Map<string, Crit>>(new Map());

  // 🔹 Autocomplete usa opciones con estado de habilitado/deshabilitado
  private allMeds = MED_NAMES;

  queryCtrl = new FormControl<string>('', { nonNullable: true });

  filtered$: Observable<MedicationOption[]> = this.queryCtrl.valueChanges.pipe(
    startWith(this.queryCtrl.value),
    map(q => this.filterOptions(q))
  );

  async ngOnInit() {
    this.selected = [...this.store.meds()];

    // Cargar criterios
    const loadedCriteria = await this.criteriaEngine.loadCriteria();
    this.criteria.set(loadedCriteria);

    this.updateExclusions();
  }

  private updateExclusions() {
    const patientCase = this.store.patientCase;
    const excluded = this.criteriaEngine.getExcludedMedications(patientCase, this.criteria());
    this.exclusions.set(excluded);

    // Forzar que el autocomplete se actualice con las nuevas exclusiones
    this.queryCtrl.updateValueAndValidity();
    // Trigger el observable para que recalcule con las nuevas exclusiones
    const currentValue = this.queryCtrl.value;
    this.queryCtrl.setValue(currentValue);
  }


  private normalize = (s: string) => s.trim().toLowerCase();

  private filterOptions(q: string | null): MedicationOption[] {
    const n = this.normalize(q ?? '');
    const selectedNames = this.selected.map(m => m.id.toLowerCase());
    const excluded = this.exclusions();

    return this.allMeds
      .filter(o => !selectedNames.includes(o.toLowerCase()))
      .filter(o => !n || o.toLowerCase().includes(n))
      .map(medName => {
        const criterion = excluded.get(medName.toLowerCase());
        return {
          name: medName,
          disabled: !!criterion,
          criterion: criterion || null
        };
      });
  }

  addFromAutocomplete(ev: MatAutocompleteSelectedEvent) {
    const medName = ev.option.value as string;

    // Buscar la opción completa para verificar si está deshabilitada
    const currentFiltered = this.filterOptions(this.queryCtrl.value);
    const option = currentFiltered.find(opt => opt.name === medName);

    // No permitir añadir si está deshabilitada
    if (option?.disabled) {
      this.queryCtrl.setValue('');
      return;
    }

    this.add(medName);
    this.queryCtrl.setValue('');
  }

  tryAddFromText() {
    const v = this.queryCtrl.value?.trim();
    if (v) { this.add(v); this.queryCtrl.setValue(''); }
  }

  add(v: string) {
    const name = v.trim();

    // Verificar si ya está seleccionado (prevenir duplicados)
    const alreadySelected = this.selected.some(m =>
      m.id.toLowerCase() === name.toLowerCase()
    );

    if (alreadySelected) {
      console.warn(`Medicación "${name}" ya está seleccionada`);
      return;
    }

    // Buscar en MEDICATIONS
    const found = MEDICATIONS.find(m => m.id === name);

    // Si existe en la base, usamos su versión canonizada
    const med: Med = found ?? {
      id: name,
      drugClasses: []
    };

    this.selected = [...this.selected, med];
    this.store.meds.set(this.selected);
  }


  remove(v: Med) {
    const n = this.normalize(v.id);
    this.selected = this.selected.filter(x => this.normalize(x.id) !== n);
    this.store.meds.set(this.selected);
  }

  onKeydown(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'Enter' || key === ',') {
      this.tryAddFromText();
      event.preventDefault();
    }
  }

  // 🔹 Para que el autocomplete muestre bien el nombre
  displayMed(value: any): string {
    if (typeof value === 'string') return value;
    if (value?.name) return value.name;  // MedicationOption
    return value?.id ?? '';
  }

  track = (_: number, item: Med) => item.id;

  navigateBack() {
    this.router.navigate(['/analitica']);
  }

  navigateNext() {
    this.router.navigate(['/resultados']);
  }
}
