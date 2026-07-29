// @linked docs/flujo-pasos.md
// Si cambias foreignDrugCriterionIds, relatedOwnGroupIds o la cascada de resaltado, actualiza el doc enlazado.
import {
  DRUG_CATEGORIES,
  DrugCategory,
  DrugGroup,
  drugClassLabel,
} from './data/medications-taxonomy';
import { DIAGNOSIS_TABS } from './data/diagnoses-taxonomy';
import { Relevance } from './data/system-relevance';
import { Crit, Med } from './types';
import { critCode } from './criteria-groups';
import { DIAGNOSIS_MAP, slug } from './data/diagnoses';

const ES_COLLATOR = new Intl.Collator('es', { sensitivity: 'base' });

const dxCode = (label: string): string => DIAGNOSIS_MAP[label] ?? slug(label);

// ─── Ubicación de un requisito ────────────────────────────────────────────────
// La mayoría de los requisitos pendientes de un criterio no viven en la pantalla
// desde la que se marcó la casilla foránea: 116 de las 135 casillas foráneas de
// diagnóstico exigen algo del otro paso o de otra pestaña. Sin esta anotación el
// aviso nombra algo que el usuario no puede ver ni sabe dónde buscar.

export type RequirementStep = 1 | 2;

export interface RequirementLocation {
  readonly step: RequirementStep;
  /** Las pestañas de medicación y de diagnóstico comparten nombre («Cardiovascular»
   *  existe en los dos pasos); sin esto el aviso es ambiguo. */
  readonly kind: 'medicamento' | 'diagnóstico';
  readonly tabId: string;
  readonly tabLabel: string;
}

const groupLocations = (
  entries: readonly (readonly [string, RequirementLocation])[],
): ReadonlyMap<string, readonly RequirementLocation[]> => {
  const acc = new Map<string, RequirementLocation[]>();
  for (const [key, location] of entries) {
    const list = acc.get(key);
    if (!list) acc.set(key, [location]);
    else if (!list.some(l => l.tabId === location.tabId)) list.push(location);
  }
  return acc;
};

// Una misma clase puede vivir en varias pestañas (los corticoides sistémicos
// están en Endocrino y en Respiratorio); nombrarlas todas evita mandar al
// usuario a la pestaña equivocada.
const CLASS_LOCATIONS = groupLocations(
  DRUG_CATEGORIES.flatMap(cat =>
    cat.groups
      .filter((g): g is DrugGroup & { drugClass: string } => !!g.drugClass)
      .map(g => [
        g.drugClass.toUpperCase(),
        { step: 1 as const, kind: 'medicamento' as const, tabId: cat.id, tabLabel: cat.label },
      ] as const),
  ),
);

const DX_LOCATIONS = groupLocations(
  DIAGNOSIS_TABS.flatMap(tab =>
    tab.groups.flatMap(group =>
      group.diagnoses.map(dx => [
        dxCode(dx),
        { step: 2 as const, kind: 'diagnóstico' as const, tabId: tab.id, tabLabel: tab.label },
      ] as const),
    ),
  ),
);

const MAX_LOCATIONS = 2;

/**
 * Requisito pendiente ya en texto legible. `visibleHere` señala que el requisito
 * vive en la pantalla desde la que se marcó la casilla, así que el resaltado y el
 * chip ya lo están indicando. No es lo mismo que «sin anotar»: un requisito de
 * ubicación desconocida también sale sin paréntesis, pero al usuario no le consta
 * en ningún sitio, y ahí el aviso sigue siendo la única pista.
 */
interface RequirementDetail {
  readonly label: string;
  readonly visibleHere: boolean;
}

/** Añade «(paso N · Pestaña)» salvo que el requisito ya esté donde el usuario está. */
const annotate = (
  label: string,
  locations: readonly RequirementLocation[] | undefined,
  current: { readonly step: RequirementStep; readonly tabId: string },
): RequirementDetail => {
  if (!locations || locations.length === 0) return { label, visibleHere: false };
  if (locations.some(l => l.step === current.step && l.tabId === current.tabId)) {
    return { label, visibleHere: true };
  }
  const shown = locations.slice(0, MAX_LOCATIONS).map(l => l.tabLabel).join(' o ');
  const rest = locations.length - MAX_LOCATIONS;
  const suffix = rest > 0 ? ` (+${rest})` : '';
  const { kind, step } = locations[0];
  return { label: `${label} (${kind} · paso ${step} · ${shown}${suffix})`, visibleHere: false };
};

const medicationClasses = (
  drugId: string,
  medications: readonly Med[],
): readonly string[] => {
  const med = medications.find(m => m.id === drugId);
  return med ? med.drugClasses.map(c => c.toUpperCase()) : [];
};

/**
 * Referencias del criterio que siguen faltando para que se dispare, excluyendo
 * las que ya están satisfechas por una ALTERNATIVA marcada (otra rama del mismo
 * `or`): si el criterio pide «osteopenia o no sale de casa» y el usuario marcó
 * la segunda, la primera no es un requisito pendiente.
 */
const stillMissing = (
  required: ReadonlySet<string> | undefined,
  selected: ReadonlySet<string>,
  alternatives: ReadonlyMap<string, ReadonlySet<string>> | undefined,
): readonly string[] => {
  if (!required) return [];
  return [...required].filter(ref => {
    if (selected.has(ref)) return false;
    const alts = alternatives?.get(ref);
    if (alts && [...alts].some(alt => selected.has(alt))) return false;
    return true;
  });
};

export const foreignDrugCriterionIds = (opts: {
  readonly drugId: string;
  readonly tabId: string;
  readonly relevance: Relevance | null;
  readonly medications: readonly Med[];
}): readonly string[] => {
  const { drugId, tabId, relevance, medications } = opts;
  if (!relevance) return [];
  const byClass = relevance.specificClassCriteriaByTab.get(tabId);
  if (!byClass) return [];
  const ids = new Set<string>();
  for (const drugClass of medicationClasses(drugId, medications)) {
    const critIds = byClass.get(drugClass);
    if (critIds) critIds.forEach(id => ids.add(id));
  }
  return [...ids].sort((a, b) => ES_COLLATOR.compare(a, b));
};

export const relatedOwnGroupIds = (opts: {
  readonly drugId: string;
  readonly tabId: string;
  readonly relevance: Relevance | null;
  readonly categories: readonly DrugCategory[];
  readonly medications: readonly Med[];
  readonly ownGroups: readonly DrugGroup[];
}): readonly string[] => {
  const { drugId, tabId, relevance, medications, ownGroups } = opts;
  const criterionIds = foreignDrugCriterionIds({ drugId, tabId, relevance, medications });
  if (!relevance || criterionIds.length === 0) return [];

  const foreignClasses = new Set(medicationClasses(drugId, medications));
  const partnerClasses = new Set<string>();
  for (const criterionId of criterionIds) {
    const classes = relevance.classesByCriterion.get(criterionId);
    if (!classes) continue;
    const alternatives = relevance.classAlternativesByCriterion.get(criterionId);
    // Alternativas de las clases del fármaco foráneo: están en otra rama del
    // mismo `or`, así que marcarlas no acerca el criterio a dispararse.
    const excluded = new Set(foreignClasses);
    for (const own of foreignClasses) {
      alternatives?.get(own)?.forEach(alt => excluded.add(alt.toUpperCase()));
    }
    for (const cls of classes) {
      if (!excluded.has(cls.toUpperCase())) partnerClasses.add(cls.toUpperCase());
    }
  }
  if (partnerClasses.size === 0) return [];

  return ownGroups
    .filter(group => {
      if (group.drugClass && partnerClasses.has(group.drugClass.toUpperCase())) return true;
      return group.drugs.some(id =>
        medicationClasses(id, medications).some(cls => partnerClasses.has(cls)),
      );
    })
    .map(group => group.id);
};

/**
 * Enlaces persistentes fármaco foráneo → grupos propios del tab, para todos los
 * fármacos foráneos actualmente seleccionados. Permite que la UI muestre que dos
 * casillas distintas de «Relevantes de otros sistemas» apuntan al mismo grupo.
 * Devuelve groupId → nombres de fármaco ordenados.
 */
export const foreignLinksByOwnGroup = (opts: {
  readonly selectedDrugIds: readonly string[];
  readonly tabId: string;
  readonly relevance: Relevance | null;
  readonly categories: readonly DrugCategory[];
  readonly medications: readonly Med[];
  readonly ownGroups: readonly DrugGroup[];
  readonly foreignGroups: readonly DrugGroup[];
}): ReadonlyMap<string, readonly string[]> => {
  const foreignDrugIds = new Set(opts.foreignGroups.flatMap(g => g.drugs));
  const result = new Map<string, string[]>();
  for (const drugId of opts.selectedDrugIds) {
    if (!foreignDrugIds.has(drugId)) continue;
    for (const groupId of relatedOwnGroupIds({ ...opts, drugId })) {
      const drugs = result.get(groupId);
      if (drugs) drugs.push(drugId);
      else result.set(groupId, [drugId]);
    }
  }
  for (const drugs of result.values()) {
    drugs.sort((a, b) => ES_COLLATOR.compare(a, b));
  }
  return result;
};

/**
 * Agrupa las referencias pendientes en racimos de alternativas mutuas, para que
 * el aviso diga «Insuficiencia cardíaca o 4 variantes» en vez de enumerar las
 * cinco: al usuario le basta con marcar una cualquiera del racimo.
 */
const clusterAlternatives = (
  refs: readonly string[],
  alternatives: ReadonlyMap<string, ReadonlySet<string>> | undefined,
): readonly (readonly string[])[] => {
  const remaining = new Set(refs);
  const clusters: string[][] = [];
  while (remaining.size > 0) {
    const [seed] = remaining;
    remaining.delete(seed);
    const cluster = [seed];
    const alts = alternatives?.get(seed);
    if (alts) {
      for (const other of [...remaining]) {
        if (alts.has(other)) {
          cluster.push(other);
          remaining.delete(other);
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters;
};

const renderCluster = (labels: readonly string[]): string => {
  const sorted = labels.slice().sort((a, b) => ES_COLLATOR.compare(a, b));
  if (sorted.length === 1) return sorted[0];
  if (sorted.length === 2) return `${sorted[0]} o ${sorted[1]}`;
  return `${sorted[0]} u otras ${sorted.length - 1} variantes`;
};

const MAX_CLUSTERS = 3;

interface MissingRequirementsOpts {
  readonly criterionId: string;
  readonly relevance: Relevance | null;
  readonly selectedDiagnoses: readonly string[];
  readonly selectedMedications: readonly Med[];
  readonly dxLabelsByCode: ReadonlyMap<string, string>;
  readonly currentStep?: RequirementStep;
  readonly currentTabId?: string;
}

/**
 * Requisitos pendientes del criterio, ya en texto legible: diagnósticos que
 * faltan por marcar y clases de fármaco que faltan por seleccionar. Las
 * alternativas de un mismo `or` se colapsan en una sola entrada.
 */
const missingRequirementDetails = (
  opts: MissingRequirementsOpts,
): readonly RequirementDetail[] => {
  const { criterionId, relevance } = opts;
  if (!relevance) return [];

  const current = { step: opts.currentStep ?? 1, tabId: opts.currentTabId ?? '' };
  const selectedDx = new Set(opts.selectedDiagnoses.map(dxCode));
  const selectedClasses = new Set(
    opts.selectedMedications.flatMap(m => m.drugClasses.map(c => c.toUpperCase())),
  );

  const dxAlternatives = relevance.dxAlternativesByCriterion.get(criterionId);
  const dxs = clusterAlternatives(
    stillMissing(relevance.dxsByCriterion.get(criterionId), selectedDx, dxAlternatives),
    dxAlternatives,
  ).map(cluster =>
    annotate(
      renderCluster(cluster.map(code => opts.dxLabelsByCode.get(code) ?? code.replace(/_/g, ' '))),
      DX_LOCATIONS.get(cluster[0]),
      current,
    ),
  );

  const classAlternatives = relevance.classAlternativesByCriterion.get(criterionId);
  const classes = clusterAlternatives(
    stillMissing(
      relevance.requiredClassesByCriterion.get(criterionId),
      selectedClasses,
      classAlternatives,
    ),
    classAlternatives,
  ).map(cluster =>
    annotate(
      renderCluster(cluster.map(drugClassLabel)),
      CLASS_LOCATIONS.get(cluster[0].toUpperCase()),
      current,
    ),
  );

  return [...dxs, ...classes].sort((a, b) => ES_COLLATOR.compare(a.label, b.label));
};

export const missingRequirements = (
  opts: MissingRequirementsOpts,
): readonly string[] => missingRequirementDetails(opts).map(r => r.label);

/**
 * Un START se modela como «cumple la indicación Y NO toma ya el fármaco», así que
 * la clase recomendada aparece únicamente negada. Si el usuario acaba de marcar
 * ese fármaco, el criterio ya no puede dispararse: pedirle los diagnósticos que
 * faltan sería mandarle a marcar cosas que no van a encender nada. Devuelve la
 * etiqueta de la clase que lo cubre, o null si no es el caso.
 */
const startAlreadyCovered = (opts: {
  readonly criterionId: string;
  readonly relevance: Relevance | null;
  readonly selectedMedications: readonly Med[];
  readonly criteriaById: ReadonlyMap<string, Crit>;
}): string | null => {
  const { criterionId, relevance } = opts;
  if (!relevance || opts.criteriaById.get(criterionId)?.type !== 'START') return null;
  const all = relevance.classesByCriterion.get(criterionId);
  if (!all) return null;
  const required = relevance.requiredClassesByCriterion.get(criterionId) ?? new Set<string>();
  const selected = new Set(
    opts.selectedMedications.flatMap(m => m.drugClasses.map(c => c.toUpperCase())),
  );
  for (const cls of all) {
    const upper = cls.toUpperCase();
    if (!required.has(cls) && selected.has(upper)) return drugClassLabel(upper);
  }
  return null;
};

/** Longitud máxima de la descripción del criterio dentro del aviso. */
const MAX_RECOMMENDATION = 70;

/**
 * Descripción corta de lo que recomienda un START, sacada de su `summary`. Los 52
 * empiezan por «Considerar …», así que la primera frase sin ese prefijo es ya una
 * descripción legible («iniciar estatina», «hierro intravenoso»). Se recorta por
 * palabra para las pocas que se alargan.
 */
const startRecommendation = (summary: string): string => {
  const firstSentence = summary.split(/\.\s/)[0].replace(/\.$/, '');
  const stripped = firstSentence.replace(/^Considerar\s+/i, '');
  if (stripped.length <= MAX_RECOMMENDATION) return stripped;
  const cut = stripped.slice(0, MAX_RECOMMENDATION);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
};

interface SnackEntry {
  readonly criterionId: string;
  readonly missing: readonly RequirementDetail[];
  readonly coveredBy: string | null;
}

/** Ordena de más accionable a menos; lo ya cubierto queda siempre al final. */
const rank = (entry: SnackEntry): number =>
  entry.coveredBy ? Number.MAX_SAFE_INTEGER : entry.missing.length;

/** Máximo de criterios detallados en un mismo aviso. */
const MAX_CRITERIA = 3;

const joinEs = (parts: readonly string[]): string =>
  parts.length <= 1
    ? parts.join('')
    : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`;

/**
 * Aviso para una casilla foránea. Un mismo fármaco o diagnóstico puede estar
 * implicado en VARIOS criterios (p. ej. «Prostatismo» toca STOPP-D1 y STOPP-D4);
 * el aviso los nombra todos y detalla los requisitos pendientes de cada uno, una
 * línea por criterio, ordenados del más cercano a dispararse al más lejano.
 */
const buildSnackMessage = (opts: {
  readonly criterionIds: readonly string[];
  readonly relevance: Relevance | null;
  readonly selectedDiagnoses: readonly string[];
  readonly selectedMedications: readonly Med[];
  readonly criteriaById: ReadonlyMap<string, Crit>;
  readonly dxLabelsByCode: ReadonlyMap<string, string>;
  readonly currentStep?: RequirementStep;
  readonly currentTabId?: string;
}): string | null => {
  const known = opts.criterionIds.filter(id => opts.criteriaById.has(id));
  if (known.length === 0) return null;

  // `critCode` solo devuelve «B2»; sin el tipo, STOPP B2 y START B2 se confunden.
  const label = (id: string): string =>
    `${opts.criteriaById.get(id)?.type ?? ''} ${critCode(id)}`.trim();

  // Varios criterios distintos pueden compartir código corto (STOPP-B14 tiene dos
  // variantes). Se agrupan por código y se conserva la vía más corta de cada uno,
  // para no repetir «STOPP B14 y STOPP B14» ni dar dos rutas para el mismo aviso.
  const byLabel = new Map<string, SnackEntry>();
  for (const criterionId of known) {
    const coveredBy = startAlreadyCovered({ ...opts, criterionId });
    const missing = coveredBy ? [] : missingRequirementDetails({ ...opts, criterionId });
    if (!coveredBy && missing.length === 0) continue;
    const key = label(criterionId);
    const previous = byLabel.get(key);
    // Un criterio ya cubierto es un callejón sin salida: si otra variante del
    // mismo código sigue siendo accionable, se prefiere aquélla.
    if (!previous || rank(previous) > rank({ criterionId, missing, coveredBy })) {
      byLabel.set(key, { criterionId, missing, coveredBy });
    }
  }
  // Lo accionable primero; lo ya cubierto es informativo y va al final.
  const scored = [...byLabel.values()].sort((a, b) => rank(a) - rank(b));

  if (scored.length === 0) {
    return `Relacionado con ${joinEs([...new Set(known.map(label))])}`;
  }

  // Si todo lo que falta vive en esta misma pantalla, el resaltado del grupo y el
  // chip de enlace ya lo están señalando: el aviso solo repetiría en texto lo que
  // el usuario tiene delante. Se evalúa sobre `scored`, ya deduplicado por código,
  // porque es la vía más corta de cada criterio la que acaba mostrándose. Un
  // criterio ya cubierto sí se anuncia: esa información no está en pantalla.
  const soloVisible = scored.every(entry =>
    !entry.coveredBy && entry.missing.every(requirement => requirement.visibleHere));
  if (soloVisible) return null;

  const shown = scored.slice(0, MAX_CRITERIA);
  const omitted = scored.length - shown.length;
  const heading = `Relacionado con ${joinEs(shown.map(e => label(e.criterionId)))}` +
    (omitted > 0 ? ` y ${omitted} criterio${omitted > 1 ? 's' : ''} más` : '');

  const renderMissing = (missing: readonly RequirementDetail[]): string => {
    const list = missing.slice(0, MAX_CLUSTERS).map(r => r.label).join('; ');
    const rest = missing.length - MAX_CLUSTERS;
    return rest > 0 ? `${list} y ${rest} requisito${rest > 1 ? 's' : ''} más` : list;
  };

  // Un START cubierto no está pendiente de nada: el fármaco recién marcado ES lo
  // que recomendaba. Se explica qué recomendaba y por qué ya no puede saltar, en
  // vez de listar requisitos que no encenderían nada.
  const detail = (entry: SnackEntry): string => {
    if (!entry.coveredBy) return `requiere: ${renderMissing(entry.missing)}`;
    const summary = opts.criteriaById.get(entry.criterionId)?.summary ?? '';
    const what = startRecommendation(summary);
    return `recomienda ${what}; ya no puede saltar porque el paciente toma ${entry.coveredBy}`;
  };

  if (shown.length === 1) {
    return `${heading} — ${detail(shown[0])}`;
  }
  const lines = shown.map(e => `— ${label(e.criterionId)} ${detail(e)}`);
  return [heading, ...lines].join('\n');
};

export type ForeignHighlightResult = {
  readonly groupIds: readonly string[];
  readonly criterionIds: readonly string[];
  readonly snackMessage: string | null;
};

/**
 * Cascada de resaltado al marcar un fármaco de «Relevantes de otros sistemas».
 * Es ADITIVA: resalta siempre lo que puede (grupos co-partícipes del tab y la
 * tarjeta del criterio ya disparado) y, si ningún criterio se ha disparado
 * todavía, añade un aviso con lo que falta por rellenar. Así ninguna casilla
 * queda muda ni deja al usuario sin saber por qué no salta nada.
 */
export const resolveForeignHighlight = (opts: {
  readonly drugId: string;
  readonly tabId: string;
  readonly relevance: Relevance | null;
  readonly categories: readonly DrugCategory[];
  readonly medications: readonly Med[];
  readonly ownGroups: readonly DrugGroup[];
  readonly applicableCriterionIds: ReadonlySet<string>;
  readonly selectedDiagnoses: readonly string[];
  readonly selectedMedications: readonly Med[];
  readonly criteriaById: ReadonlyMap<string, Crit>;
  readonly dxLabelsByCode: ReadonlyMap<string, string>;
}): ForeignHighlightResult => {
  const criterionIds = foreignDrugCriterionIds(opts);
  const groupIds = relatedOwnGroupIds(opts);
  const fired = criterionIds.filter(id => opts.applicableCriterionIds.has(id));
  // El fármaco recién marcado cuenta como seleccionado aunque el store todavía
  // no se haya propagado: nunca debe aparecer en la lista de «requiere».
  const justMarked = opts.medications.find(m => m.id === opts.drugId);
  const selectedMedications = justMarked && !opts.selectedMedications.some(m => m.id === opts.drugId)
    ? [...opts.selectedMedications, justMarked]
    : opts.selectedMedications;

  return {
    groupIds,
    criterionIds: fired,
    snackMessage: fired.length > 0
      ? null
      : buildSnackMessage({
          ...opts,
          criterionIds,
          selectedMedications,
          currentStep: 1,
          currentTabId: opts.tabId,
        }),
  };
};

export const foreignDxCriterionIds = (opts: {
  readonly dxLabel: string;
  readonly tabId: string;
  readonly relevance: Relevance | null;
}): readonly string[] => {
  const { dxLabel, tabId, relevance } = opts;
  if (!relevance) return [];
  const byDx = relevance.specificDxCriteriaByTab.get(tabId);
  if (!byDx) return [];
  const ids = byDx.get(dxCode(dxLabel));
  return ids ? [...ids].sort((a, b) => ES_COLLATOR.compare(a, b)) : [];
};

export const relatedOwnDxLabels = (opts: {
  readonly dxLabel: string;
  readonly tabId: string;
  readonly relevance: Relevance | null;
  readonly ownGroups: readonly { readonly diagnoses: readonly string[] }[];
}): readonly string[] => {
  const { dxLabel, tabId, relevance, ownGroups } = opts;
  const criterionIds = foreignDxCriterionIds({ dxLabel, tabId, relevance });
  if (!relevance || criterionIds.length === 0) return [];

  const selectedCode = dxCode(dxLabel);
  const partnerCodes = new Set<string>();
  for (const criterionId of criterionIds) {
    const dxs = relevance.dxsByCriterion.get(criterionId);
    if (!dxs) continue;
    // Los diagnósticos de otra rama del mismo `or` son alternativas del que se
    // acaba de marcar, no co-requisitos: marcarlos no dispara nada más.
    const alternatives = relevance.dxAlternativesByCriterion.get(criterionId)?.get(selectedCode);
    for (const dx of dxs) {
      if (dx === selectedCode) continue;
      if (alternatives?.has(dx)) continue;
      partnerCodes.add(dx);
    }
  }
  if (partnerCodes.size === 0) return [];

  const labels: string[] = [];
  for (const group of ownGroups) {
    for (const label of group.diagnoses) {
      if (partnerCodes.has(dxCode(label))) labels.push(label);
    }
  }
  return [...new Set(labels)].sort((a, b) => ES_COLLATOR.compare(a, b));
};

/**
 * Enlaces persistentes diagnóstico foráneo → diagnósticos propios del tab, para
 * todos los diagnósticos foráneos seleccionados. Equivalente de
 * `foreignLinksByOwnGroup` en el paso de diagnósticos.
 */
export const foreignLinksByOwnDx = (opts: {
  readonly selectedDxLabels: readonly string[];
  readonly tabId: string;
  readonly relevance: Relevance | null;
  readonly ownGroups: readonly { readonly diagnoses: readonly string[] }[];
  readonly foreignGroups: readonly { readonly diagnoses: readonly string[] }[];
}): ReadonlyMap<string, readonly string[]> => {
  const foreignCodes = new Set(
    opts.foreignGroups.flatMap(g => g.diagnoses.map(dxCode)),
  );
  const result = new Map<string, string[]>();
  for (const dxLabel of opts.selectedDxLabels) {
    if (!foreignCodes.has(dxCode(dxLabel))) continue;
    for (const ownLabel of relatedOwnDxLabels({ ...opts, dxLabel })) {
      const sources = result.get(ownLabel);
      if (sources) sources.push(dxLabel);
      else result.set(ownLabel, [dxLabel]);
    }
  }
  for (const sources of result.values()) {
    sources.sort((a, b) => ES_COLLATOR.compare(a, b));
  }
  return result;
};

/**
 * Elemento de la pestaña actual sobre el que se quiere saber si algo ya marcado
 * lo está esperando. `key` es lo que devuelve el mapa (id de grupo o etiqueta de
 * diagnóstico); se indica por clases o por códigos de diagnóstico según el caso.
 */
export interface LinkTarget {
  readonly key: string;
  readonly drugClasses?: readonly string[];
  readonly dxCodes?: readonly string[];
}

interface SelectionRefs {
  readonly name: string;
  readonly classes: ReadonlySet<string>;
  readonly dxs: ReadonlySet<string>;
}

const criteriaTouching = (
  refs: SelectionRefs,
  relevance: Relevance,
): ReadonlySet<string> => {
  const ids = new Set<string>();
  for (const cls of refs.classes) {
    relevance.criteriaByRequiredClass.get(cls)?.forEach(id => ids.add(id));
  }
  for (const dx of refs.dxs) {
    relevance.criteriaByDx.get(dx)?.forEach(id => ids.add(id));
  }
  return ids;
};

/**
 * Para cada elemento de la pestaña actual, qué elementos **ya marcados** (de
 * cualquier paso o pestaña) lo necesitan para que un criterio se dispare.
 *
 * Es el enlace en sentido inverso al de `foreignLinksByOwnGroup`: permite que,
 * al llegar al destino que indicaba el aviso, se vea qué está esperando allí.
 * Solo cuenta **co-requisitos**: una alternativa del mismo `or` no enlaza,
 * porque marcarla no acercaría el criterio a dispararse.
 */
export const relatedSelectionLinks = (opts: {
  readonly relevance: Relevance | null;
  readonly selectedMedications: readonly Med[];
  readonly selectedDiagnoses: readonly string[];
  readonly targets: readonly LinkTarget[];
}): ReadonlyMap<string, readonly string[]> => {
  const { relevance } = opts;
  const result = new Map<string, string[]>();
  if (!relevance) return result;

  const selections: SelectionRefs[] = [
    ...opts.selectedMedications.map(m => ({
      name: m.id,
      classes: new Set(m.drugClasses.map(c => c.toUpperCase())),
      dxs: new Set<string>(),
    })),
    ...opts.selectedDiagnoses.map(label => ({
      name: label,
      classes: new Set<string>(),
      dxs: new Set([dxCode(label)]),
    })),
  ];

  for (const target of opts.targets) {
    const targetClasses = new Set((target.drugClasses ?? []).map(c => c.toUpperCase()));
    const targetDxs = new Set(target.dxCodes ?? []);
    if (targetClasses.size === 0 && targetDxs.size === 0) continue;

    const linked: string[] = [];
    for (const selection of selections) {
      // Un elemento ya marcado no se enlaza consigo mismo.
      if ([...targetClasses].some(c => selection.classes.has(c))) continue;
      if ([...targetDxs].some(d => selection.dxs.has(d))) continue;

      const touches = [...criteriaTouching(selection, relevance)].some(criterionId => {
        const classAlts = relevance.classAlternativesByCriterion.get(criterionId);
        const dxAlts = relevance.dxAlternativesByCriterion.get(criterionId);
        const isAlternative = (ref: string, own: ReadonlySet<string>,
          alts: ReadonlyMap<string, ReadonlySet<string>> | undefined): boolean =>
          [...own].some(o => alts?.get(o)?.has(ref));

        const needsClass = [...(relevance.requiredClassesByCriterion.get(criterionId) ?? [])]
          .some(cls => targetClasses.has(cls.toUpperCase()) &&
            !isAlternative(cls, selection.classes, classAlts));
        const needsDx = [...(relevance.dxsByCriterion.get(criterionId) ?? [])]
          .some(dx => targetDxs.has(dx) && !isAlternative(dx, selection.dxs, dxAlts));
        return needsClass || needsDx;
      });
      if (touches) linked.push(selection.name);
    }
    if (linked.length > 0) {
      result.set(target.key, linked.sort((a, b) => ES_COLLATOR.compare(a, b)));
    }
  }
  return result;
};

/** Une dos mapas de enlaces sin duplicar nombres, manteniendo el orden alfabético. */
export const mergeLinkMaps = (
  ...maps: readonly ReadonlyMap<string, readonly string[]>[]
): ReadonlyMap<string, readonly string[]> => {
  const merged = new Map<string, Set<string>>();
  for (const map of maps) {
    for (const [key, names] of map) {
      const acc = merged.get(key);
      if (acc) names.forEach(n => acc.add(n));
      else merged.set(key, new Set(names));
    }
  }
  return new Map(
    [...merged].map(([key, names]) => [
      key,
      [...names].sort((a, b) => ES_COLLATOR.compare(a, b)),
    ]),
  );
};

export type ForeignDxHighlightResult = {
  readonly dxLabels: readonly string[];
  readonly criterionIds: readonly string[];
  readonly snackMessage: string | null;
};

export const resolveForeignDxHighlight = (opts: {
  readonly dxLabel: string;
  readonly tabId: string;
  readonly relevance: Relevance | null;
  readonly ownGroups: readonly { readonly diagnoses: readonly string[] }[];
  readonly applicableCriterionIds: ReadonlySet<string>;
  readonly selectedMedications: readonly Med[];
  readonly selectedDiagnoses: readonly string[];
  readonly criteriaById: ReadonlyMap<string, Crit>;
  readonly dxLabelsByCode: ReadonlyMap<string, string>;
}): ForeignDxHighlightResult => {
  const criterionIds = foreignDxCriterionIds(opts);
  const dxLabels = relatedOwnDxLabels(opts);
  const fired = criterionIds.filter(id => opts.applicableCriterionIds.has(id));
  const selectedDiagnoses = opts.selectedDiagnoses.includes(opts.dxLabel)
    ? opts.selectedDiagnoses
    : [...opts.selectedDiagnoses, opts.dxLabel];

  return {
    dxLabels,
    criterionIds: fired,
    snackMessage: fired.length > 0
      ? null
      : buildSnackMessage({
          ...opts,
          criterionIds,
          selectedDiagnoses,
          currentStep: 2,
          currentTabId: opts.tabId,
        }),
  };
};
