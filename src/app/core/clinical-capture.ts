// @linked docs/flujo-pasos.md
// Si cambias qué clases capturan dosis/duración o la visibilidad por tab, actualiza el doc enlazado.
import { DrugGroup } from './data/medications-taxonomy';
import { Med } from './types';

export type MedNumericField = 'doseMcgDay' | 'doseMgDay' | 'durationDays';

export type ClinicalCaptureField = {
  readonly trackKey: string;
  readonly medId: string;
  readonly field: MedNumericField;
  readonly label: string;
  readonly value: number | undefined;
  readonly min: number;
  readonly step: number;
};

type CaptureSpec = {
  readonly field: MedNumericField;
  readonly label: (medId: string) => string;
  readonly step: number;
};

const CAPTURE_SPECS_BY_CLASS: Readonly<Record<string, readonly CaptureSpec[]>> = {
  DIGOXINA: [
    { field: 'doseMcgDay', label: medId => `${medId} (µg/día)`, step: 0.1 },
    { field: 'durationDays', label: () => 'Duración (días)', step: 1 },
  ],
  HIERRO_ORAL: [{ field: 'doseMgDay', label: medId => `${medId} (mg/día)`, step: 0.1 }],
  IBP: [{ field: 'durationDays', label: medId => `${medId} (días)`, step: 1 }],
  AAS: [{ field: 'doseMgDay', label: medId => `${medId} (mg/día)`, step: 1 }],
  BENZODIACEPINA: [{ field: 'durationDays', label: medId => `${medId} (días)`, step: 1 }],
  HIPNOTICO_Z: [{ field: 'durationDays', label: medId => `${medId} (días)`, step: 1 }],
  NEUROLEPTICO: [{ field: 'durationDays', label: medId => `${medId} (días)`, step: 1 }],
  CORTICOIDE_SISTEMICO: [{ field: 'durationDays', label: medId => `${medId} (días)`, step: 1 }],
  ANALGESICO_SIMPLE: [{ field: 'doseMgDay', label: medId => `${medId} (mg/día)`, step: 1 }],
};

export function medsVisibleInTabGroups(
  meds: readonly Med[],
  groups: readonly DrugGroup[],
): readonly Med[] {
  const visibleIds = new Set<string>();
  for (const group of groups) {
    const knownDrugs = new Set(group.drugs);
    for (const med of meds) {
      if (visibleIds.has(med.id)) continue;
      if (knownDrugs.has(med.id)) {
        visibleIds.add(med.id);
        continue;
      }
      if (med.id === `otro__${group.id}`) {
        visibleIds.add(med.id);
        continue;
      }
      if (group.drugClass && med.drugClasses.includes(group.drugClass) && !med.id.startsWith('otro__')) {
        visibleIds.add(med.id);
      }
    }
  }
  return meds.filter(med => visibleIds.has(med.id));
}

export function clinicalCaptureFields(meds: readonly Med[]): readonly ClinicalCaptureField[] {
  const fields: ClinicalCaptureField[] = [];
  const seen = new Set<string>();

  for (const med of meds) {
    for (const drugClass of med.drugClasses) {
      const specs = CAPTURE_SPECS_BY_CLASS[drugClass];
      if (!specs) continue;
      for (const spec of specs) {
        const trackKey = `${med.id}:${spec.field}`;
        if (seen.has(trackKey)) continue;
        seen.add(trackKey);
        fields.push({
          trackKey,
          medId: med.id,
          field: spec.field,
          label: spec.label(med.id),
          value: med[spec.field],
          min: 0,
          step: spec.step,
        });
      }
    }
  }

  return fields;
}
