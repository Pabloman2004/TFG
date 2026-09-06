import {
  detectNewlyAddedCriteria,
  remainingCollapsedSections,
  scrollTargetIds,
  scrollCriteriaIntoView,
  criterionSectionKey,
} from './new-criteria';

describe('detectNewlyAddedCriteria()', () => {
  const empty = new Set<string>();

  it('no resalta en la primera evaluación con catálogo listo (carga inicial / caso persistido)', () => {
    const result = detectNewlyAddedCriteria({
      previousIds: empty,
      currentIds: ['STOPP-B1-X', 'START-A1-Y'],
      primed: false,
      catalogReady: true,
      currentlyHighlighted: empty,
    });

    expect(result.highlightIds).toEqual([]);
    expect(result.shouldScroll).toBe(false);
    expect(result.primed).toBe(true);
    expect([...result.nextPrevious]).toEqual(['STOPP-B1-X', 'START-A1-Y']);
  });

  it('no marca como primed mientras el catálogo aún no está cargado', () => {
    const result = detectNewlyAddedCriteria({
      previousIds: empty,
      currentIds: [],
      primed: false,
      catalogReady: false,
      currentlyHighlighted: empty,
    });

    expect(result.primed).toBe(false);
    expect(result.highlightIds).toEqual([]);
  });

  it('resalta todos los criterios que aparecen a la vez, no solo el último', () => {
    const result = detectNewlyAddedCriteria({
      previousIds: new Set(['STOPP-B1-X']),
      currentIds: ['STOPP-B1-X', 'STOPP-B4-Y', 'START-A1-Z'],
      primed: true,
      catalogReady: true,
      currentlyHighlighted: new Set(['STOPP-B1-X']),
    });

    expect(result.highlightIds).toEqual(['STOPP-B4-Y', 'START-A1-Z']);
    expect(result.shouldScroll).toBe(true);
  });

  it('sustituye el lote anterior: solo el último añadido (o lote) queda resaltado', () => {
    const result = detectNewlyAddedCriteria({
      previousIds: new Set(['STOPP-B1-X', 'STOPP-B4-Y']),
      currentIds: ['STOPP-B1-X', 'STOPP-B4-Y', 'START-C1-Z'],
      primed: true,
      catalogReady: true,
      currentlyHighlighted: new Set(['STOPP-B1-X', 'STOPP-B4-Y']),
    });

    expect(result.highlightIds).toEqual(['START-C1-Z']);
  });

  it('al vaciar los criterios aplicables, limpia el resaltado', () => {
    const result = detectNewlyAddedCriteria({
      previousIds: new Set(['STOPP-B1-X']),
      currentIds: [],
      primed: true,
      catalogReady: true,
      currentlyHighlighted: new Set(['STOPP-B1-X']),
    });

    expect(result.highlightIds).toEqual([]);
    expect(result.shouldScroll).toBe(false);
  });

  it('si desaparece un criterio resaltado, lo retira y conserva los que siguen activos', () => {
    const result = detectNewlyAddedCriteria({
      previousIds: new Set(['STOPP-B1-X', 'STOPP-B4-Y', 'START-A1-Z']),
      currentIds: ['STOPP-B1-X', 'START-A1-Z'],
      primed: true,
      catalogReady: true,
      currentlyHighlighted: new Set(['STOPP-B4-Y', 'START-A1-Z']),
    });

    expect(result.highlightIds).toEqual(['START-A1-Z']);
    expect(result.shouldScroll).toBe(false);
  });

  it('sin criterios nuevos ni desaparecidos, mantiene el resaltado actual', () => {
    const result = detectNewlyAddedCriteria({
      previousIds: new Set(['STOPP-B1-X']),
      currentIds: ['STOPP-B1-X'],
      primed: true,
      catalogReady: true,
      currentlyHighlighted: new Set(['STOPP-B1-X']),
    });

    expect(result.highlightIds).toEqual(['STOPP-B1-X']);
    expect(result.shouldScroll).toBe(false);
  });
});

describe('criterionSectionKey()', () => {
  it('usa el mismo prefijo que las secciones colapsables de la plantilla', () => {
    expect(criterionSectionKey({ type: 'START', system: 'Sistema cardiovascular' }))
      .toBe('start:Sistema cardiovascular');
    expect(criterionSectionKey({ type: 'STOPP', system: 'Sistema renal' }))
      .toBe('stopp:Sistema renal');
  });
});

describe('remainingCollapsedSections()', () => {
  it('expande las secciones que contienen criterios recién añadidos', () => {
    const next = remainingCollapsedSections(
      ['start:Sistema cardiovascular', 'stopp:Sistema renal', 'stopp:Sistema nervioso'],
      [
        { type: 'STOPP', system: 'Sistema renal' },
        { type: 'START', system: 'Sistema cardiovascular' },
      ],
    );

    expect(next).toEqual(['stopp:Sistema nervioso']);
  });

  it('no toca secciones ajenas al lote nuevo', () => {
    const collapsed = ['stopp:Sistema renal'];
    expect(remainingCollapsedSections(collapsed, [{ type: 'START', system: 'Sistema cardiovascular' }]))
      .toEqual(collapsed);
  });
});

describe('scrollTargetIds()', () => {
  it('elige el último START y el último STOPP del lote para el autoscroll', () => {
    expect(scrollTargetIds([
      'START-A1-X',
      'STOPP-B1-Y',
      'START-A2-Z',
      'STOPP-B4-W',
    ])).toEqual(['START-A2-Z', 'STOPP-B4-W']);
  });

  it('solo START si el lote no trae STOPP', () => {
    expect(scrollTargetIds(['START-A1-X', 'START-A2-Z'])).toEqual(['START-A2-Z']);
  });

  it('devuelve vacío si no hay ids', () => {
    expect(scrollTargetIds([])).toEqual([]);
  });
});

describe('scrollCriteriaIntoView()', () => {
  it('hace scroll al último START y al último STOPP presentes en el DOM', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-crit-id="START-A1-X"></div>
      <div data-crit-id="START-A2-Z"></div>
      <div data-crit-id="STOPP-B1-Y"></div>
    `;
    const scrolled: string[] = [];
    root.querySelectorAll('[data-crit-id]').forEach(el => {
      (el as HTMLElement).scrollIntoView = () => {
        scrolled.push(el.getAttribute('data-crit-id') ?? '');
      };
    });

    scrollCriteriaIntoView(root, ['START-A1-X', 'STOPP-B1-Y', 'START-A2-Z']);

    expect(scrolled).toEqual(['START-A2-Z', 'STOPP-B1-Y']);
  });
});
