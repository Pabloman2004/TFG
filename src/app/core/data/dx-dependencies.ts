// @linked docs/catalogo-clinico.md
// Dependencias diagnóstico → medicación derivadas de criteria.json (STOPP med+dx).

import { Crit, JsonLogicRule, Med } from '../types';
import { extractPositiveDxCodesForDependencies } from './diagnosis-family';
import { DIAGNOSIS_MAP, DIAGNOSIS_REVERSE_MAP } from './diagnoses';
import { MEDICATIONS } from './medications';
import { ALWAYS_ENABLED_LABELS } from './dx-anchor-labels-candidate';
import { DX_DEPENDENCIES_OVERRIDES } from './dx-dependencies-overrides';

export { ALWAYS_ENABLED_LABELS } from './dx-anchor-labels-candidate';

export type DxTrigger = {
  classes?: string[];
  ids?: string[];
  tooltip: string;
};

export type DxDependencies = Readonly<Record<string, DxTrigger>>;

// Tarea C: walker con flag negated para no extraer clases dentro de ramas !{}.
export const extractDrugClasses = (logic: JsonLogicRule | undefined): Set<string> => {
  const classes = new Set<string>();
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
        (k === 'inDrugClass' || k === 'medicationClassDurationAbove') &&
        Array.isArray(v) &&
        typeof v[0] === 'string'
      ) {
        if (!negated) classes.add(v[0]);
        continue;
      }
      walk(v, negated);
    }
  };
  if (logic) walk(logic, false);
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

const ES_COLLATOR = new Intl.Collator('es', { sensitivity: 'base' });
const TOOLTIP_EXAMPLE_LIMIT = 3;

const exampleDrugsForClasses = (classes: readonly string[]): string[] => {
  const wanted = new Set(classes);
  return MEDICATIONS.filter(m => m.drugClasses.some(dc => wanted.has(dc)))
    .map(m => m.id)
    .sort((a, b) => ES_COLLATOR.compare(a, b));
};

const tooltipForClasses = (classes: readonly string[]): string => {
  const drugs = exampleDrugsForClasses(classes);
  if (drugs.length === 0) {
    return `Disponible si se marca medicación de las clases: ${classes.join(', ')}`;
  }
  const shown = drugs.slice(0, TOOLTIP_EXAMPLE_LIMIT);
  const ellipsis = drugs.length > shown.length ? '…' : '';
  return `Disponible si se marca, p. ej.: ${shown.join(', ')}${ellipsis}`;
};

const triggerFromClasses = (classes: Iterable<string>): DxTrigger => {
  const sorted = [...new Set(classes)].sort();
  return { classes: sorted, tooltip: tooltipForClasses(sorted) };
};

// Tarea D: guard de integridad — detecta labels de override sin entrada en DIAGNOSIS_MAP.
export const validateOverrideLabels = (
  overrides: Record<string, DxTrigger>,
  diagnosisMap: Record<string, string>,
): void => {
  for (const label of Object.keys(overrides)) {
    if (!(label in diagnosisMap)) {
      throw new Error(
        `dx-dependencies-overrides: label "${label}" no existe en DIAGNOSIS_MAP. ` +
          `Verifica el nombre exacto o actualiza el mapa de diagnósticos.`,
      );
    }
  }
};

export type BuildDxDepsOptions = {
  /** Si false, no añade excludes.drugClasses al bucket de gating (Tarea B). Por defecto true. */
  includeExcludeClasses?: boolean;
};

/**
 * Labels que algún criterio START exige en positivo. El gating se deriva de STOPP
 * (fármaco presente → habilita el dx), pero un START recomienda INICIAR el fármaco:
 * condicionar su diagnóstico a esa medicación lo haría inalcanzable justo para el
 * paciente al que apunta el criterio. Estos labels quedan siempre habilitados.
 */
export const startRequiredLabels = (criteria: readonly Crit[]): ReadonlySet<string> => {
  // extractPositiveDxCodes, no la variante ...ForDependencies: el colapso
  // padre/variante de esta última descartaría las variantes de HTA e IC, que son
  // labels distintos y marcables por separado en la UI.
  const codes = new Set(
    criteria
      .filter(c => c.type === 'START')
      .flatMap(c => [...extractPositiveDxCodes(c.logic)]),
  );
  return new Set(
    Object.entries(DIAGNOSIS_MAP)
      .filter(([, code]) => codes.has(code))
      .map(([label]) => label),
  );
};

export const buildDxDependencies = (
  criteria: readonly Crit[],
  overrides: Record<string, DxTrigger> = DX_DEPENDENCIES_OVERRIDES,
  { includeExcludeClasses = false }: BuildDxDepsOptions = {},
): DxDependencies => {
  validateOverrideLabels(overrides, DIAGNOSIS_MAP);

  const startRequired = startRequiredLabels(criteria);
  const classesByCode = new Map<string, Set<string>>();

  for (const c of criteria) {
    if (c.type !== 'STOPP' || !c.logic) continue;

    const dxCodes = extractPositiveDxCodesForDependencies(c.logic);
    if (dxCodes.size === 0) continue;

    const drugClasses = extractDrugClasses(c.logic);
    const excludeClasses = includeExcludeClasses ? (c.excludes?.drugClasses ?? []) : [];

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

  return Object.fromEntries(
    Object.entries({ ...derived, ...overrides })
      .filter(([label]) => !startRequired.has(label)),
  );
};

export const isDiagnosisEnabled = (
  label: string,
  meds: readonly Med[],
  deps: DxDependencies,
): boolean => {
  const dep = deps[label];
  if (!dep || !hasEffectiveDxTriggers(dep)) return true;
  const classesSatisfied =
    dep.classes?.some(cls => meds.some(m => m.drugClasses.includes(cls))) ?? false;
  if (classesSatisfied) return true;
  return dep.ids?.some(id => meds.some(m => m.id === id)) ?? false;
};

// Tarea E: un único predicado nombrado que captura los tres caminos de "siempre habilitado":
//   1. Label no está en deps (ancla non-doubtful o dx solo-START).
//   2. Label en deps pero sin triggers efectivos.
//   3. (Implícito) label no está en DIAGNOSIS_MAP → isDiagnosisEnabled devuelve true.
export const isAlwaysEnabled = (label: string, deps: DxDependencies): boolean =>
  isDiagnosisEnabled(label, [], deps);

export const dxTooltip = (label: string, deps: DxDependencies): string =>
  deps[label]?.tooltip ?? '';

export const hasEffectiveDxTriggers = (dep: DxTrigger | undefined): boolean =>
  (dep?.classes?.length ?? 0) > 0 || (dep?.ids?.length ?? 0) > 0;
