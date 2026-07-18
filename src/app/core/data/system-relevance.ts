// @linked docs/motor-criterios.md
// Si cambias SYSTEM_TO_TABS, buildRelevance o extractReferences, actualiza el doc enlazado.

// Mapea criterios → tabs donde sus referencias (clases farmacológicas
// y códigos de diagnóstico) son clínicamente relevantes.
// Derivado de criteria.json: si un criterio "cardiovascular" cita BETABLOQUEANTE,
// esa clase es relevante para el tab "cardiovascular" aunque pertenezca a otro tab.

import { Crit, JsonLogicRule } from '../types';
import { DIAGNOSIS_GROUPS, DIAGNOSIS_MAP, slug } from './diagnoses';

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
  /**
   * tabId → set de drugClasses referenciadas por criterios cuyo `system` mapea
   * ESPECÍFICAMENTE a ese tab (excluye la expansión transversal/comodín).
   * Subconjunto de classesByTab. Usado para decidir el afloramiento de grupos
   * unitarios, que no debe dispararse por relevancia transversal.
   */
  readonly specificClassesByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
  /** tabId → set de códigos de diagnóstico referenciados por criterios relevantes a ese tab */
  readonly dxsByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
  /**
   * tabId → set de códigos de diagnóstico referenciados por criterios cuyo `system`
   * mapea ESPECÍFICAMENTE a ese tab (excluye la expansión transversal/comodín).
   * Usado para el bloque «Relevantes de otros sistemas» en diagnósticos.
   */
  readonly specificDxsByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
}

export const resolveTabsForSystem = (system: string | undefined): readonly TabId[] =>
  (system ? SYSTEM_TO_TABS[system] : undefined) ?? [];

interface Refs {
  readonly classes: Set<string>;
  readonly dxs: Set<string>;
}

const addEgfrBelowDiagnoses = (threshold: number, acc: Refs): void => {
  if (threshold >= 30) acc.dxs.add('enfermedad_renal_grave');
  if (threshold >= 15) acc.dxs.add('insuficiencia_renal_terminal');
};

const CLASS_ARG_OPERATORS = new Set([
  'inDrugClass',
  'medicationClassDurationAbove',
  'medicationClassDoseMgAbove',
]);

const OPERATOR_TO_CLASS: Readonly<Record<string, string>> = {
  digoxinaDosisAlta: 'DIGOXINA',
  multipleNSAIDs: 'AINE',
  multipleLoopDiuretics: 'DIURETICO_ASA',
  multipleThiazideDiuretics: 'DIURETICO_TIAZIDICO',
  multipleIECA: 'IECA',
  multipleARAII: 'ARA2',
  multipleAldosteroneAntagonists: 'ANTAGONISTA_ALDOSTERONA',
  multipleDiureticosAhorradoresPotasio: 'DIURETICO_AHORRADOR_POTASIO',
  multipleISRS: 'ISRS',
  multipleANTIAGREGANTES: 'ANTIAGREGANTE',
  multipleANTICOLINERGICOS: 'ANTICOLINERGICO',
};

const walk = (node: unknown, acc: Refs): void => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(n => walk(n, acc));
    return;
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (CLASS_ARG_OPERATORS.has(k) && Array.isArray(v) && typeof v[0] === 'string') {
      acc.classes.add(v[0]);
      continue;
    }
    const impliedClass = OPERATOR_TO_CLASS[k];
    if (impliedClass) {
      acc.classes.add(impliedClass);
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
    if (k === 'egfrBelow' && Array.isArray(v) && typeof v[0] === 'number') {
      addEgfrBelowDiagnoses(v[0], acc);
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

const DX_HOME_TAB_BY_CODE: ReadonlyMap<string, TabId> = (() => {
  const map = new Map<string, TabId>();
  for (const [label, system] of Object.entries(DIAGNOSIS_GROUPS)) {
    const code = DIAGNOSIS_MAP[label] ?? slug(label);
    map.set(code, slug(system));
  }
  return map;
})();

const tabsForDiagnosis = (
  dxCode: string,
  targets: readonly TabId[],
  effectiveTabs: readonly TabId[],
): readonly TabId[] => {
  if (targets.length <= 1) return effectiveTabs;
  const home = DX_HOME_TAB_BY_CODE.get(dxCode);
  if (home && targets.includes(home)) return [home];
  return effectiveTabs;
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
  const specificClassesByTab = new Map<TabId, Set<string>>();
  const dxsByTab = new Map<TabId, Set<string>>();
  const specificDxsByTab = new Map<TabId, Set<string>>();

  for (const c of criteria) {
    const targets = resolveTabsForSystem(c.system);
    if (targets.length === 0) continue;

    const refs = extractReferences(c.logic);
    c.relevance?.medicationClasses?.forEach(drugClass => refs.classes.add(drugClass));
    if (refs.classes.size === 0 && refs.dxs.size === 0) continue;

    const isTransversal = targets.includes(TRANSVERSAL);
    const effectiveTabs: readonly TabId[] = isTransversal ? allTabIds : targets;

    for (const tab of effectiveTabs) {
      refs.classes.forEach(cls => addTo(classesByTab, tab, cls));
    }

    for (const dx of refs.dxs) {
      const dxTabs = tabsForDiagnosis(dx, targets, effectiveTabs);
      dxTabs.forEach(tab => addTo(dxsByTab, tab, dx));
    }

    if (!isTransversal) {
      for (const tab of targets) {
        refs.classes.forEach(cls => addTo(specificClassesByTab, tab, cls));
      }
      for (const dx of refs.dxs) {
        const dxTabs = tabsForDiagnosis(dx, targets, targets);
        dxTabs.forEach(tab => addTo(specificDxsByTab, tab, dx));
      }
    }
  }

  return { classesByTab, specificClassesByTab, dxsByTab, specificDxsByTab };
};
