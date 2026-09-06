// @linked docs/flujo-pasos.md
// Si cambias la detección del último lote de criterios o el autoscroll, actualiza el doc enlazado.
export type NewlyAddedDetection = {
  readonly highlightIds: readonly string[];
  readonly nextPrevious: ReadonlySet<string>;
  readonly primed: boolean;
  readonly shouldScroll: boolean;
};

export const detectNewlyAddedCriteria = (opts: {
  previousIds: ReadonlySet<string>;
  currentIds: readonly string[];
  primed: boolean;
  catalogReady: boolean;
  currentlyHighlighted: ReadonlySet<string>;
}): NewlyAddedDetection => {
  const nextPrevious = new Set(opts.currentIds);
  if (!opts.primed) {
    return {
      highlightIds: [],
      nextPrevious,
      primed: opts.catalogReady,
      shouldScroll: false,
    };
  }

  const newIds = opts.currentIds.filter(id => !opts.previousIds.has(id));
  if (newIds.length > 0) {
    return {
      highlightIds: newIds,
      nextPrevious,
      primed: true,
      shouldScroll: true,
    };
  }

  const stillHighlighted = opts.currentIds.filter(id => opts.currentlyHighlighted.has(id));
  return {
    highlightIds: stillHighlighted,
    nextPrevious,
    primed: true,
    shouldScroll: false,
  };
};

export const criterionSectionKey = (c: { type: string; system: string }): string =>
  `${c.type.toLowerCase()}:${c.system}`;

export const remainingCollapsedSections = (
  collapsed: readonly string[],
  newCriteria: readonly { type: string; system: string }[],
): string[] => {
  const toExpand = new Set(newCriteria.map(criterionSectionKey));
  return collapsed.filter(key => !toExpand.has(key));
};

export const scrollTargetIds = (ids: readonly string[]): readonly string[] => {
  const lastOf = (prefix: string): string | undefined => {
    for (let i = ids.length - 1; i >= 0; i--) {
      if (ids[i].startsWith(prefix)) return ids[i];
    }
    return undefined;
  };
  return [lastOf('START-'), lastOf('STOPP-')].filter((id): id is string => id !== undefined);
};

export const scrollCriteriaIntoView = (root: ParentNode, ids: readonly string[]): void => {
  for (const id of scrollTargetIds(ids)) {
    const el = root.querySelector(`[data-crit-id="${CSS.escape(id)}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
};
