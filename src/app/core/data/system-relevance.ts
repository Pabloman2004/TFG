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
 * Sistemas transversales NO aportan relevancia de visibilidad a ningún tab
 * (su marcador TRANSVERSAL se ignora al construir specificClassesByTab /
 * specificDxsByTab). Siguen disparando criterios en el motor de evaluación.
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
   * unitarios y el bucket «Relevantes de otros sistemas».
   */
  readonly specificClassesByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
  /** tabId → (drugClass → ids de criterios específicos de ese tab que la citan) */
  readonly specificClassCriteriaByTab: ReadonlyMap<TabId, ReadonlyMap<string, ReadonlySet<string>>>;
  /** criterioId → set completo de drugClasses citadas por ese criterio */
  readonly classesByCriterion: ReadonlyMap<string, ReadonlySet<string>>;
  /**
   * criterioId → drugClasses que el criterio exige que ESTÉN presentes (solo
   * polaridad positiva, también en START). Es lo que se puede pedir al usuario
   * que marque; las clases negadas de un START son el fármaco recomendado, cuya
   * ausencia es precisamente la condición.
   */
  readonly requiredClassesByCriterion: ReadonlyMap<string, ReadonlySet<string>>;
  /**
   * criterioId → (drugClass → clases que son ALTERNATIVAS suyas dentro del
   * criterio, por estar en otra rama del mismo `or`). Marcar una alternativa no
   * acerca el criterio a dispararse, así que no se resalta como co-requisito.
   */
  readonly classAlternativesByCriterion: ReadonlyMap<string, ReadonlyMap<string, ReadonlySet<string>>>;
  /** tabId → set de códigos de diagnóstico referenciados por criterios relevantes a ese tab */
  readonly dxsByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
  /**
   * tabId → set de códigos de diagnóstico referenciados por criterios cuyo `system`
   * mapea ESPECÍFICAMENTE a ese tab (excluye la expansión transversal/comodín).
   * Usado para el bloque «Relevantes de otros sistemas» en diagnósticos.
   */
  readonly specificDxsByTab: ReadonlyMap<TabId, ReadonlySet<string>>;
  /** tabId → (dxCode → ids de criterios específicos de ese tab que lo citan) */
  readonly specificDxCriteriaByTab: ReadonlyMap<TabId, ReadonlyMap<string, ReadonlySet<string>>>;
  /** criterioId → set completo de códigos de diagnóstico citados por ese criterio */
  readonly dxsByCriterion: ReadonlyMap<string, ReadonlySet<string>>;
  /** criterioId → (dxCode → diagnósticos alternativos suyos). Ver `classAlternativesByCriterion`. */
  readonly dxAlternativesByCriterion: ReadonlyMap<string, ReadonlyMap<string, ReadonlySet<string>>>;
  /**
   * Índices inversos globales (sin filtrar por tab). Permiten preguntar «¿qué
   * criterios necesitan esta clase / este diagnóstico?» para calcular enlaces
   * entre elementos que viven en pasos o pestañas distintas.
   */
  readonly criteriaByRequiredClass: ReadonlyMap<string, ReadonlySet<string>>;
  readonly criteriaByDx: ReadonlyMap<string, ReadonlySet<string>>;
}

export const resolveTabsForSystem = (system: string | undefined): readonly TabId[] =>
  (system ? SYSTEM_TO_TABS[system] : undefined) ?? [];

interface Refs {
  readonly classes: Set<string>;
  readonly positiveClasses: Set<string>;
  readonly dxs: Set<string>;
  /**
   * Un elemento por cada nodo `or` encontrado; cada elemento lista las clases
   * referenciadas por cada rama del `or`. Dos clases en ramas DISTINTAS del
   * mismo `or` son alternativas entre sí: marcar ambas no acerca el criterio a
   * dispararse, así que no deben resaltarse como co-requisitos.
   */
  readonly classOrNodes: Set<string>[][];
  /** Idéntico para diagnósticos. */
  readonly dxOrNodes: Set<string>[][];
}

const emptyRefs = (): Refs => ({
  classes: new Set<string>(),
  positiveClasses: new Set<string>(),
  dxs: new Set<string>(),
  classOrNodes: [],
  dxOrNodes: [],
});

const mergeRefs = (target: Refs, source: Refs): void => {
  source.classes.forEach(c => target.classes.add(c));
  source.positiveClasses.forEach(c => target.positiveClasses.add(c));
  source.dxs.forEach(d => target.dxs.add(d));
  target.classOrNodes.push(...source.classOrNodes);
  target.dxOrNodes.push(...source.dxOrNodes);
};

const addEgfrBelowDiagnoses = (threshold: number, acc: Refs): void => {
  if (threshold >= 30) acc.dxs.add('enfermedad_renal_grave');
  if (threshold >= 15) acc.dxs.add('insuficiencia_renal_terminal');
};

const CLASS_ARG_OPERATORS = new Set([
  'inDrugClass',
]);

const OPERATOR_TO_CLASS: Readonly<Record<string, string>> = {
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

const addClass = (acc: Refs, drugClass: string, negated: boolean): void => {
  acc.classes.add(drugClass);
  if (!negated) acc.positiveClasses.add(drugClass);
};

const walk = (node: unknown, acc: Refs, negated = false): void => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(n => walk(n, acc, negated));
    return;
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === '!') {
      walk(v, acc, !negated);
      continue;
    }
    if (k === 'or' && Array.isArray(v)) {
      const branches = v.map(branch => {
        const sub = emptyRefs();
        walk(branch, sub, negated);
        return sub;
      });
      acc.classOrNodes.push(branches.map(b => b.classes));
      acc.dxOrNodes.push(branches.map(b => b.dxs));
      branches.forEach(b => mergeRefs(acc, b));
      continue;
    }
    if (CLASS_ARG_OPERATORS.has(k) && Array.isArray(v) && typeof v[0] === 'string') {
      addClass(acc, v[0], negated);
      continue;
    }
    const impliedClass = OPERATOR_TO_CLASS[k];
    if (impliedClass) {
      addClass(acc, impliedClass, negated);
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
    walk(v, acc, negated);
  }
};

export const extractReferences = (logic: JsonLogicRule | undefined): Refs => {
  const acc = emptyRefs();
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
 * A partir de los nodos `or` recogidos por `walk`, calcula para cada referencia
 * el conjunto de referencias que son alternativas suyas: las que aparecen en
 * OTRA rama del mismo `or`. Las que están en la misma rama son conjuntivas.
 */
const alternativesFromOrNodes = (
  orNodes: readonly (readonly ReadonlySet<string>[])[],
): ReadonlyMap<string, ReadonlySet<string>> => {
  const result = new Map<string, Set<string>>();
  for (const branches of orNodes) {
    branches.forEach((branch, index) => {
      for (const ref of branch) {
        let alts = result.get(ref);
        if (!alts) {
          alts = new Set<string>();
          result.set(ref, alts);
        }
        branches.forEach((other, otherIndex) => {
          if (otherIndex === index) return;
          for (const otherRef of other) {
            if (otherRef !== ref) alts.add(otherRef);
          }
        });
      }
    });
  }
  return result;
};

const addToNested = <K1, K2, V>(
  m: Map<K1, Map<K2, Set<V>>>,
  key1: K1,
  key2: K2,
  value: V,
): void => {
  let inner = m.get(key1);
  if (!inner) {
    inner = new Map<K2, Set<V>>();
    m.set(key1, inner);
  }
  addTo(inner, key2, value);
};

/**
 * Construye el índice de relevancia a partir de los criterios.
 * @param criteria  Criterios cargados de criteria.json.
 * @param allTabIds Universo de tabs (unión de tabs de meds y dxs). Los sistemas
 *                  transversales (Analgésicos, Riesgo de caídas, etc.) se
 *                  expanden a este conjunto en classesByTab/dxsByTab. Si se omite,
 *                  los criterios transversales se ignoran ahí. La relevancia
 *                  específica (visibilidad foránea) nunca incluye transversales.
 */
export const buildRelevance = (
  criteria: readonly Crit[],
  allTabIds: readonly TabId[] = [],
): Relevance => {
  const classesByTab = new Map<TabId, Set<string>>();
  const specificClassesByTab = new Map<TabId, Set<string>>();
  const specificClassCriteriaByTab = new Map<TabId, Map<string, Set<string>>>();
  const classesByCriterion = new Map<string, Set<string>>();
  const requiredClassesByCriterion = new Map<string, Set<string>>();
  const dxsByTab = new Map<TabId, Set<string>>();
  const specificDxsByTab = new Map<TabId, Set<string>>();
  const specificDxCriteriaByTab = new Map<TabId, Map<string, Set<string>>>();
  const dxsByCriterion = new Map<string, Set<string>>();
  const classAlternativesByCriterion = new Map<string, ReadonlyMap<string, ReadonlySet<string>>>();
  const dxAlternativesByCriterion = new Map<string, ReadonlyMap<string, ReadonlySet<string>>>();
  const criteriaByRequiredClass = new Map<string, Set<string>>();
  const criteriaByDx = new Map<string, Set<string>>();

  for (const c of criteria) {
    const targets = resolveTabsForSystem(c.system);
    if (targets.length === 0) continue;

    const refs = extractReferences(c.logic);
    c.relevance?.medicationClasses?.forEach(drugClass => {
      refs.classes.add(drugClass);
      refs.positiveClasses.add(drugClass);
    });
    if (refs.classes.size === 0 && refs.dxs.size === 0) continue;

    // STOPP: solo polaridad positiva (marcar puede encender el aviso).
    // START: ambas (la clase negada es el fármaco recomendado).
    const visibilityClasses = c.type === 'STOPP' ? refs.positiveClasses : refs.classes;

    visibilityClasses.forEach(cls => addTo(classesByCriterion, c.id, cls));
    refs.positiveClasses.forEach(cls => {
      addTo(requiredClassesByCriterion, c.id, cls);
      addTo(criteriaByRequiredClass, cls.toUpperCase(), c.id);
    });
    refs.dxs.forEach(dx => {
      addTo(dxsByCriterion, c.id, dx);
      addTo(criteriaByDx, dx, c.id);
    });
    classAlternativesByCriterion.set(c.id, alternativesFromOrNodes(refs.classOrNodes));
    dxAlternativesByCriterion.set(c.id, alternativesFromOrNodes(refs.dxOrNodes));

    const isTransversal = targets.includes(TRANSVERSAL);
    const effectiveTabs: readonly TabId[] = isTransversal ? allTabIds : targets;

    for (const tab of effectiveTabs) {
      visibilityClasses.forEach(cls => addTo(classesByTab, tab, cls));
    }

    for (const dx of refs.dxs) {
      const dxTabs = tabsForDiagnosis(dx, targets, effectiveTabs);
      dxTabs.forEach(tab => addTo(dxsByTab, tab, dx));
    }

    if (!isTransversal) {
      for (const tab of targets) {
        visibilityClasses.forEach(cls => {
          addTo(specificClassesByTab, tab, cls);
          addToNested(specificClassCriteriaByTab, tab, cls, c.id);
        });
      }
      for (const dx of refs.dxs) {
        const dxTabs = tabsForDiagnosis(dx, targets, targets);
        dxTabs.forEach(tab => {
          addTo(specificDxsByTab, tab, dx);
          addToNested(specificDxCriteriaByTab, tab, dx, c.id);
        });
      }
    }
  }

  return {
    classesByTab,
    specificClassesByTab,
    specificClassCriteriaByTab,
    classesByCriterion,
    requiredClassesByCriterion,
    classAlternativesByCriterion,
    dxsByTab,
    specificDxsByTab,
    specificDxCriteriaByTab,
    dxsByCriterion,
    dxAlternativesByCriterion,
    criteriaByRequiredClass,
    criteriaByDx,
  };
};
