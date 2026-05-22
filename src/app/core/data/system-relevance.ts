// Mapea criterios → tabs donde sus referencias (clases farmacológicas
// y códigos de diagnóstico) son clínicamente relevantes.
// Derivado de criteria.json: si un criterio "cardiovascular" cita BETABLOQUEANTE,
// esa clase es relevante para el tab "cardiovascular" aunque pertenezca a otro tab.

import { Crit, JsonLogicRule } from '../types';

export const TRANSVERSAL = '*';

export type TabId = string;

/**
 * Mapeo system (criteria.json) → tabs donde el criterio se considera relevante.
 * Los tabs listados pueden pertenecer al espacio de medicaciones o de diagnósticos;
 * los consumidores filtran por los tabs que conocen.
 *
 * Sistemas transversales se expanden a TODOS los tabs en buildRelevance.
 */
export const SYSTEM_TO_TABS: Record<string, readonly TabId[]> = {
  'Sistema cardiovascular':                ['cardiovascular'],
  'Sistema nervioso central':              ['snc', 'neurologico', 'psiquiatrico'],
  'Sistema renal':                         ['renal'],
  'Sistema gastrointestinal':              ['gastrointestinal'],
  'Sistema respiratorio':                  ['respiratorio'],
  'Sistema endocrino':                     ['endocrino', 'metabolico'],
  'Sistema urogenital':                    ['urologico', 'ginecologico'],
  'Sistema musculoesquelético':            ['osteo', 'reumatologico'],
  'Anticoagulantes/Antiagregantes':        ['anticoagulantes', 'hematologico'],
  'Analgésicos':                           [TRANSVERSAL],
  'Riesgo de caídas':                      [TRANSVERSAL],
  'Carga antimuscarínica/anticolinérgica': [TRANSVERSAL],
  'Indicación de la medicación':           [TRANSVERSAL],
};

export interface Relevance {
  /** tabId → set de drugClasses referenciadas por criterios relevantes a ese tab */
  readonly classesByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
  /** tabId → set de códigos de diagnóstico referenciados por criterios relevantes a ese tab */
  readonly dxsByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
}

export const resolveTabsForSystem = (system: string | undefined): readonly TabId[] =>
  (system ? SYSTEM_TO_TABS[system] : undefined) ?? [];

interface Refs {
  readonly classes: Set<string>;
  readonly dxs: Set<string>;
}

const walk = (node: unknown, acc: Refs): void => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(n => walk(n, acc));
    return;
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === 'inDrugClass' && Array.isArray(v) && typeof v[0] === 'string') {
      acc.classes.add(v[0]);
      continue;
    }
    if (
      k === 'in' &&
      Array.isArray(v) &&
      typeof v[0] === 'string' &&
      v[1] && typeof v[1] === 'object' &&
      (v[1] as Record<string, unknown>)['var'] === 'diagnoses'
    ) {
      acc.dxs.add(v[0]);
      continue;
    }
    walk(v, acc);
  }
};

export const extractReferences = (logic: JsonLogicRule | undefined): Refs => {
  const acc: Refs = { classes: new Set<string>(), dxs: new Set<string>() };
  if (logic) walk(logic, acc);
  return acc;
};

const addTo = <K, V>(m: Map<K, Set<V>>, key: K, value: V): void => {
  let bucket = m.get(key);
  if (!bucket) {
    bucket = new Set<V>();
    m.set(key, bucket);
  }
  bucket.add(value);
};

/**
 * Construye el índice de relevancia a partir de los criterios.
 * @param criteria  Criterios cargados de criteria.json.
 * @param allTabIds Universo de tabs (unión de tabs de meds y dxs). Los sistemas
 *                  transversales (Analgésicos, Riesgo de caídas, etc.) se
 *                  expanden a este conjunto. Si se omite, los criterios
 *                  transversales se ignoran.
 */
export const buildRelevance = (
  criteria: readonly Crit[],
  allTabIds: readonly TabId[] = [],
): Relevance => {
  const classesByTab = new Map<TabId, Set<string>>();
  const dxsByTab = new Map<TabId, Set<string>>();

  for (const c of criteria) {
    const targets = resolveTabsForSystem(c.system);
    if (targets.length === 0) continue;

    const refs = extractReferences(c.logic);
    if (refs.classes.size === 0 && refs.dxs.size === 0) continue;

    const isTransversal = targets.includes(TRANSVERSAL);
    const effectiveTabs: readonly TabId[] = isTransversal ? allTabIds : targets;

    for (const tab of effectiveTabs) {
      refs.classes.forEach(cls => addTo(classesByTab, tab, cls));
      refs.dxs.forEach(dx => addTo(dxsByTab, tab, dx));
    }
  }

  return { classesByTab, dxsByTab };
};
