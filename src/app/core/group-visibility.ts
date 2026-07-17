// @linked docs/flujo-pasos.md
// Si cambias computeMedGroupBuckets, computeDxGroupBuckets o las interfaces de buckets, actualiza el doc enlazado.
// Funciones puras para calcular qué grupos son visibles en cada tab,
// compartidas por MedsStepComponent y DiagnosisStepComponent.
import { DrugGroup, DrugCategory } from './data/medications-taxonomy';
import { DiagnosisGroup, DiagnosisTab } from './data/diagnoses-taxonomy';
import { Relevance } from './data/system-relevance';
import { normalizeDiagnosis } from './data/diagnoses';
import { Med } from './types';

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

const normalizedClasses = (classes: ReadonlySet<string>): ReadonlySet<string> =>
  new Set([...classes].map(drugClass => drugClass.toUpperCase()));

const medicationClassesById = (
  medications: readonly Med[],
): ReadonlyMap<string, ReadonlySet<string>> =>
  new Map(medications.map(medication => [
    medication.id,
    new Set(medication.drugClasses.map(drugClass => drugClass.toUpperCase())),
  ]));

const drugSurfacesByRelevance = (
  drugId: string,
  group: DrugGroup,
  relevantClasses: ReadonlySet<string>,
  classesByDrug: ReadonlyMap<string, ReadonlySet<string>>,
): boolean => {
  const medicationClasses = classesByDrug.get(drugId);
  if (medicationClasses) {
    return [...medicationClasses].some(drugClass => relevantClasses.has(drugClass));
  }
  return !!group.drugClass && relevantClasses.has(group.drugClass.toUpperCase());
};

const relevantDrugs = (
  group: DrugGroup,
  relevantClasses: ReadonlySet<string>,
  classesByDrug: ReadonlyMap<string, ReadonlySet<string>>,
): readonly string[] =>
  group.drugs.filter(drugId =>
    drugSurfacesByRelevance(drugId, group, relevantClasses, classesByDrug)
  );

// Clases que afloran como grupo propio en algún tab de sistema por ser
// ESPECÍFICAMENTE relevantes ahí (no por relevancia transversal). Un unitario con
// una de estas clases sale de "Otros"; uno relevante solo por vía transversal no.
const medTabSpecificClasses = (
  categories: readonly DrugCategory[],
  relevance: Relevance | null,
): ReadonlySet<string> => {
  const acc = new Set<string>();
  for (const c of categories) {
    const classes = relevance?.specificClassesByTab.get(c.id);
    if (classes) for (const dc of classes) acc.add(dc);
  }
  return acc;
};

export function computeMedGroupBuckets(
  tabId: string,
  categories: readonly DrugCategory[],
  relevance: Relevance | null,
  otrosTabId: string,
  medications: readonly Med[] = [],
): MedGroupBuckets {
  const classesByDrug = medicationClassesById(medications);
  const globallySpecificClasses = normalizedClasses(
    medTabSpecificClasses(categories, relevance),
  );

  if (tabId === otrosTabId) {
    const drugs = [...new Set(categories.flatMap(cat =>
      cat.groups
        .filter(group =>
          group.drugs.length === 1 &&
          relevantDrugs(group, globallySpecificClasses, classesByDrug).length === 0
        )
        .flatMap(group => group.drugs),
    ))];
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

  // Grupos multi-fármaco usan la relevancia completa (transversal incluida);
  // los unitarios solo afloran por relevancia ESPECÍFICA del tab.
  const fullClasses = normalizedClasses(
    relevance?.classesByTab.get(tabId) ?? new Set<string>(),
  );
  const specificClasses = normalizedClasses(
    relevance?.specificClassesByTab.get(tabId) ?? new Set<string>(),
  );
  const cat = categories.find(c => c.id === tabId);
  const ownAll = (cat ? cat.groups.filter(group =>
    group.drugs.length > 1 ||
    relevantDrugs(group, globallySpecificClasses, classesByDrug).length > 0
  ) : [])
    .slice()
    .sort((a, b) => ES_COLLATOR.compare(a.label, b.label));

  const ownDrugIds = new Set(ownAll.flatMap(group => group.drugs));
  const seenForeignDrugIds = new Set<string>();
  const foreignRelevant: MedForeignGroup[] = [];

  const candidates = categories
    .filter(category => category.id !== tabId)
    .flatMap(category => category.groups.map(group => {
      const allowed = group.drugs.length > 1 ? fullClasses : specificClasses;
      return {
        category,
        group,
        allowed,
        direct: !!group.drugClass && allowed.has(group.drugClass.toUpperCase()),
      };
    }));
  const prioritizedCandidates = [
    ...candidates.filter(candidate => candidate.direct),
    ...candidates.filter(candidate => !candidate.direct),
  ];

  for (const { category, group, allowed } of prioritizedCandidates) {
    const drugs = relevantDrugs(group, allowed, classesByDrug)
      .filter(drugId => !ownDrugIds.has(drugId))
      .filter(drugId => !seenForeignDrugIds.has(drugId));
    if (drugs.length === 0) continue;
    drugs.forEach(drugId => seenForeignDrugIds.add(drugId));
    foreignRelevant.push({
      ...group,
      drugs,
      originTabId: category.id,
      originTabLabel: category.label,
    });
  }
  foreignRelevant.sort((a, b) => ES_COLLATOR.compare(a.label, b.label));

  return { ownAll, foreignRelevant };
}

export function medGroupsVisibleInTab(
  tabId: string,
  categories: readonly DrugCategory[],
  relevance: Relevance | null,
  otrosTabId: string,
  medications: readonly Med[] = [],
): readonly DrugGroup[] {
  const { ownAll, foreignRelevant } = computeMedGroupBuckets(
    tabId,
    categories,
    relevance,
    otrosTabId,
    medications,
  );
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

  const relevantDxs = relevance?.specificDxsByTab.get(tab.id) ?? new Set<string>();
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
