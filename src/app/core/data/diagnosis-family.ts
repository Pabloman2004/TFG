// Familias padre/variante para evitar conflación en la derivación de dx-dependencies.
// Cuando un OR de criteria.json incluye el código ancla y variantes de la misma familia,
// la dependencia de medicación solo se asigna al ancla (el resto del OR son alias clínicos).

import { DIAGNOSIS_MAP, DIAGNOSIS_SUBGROUPS, normalizeDiagnosis } from './diagnoses';
import { DIAGNOSIS_VARIANT_FAMILIES, familyMemberLabels } from './diagnosis-variants';
import { JsonLogicRule } from '../types';

export type DiagnosisFamily = {
  readonly anchorLabel: string;
  readonly anchorCode: string;
  readonly memberCodes: ReadonlySet<string>;
};

const subgroupFamilies = (): DiagnosisFamily[] => {
  const bySubgroup = new Map<string, string[]>();
  for (const [label, subgroup] of Object.entries(DIAGNOSIS_SUBGROUPS)) {
    const bucket = bySubgroup.get(subgroup) ?? [];
    bucket.push(label);
    bySubgroup.set(subgroup, bucket);
  }

  return [...bySubgroup.entries()]
    .filter(([subgroup, labels]) => labels.some(label => label === subgroup))
    .map(([subgroup, labels]) => ({
      anchorLabel: subgroup,
      anchorCode: normalizeDiagnosis(subgroup),
      memberCodes: new Set(labels.map(label => normalizeDiagnosis(label))),
    }));
};

const variantFamilies = (): DiagnosisFamily[] =>
  DIAGNOSIS_VARIANT_FAMILIES.map(family => {
    const members = familyMemberLabels(family);
    return {
      anchorLabel: family.rootLabel,
      anchorCode: normalizeDiagnosis(family.rootLabel),
      memberCodes: new Set(members.map(label => normalizeDiagnosis(label))),
    };
  });

const mergeFamilies = (families: DiagnosisFamily[]): DiagnosisFamily[] => {
  const byAnchor = new Map<string, DiagnosisFamily>();
  for (const family of families) {
    const existing = byAnchor.get(family.anchorCode);
    if (!existing) {
      byAnchor.set(family.anchorCode, family);
      continue;
    }
    byAnchor.set(family.anchorCode, {
      anchorLabel: existing.anchorLabel,
      anchorCode: existing.anchorCode,
      memberCodes: new Set([...existing.memberCodes, ...family.memberCodes]),
    });
  }
  return [...byAnchor.values()];
};

export const DIAGNOSIS_FAMILIES: readonly DiagnosisFamily[] = mergeFamilies([
  ...subgroupFamilies(),
  ...variantFamilies(),
]);

export const collapseFamilyConflationInOr = (codes: ReadonlySet<string>): Set<string> => {
  const result = new Set(codes);
  for (const family of DIAGNOSIS_FAMILIES) {
    if (!result.has(family.anchorCode)) continue;
    for (const memberCode of family.memberCodes) {
      if (memberCode !== family.anchorCode) result.delete(memberCode);
    }
  }
  return result;
};

const walkPositiveDx = (node: unknown, negated: boolean): Set<string> => {
  if (!node || typeof node !== 'object') return new Set();
  if (Array.isArray(node)) {
    return new Set(node.flatMap(item => [...walkPositiveDx(item, negated)]));
  }

  const obj = node as Record<string, unknown>;

  if ('!' in obj || 'not' in obj) {
    return walkPositiveDx(obj['!'] ?? obj['not'], true);
  }

  if ('or' in obj && Array.isArray(obj.or)) {
    const branchCodes = obj.or.flatMap(branch => [...walkPositiveDx(branch, negated)]);
    return collapseFamilyConflationInOr(new Set(branchCodes));
  }

  if ('and' in obj && Array.isArray(obj.and)) {
    return new Set(obj.and.flatMap(branch => [...walkPositiveDx(branch, negated)]));
  }

  if (
    'in' in obj &&
    Array.isArray(obj.in) &&
    typeof obj.in[0] === 'string' &&
    obj.in[1] &&
    typeof obj.in[1] === 'object' &&
    (obj.in[1] as Record<string, unknown>).var === 'diagnoses' &&
    !negated
  ) {
    return new Set([obj.in[0]]);
  }

  return new Set(Object.values(obj).flatMap(value => [...walkPositiveDx(value, negated)]));
};

/** Códigos dx positivos para asignación de deps, con colapso padre/variante en cada OR. */
export const extractPositiveDxCodesForDependencies = (
  logic: JsonLogicRule | undefined,
): Set<string> => {
  if (!logic) return new Set();
  return walkPositiveDx(logic, false);
};

export const labelForCode = (code: string): string | undefined => {
  for (const [label, mapped] of Object.entries(DIAGNOSIS_MAP)) {
    if (mapped === code) return label;
  }
  return undefined;
};
