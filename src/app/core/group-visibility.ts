// @linked docs/flujo-pasos.md
// Si cambias computeMedGroupBuckets, computeDxGroupBuckets o las interfaces de buckets, actualiza el doc enlazado.
// Funciones puras para calcular qué grupos son visibles en cada tab,
// compartidas por MedsStepComponent y DiagnosisStepComponent.
import { DrugGroup, DrugCategory } from './data/medications-taxonomy';
import { DiagnosisGroup, DiagnosisTab } from './data/diagnoses-taxonomy';
import { Relevance } from './data/system-relevance';
import { normalizeDiagnosis } from './data/diagnoses';

const ES_COLLATOR = new Intl.Collator('es', { sensitivity: 'base' });

// ─── Medicaciones ──────────────────────────────────────────────────────────────

export interface MedForeignGroup extends DrugGroup {
  readonly originTabId: string;
  readonly originTabLabel: string;
}

export interface MedGroupBuckets {
  readonly ownAll: readonly DrugGroup[];
  readonly foreignRelevant: readonly MedForeignGroup[];
}

const surfacesByRelevance = (g: DrugGroup, relevantClasses: ReadonlySet<string>): boolean =>
  !!g.drugClass && relevantClasses.has(g.drugClass);

// Clases que afloran como grupo propio en algún tab de sistema por ser
// clínicamente relevantes ahí. Un unitario con una de estas clases sale de "Otros".
const medTabRelevantClasses = (
  categories: readonly DrugCategory[],
  relevance: Relevance | null,
): ReadonlySet<string> => {
  const acc = new Set<string>();
  for (const c of categories) {
    const classes = relevance?.classesByTab.get(c.id);
    if (classes) for (const dc of classes) acc.add(dc);
  }
  return acc;
};

export function computeMedGroupBuckets(
  tabId: string,
  categories: readonly DrugCategory[],
  relevance: Relevance | null,
  otrosTabId: string,
): MedGroupBuckets {
  if (tabId === otrosTabId) {
    const surfacingClasses = medTabRelevantClasses(categories, relevance);
    const drugs = categories.flatMap(cat =>
      cat.groups
        .filter(g => g.drugs.length === 1 && !surfacesByRelevance(g, surfacingClasses))
        .flatMap(g => g.drugs),
    );
    if (drugs.length === 0) return { ownAll: [], foreignRelevant: [] };
    return {
      ownAll: [{
        id: otrosTabId,
        label: 'Otros medicamentos',
        drugs: drugs.slice().sort((a, b) => ES_COLLATOR.compare(a, b)),
      }],
      foreignRelevant: [],
    };
  }

  const relevantClasses = relevance?.classesByTab.get(tabId) ?? new Set<string>();
  const cat = categories.find(c => c.id === tabId);
  const ownAll = (cat ? cat.groups.filter(g => g.drugs.length > 1 || surfacesByRelevance(g, relevantClasses)) : [])
    .slice()
    .sort((a, b) => ES_COLLATOR.compare(a.label, b.label));

  const ownClasses = new Set(ownAll.map(g => g.drugClass).filter((dc): dc is string => !!dc));
  const seenForeign = new Set<string>();
  const foreignRelevant: MedForeignGroup[] = [];

  for (const c of categories) {
    if (c.id === tabId) continue;
    for (const g of c.groups) {
      if (!g.drugClass) continue;
      if (!relevantClasses.has(g.drugClass)) continue;
      if (ownClasses.has(g.drugClass)) continue;
      if (seenForeign.has(g.drugClass)) continue;
      seenForeign.add(g.drugClass);
      foreignRelevant.push({ ...g, originTabId: c.id, originTabLabel: c.label });
    }
  }
  foreignRelevant.sort((a, b) => ES_COLLATOR.compare(a.label, b.label));

  return { ownAll, foreignRelevant };
}

export function medGroupsVisibleInTab(
  tabId: string,
  categories: readonly DrugCategory[],
  relevance: Relevance | null,
  otrosTabId: string,
): readonly DrugGroup[] {
  const { ownAll, foreignRelevant } = computeMedGroupBuckets(tabId, categories, relevance, otrosTabId);
  return [...ownAll, ...foreignRelevant];
}

// ─── Diagnósticos ──────────────────────────────────────────────────────────────

export interface DxForeignGroup extends DiagnosisGroup {
  readonly originTabId: string;
  readonly originTabLabel: string;
}

export interface DxGroupBuckets {
  readonly ownGroups: readonly DiagnosisGroup[];
  readonly foreignRelevant: readonly DxForeignGroup[];
}

export function computeDxGroupBuckets(
  tab: DiagnosisTab,
  allTabs: readonly DiagnosisTab[],
  relevance: Relevance | null,
): DxGroupBuckets {
  if (tab.id === 'otros') return { ownGroups: tab.groups, foreignRelevant: [] };

  const ownDxCodes = new Set<string>();
  for (const g of tab.groups) {
    for (const dx of g.diagnoses) ownDxCodes.add(normalizeDiagnosis(dx));
  }

  const relevantDxs = relevance?.dxsByTab.get(tab.id) ?? new Set<string>();
  if (relevantDxs.size === 0) return { ownGroups: tab.groups, foreignRelevant: [] };

  const seen = new Set<string>(ownDxCodes);
  const foreignRelevant: DxForeignGroup[] = [];

  for (const t of allTabs) {
    if (t.id === tab.id) continue;
    const dxs: string[] = [];
    for (const g of t.groups) {
      for (const dx of g.diagnoses) {
        const code = normalizeDiagnosis(dx);
        if (!relevantDxs.has(code)) continue;
        if (seen.has(code)) continue;
        seen.add(code);
        dxs.push(dx);
      }
    }
    if (dxs.length === 0) continue;
    foreignRelevant.push({
      id: `foreign__${t.id}`,
      label: t.label,
      diagnoses: dxs.slice().sort((a, b) => ES_COLLATOR.compare(a, b)),
      originTabId: t.id,
      originTabLabel: t.label,
    });
  }
  return { ownGroups: tab.groups, foreignRelevant };
}

export function dxGroupsVisibleInTab(
  tab: DiagnosisTab,
  allTabs: readonly DiagnosisTab[],
  relevance: Relevance | null,
): readonly DiagnosisGroup[] {
  const { ownGroups, foreignRelevant } = computeDxGroupBuckets(tab, allTabs, relevance);
  return [...ownGroups, ...foreignRelevant];
}
