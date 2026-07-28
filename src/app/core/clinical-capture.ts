// @linked docs/flujo-pasos.md
// Si cambias la visibilidad de medicamentos por tab, actualiza el doc enlazado.
import { DrugGroup } from './data/medications-taxonomy';
import { Med } from './types';

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
