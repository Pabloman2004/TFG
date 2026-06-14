// @linked docs/catalogo-clinico.md
// Dependencias diagnóstico → medicación derivadas de criteria.json (STOPP med+dx).

import { Crit, JsonLogicRule, Med } from '../types';
import { extractPositiveDxCodesForDependencies } from './diagnosis-family';
import { DIAGNOSIS_REVERSE_MAP } from './diagnoses';
import { ALWAYS_ENABLED_LABELS } from './dx-anchor-labels-candidate';
import { DX_DEPENDENCIES_OVERRIDES } from './dx-dependencies-overrides';

export { ALWAYS_ENABLED_LABELS } from './dx-anchor-labels-candidate';

export type DxTrigger = {
  classes?: string[];
  ids?: string[];
  tooltip: string;
};

export type DxDependencies = Readonly<Record<string, DxTrigger>>;

export const extractDrugClasses = (logic: JsonLogicRule | undefined): Set<string> => {
  const classes = new Set<string>();
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === 'inDrugClass' && Array.isArray(v) && typeof v[0] === 'string') {
        classes.add(v[0]);
        continue;
      }
      walk(v);
    }
  };
  if (logic) walk(logic);
  return classes;
};

export const extractPositiveDxCodes = (logic: JsonLogicRule | undefined): Set<string> => {
  const dxs = new Set<string>();
  const walk = (node: unknown, negated: boolean): void => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(n => walk(n, negated));
      return;
    }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === '!' || k === 'not') {
        walk(v, true);
        continue;
      }
      if (
        k === 'in' &&
        Array.isArray(v) &&
        typeof v[0] === 'string' &&
        v[1] &&
        typeof v[1] === 'object' &&
        (v[1] as Record<string, unknown>)['var'] === 'diagnoses'
      ) {
        if (!negated) dxs.add(v[0]);
        continue;
      }
      walk(v, negated);
    }
  };
  if (logic) walk(logic, false);
  return dxs;
};

const tooltipForClasses = (classes: readonly string[]): string =>
  `Disponible si se marca medicación de las clases: ${classes.join(', ')}`;

const triggerFromClasses = (classes: Iterable<string>): DxTrigger => {
  const sorted = [...new Set(classes)].sort();
  return { classes: sorted, tooltip: tooltipForClasses(sorted) };
};

export const buildDxDependencies = (
  criteria: readonly Crit[],
  overrides: Record<string, DxTrigger> = DX_DEPENDENCIES_OVERRIDES,
): DxDependencies => {
  const classesByCode = new Map<string, Set<string>>();

  for (const c of criteria) {
    if (c.type !== 'STOPP' || !c.logic) continue;

    const dxCodes = extractPositiveDxCodesForDependencies(c.logic);
    if (dxCodes.size === 0) continue;

    const drugClasses = extractDrugClasses(c.logic);
    const excludeClasses = c.excludes?.drugClasses ?? [];

    for (const dxCode of dxCodes) {
      const bucket = classesByCode.get(dxCode) ?? new Set<string>();
      drugClasses.forEach(cls => bucket.add(cls));
      excludeClasses.forEach(cls => bucket.add(cls));
      classesByCode.set(dxCode, bucket);
    }
  }

  const derived: Record<string, DxTrigger> = {};
  for (const [code, classes] of classesByCode) {
    const label = DIAGNOSIS_REVERSE_MAP[code];
    if (!label || ALWAYS_ENABLED_LABELS.has(label)) continue;
    if (classes.size === 0) continue;
    derived[label] = triggerFromClasses(classes);
  }

  return { ...derived, ...overrides };
};

export const isDiagnosisEnabled = (
  label: string,
  meds: readonly Med[],
  deps: DxDependencies,
): boolean => {
  const dep = deps[label];
  if (!dep) return true;
  const classesSatisfied =
    dep.classes?.some(cls => meds.some(m => m.drugClasses.includes(cls))) ?? false;
  if (classesSatisfied) return true;
  const idsSatisfied = dep.ids?.some(id => meds.some(m => m.id === id)) ?? false;
  return idsSatisfied;
};

export const dxTooltip = (label: string, deps: DxDependencies): string =>
  deps[label]?.tooltip ?? '';
