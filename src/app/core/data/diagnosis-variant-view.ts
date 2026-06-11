// @linked docs/propuesta-p15.md
// P15 — Vista de presentación: parte los diagnósticos de un grupo en árboles de
// familia (raíz + variantes excluyentes con radio-behavior) y diagnósticos planos.
// Es puro y derivado de DIAGNOSIS_VARIANT_FAMILIES; no toca el estado ni los códigos.

import { DIAGNOSIS_VARIANT_FAMILIES, DiagnosisVariantFamily } from './diagnosis-variants';

export interface VariantFamilyView {
  id: string;
  /** Label real de la raíz (el usado para el toggle / DIAGNOSIS_MAP). */
  rootLabel: string;
  /** Label mostrado para la raíz genérica. */
  rootDisplayLabel: string;
  /** ¿Renderizar la raíz como opción seleccionable? (raíz seleccionable y presente en el grupo). */
  showRoot: boolean;
  /** Variantes presentes en el grupo, en orden clínico de la familia. */
  variants: string[];
}

export interface GroupDiagnosisPartition {
  families: VariantFamilyView[];
  plain: string[];
}

const toView = (
  family: DiagnosisVariantFamily,
  present: ReadonlySet<string>,
): VariantFamilyView => ({
  id: family.id,
  rootLabel: family.rootLabel,
  rootDisplayLabel: `${family.rootLabel} (sin especificar)`,
  showRoot: family.rootSelectable && present.has(family.rootLabel),
  variants: family.variants.filter(v => present.has(v)),
});

export const partitionGroupDiagnoses = (
  diagnoses: readonly string[],
): GroupDiagnosisPartition => {
  const present = new Set(diagnoses);

  const families = DIAGNOSIS_VARIANT_FAMILIES
    .map(family => toView(family, present))
    .filter(view => view.showRoot || view.variants.length > 0);

  const familyMembers = new Set(
    families.flatMap(view => [view.rootLabel, ...view.variants]),
  );
  const plain = diagnoses.filter(label => !familyMembers.has(label));

  return { families, plain };
};
