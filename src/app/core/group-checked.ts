// @linked docs/flujo-pasos.md
// Si cambias isMedGroupChecked o isDxGroupChecked, actualiza el doc enlazado.
import { Med } from './types';
import { DrugGroup } from './data/medications-taxonomy';
import { DiagnosisGroup } from './data/diagnoses-taxonomy';
import { normalizeDiagnosis, DIAGNOSIS_REVERSE_MAP } from './data/diagnoses';

export const isMedGroupChecked = (group: DrugGroup, meds: readonly Med[]): boolean => {
  if (meds.length === 0) return false;
  const knownDrugs = new Set(group.drugs);
  if (meds.some(m => knownDrugs.has(m.id))) return true;
  if (meds.some(m => m.id === `otro__${group.id}`)) return true;
  if (group.drugClass) {
    const dc = group.drugClass;
    return meds.some(m =>
      m.drugClasses.includes(dc) &&
      !knownDrugs.has(m.id) &&
      !m.id.startsWith('otro__'),
    );
  }
  return false;
};

export const isDxGroupChecked = (
  group: DiagnosisGroup,
  diagnoses: readonly string[],
): boolean => {
  if (diagnoses.length === 0) return false;
  const sel = new Set(diagnoses);
  const knownCodes = new Set(group.diagnoses.map(d => normalizeDiagnosis(d)));
  if (group.diagnoses.some(d => sel.has(normalizeDiagnosis(d)))) return true;
  if (sel.has(`${group.id}__otro`)) return true;
  const knownAnyCode = new Set(Object.keys(DIAGNOSIS_REVERSE_MAP));
  return diagnoses.some(code =>
    !knownCodes.has(code) &&
    !knownAnyCode.has(code) &&
    code.startsWith(`${group.id}__`),
  );
};
