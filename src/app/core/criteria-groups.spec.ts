import { groupBySystem, critCode } from './criteria-groups';
import { Crit } from './types';

const makeCrit = (system: string, id: string, type: 'STOPP' | 'START' = 'STOPP'): Crit => ({
  id, type, system, summary: `Resumen de ${id}`,
});

describe('groupBySystem()', () => {
  it('devuelve array vacío si no hay criterios', () => {
    expect(groupBySystem([])).toEqual([]);
  });

  it('crea un grupo por cada sistema distinto', () => {
    const crits = [
      makeCrit('Sistema cardiovascular', 'STOPP-B1-X'),
      makeCrit('Sistema renal',          'STOPP-H1-Y'),
    ];
    expect(groupBySystem(crits).length).toBe(2);
  });

  it('agrupa criterios del mismo sistema en un único grupo', () => {
    const crits = [
      makeCrit('Sistema cardiovascular', 'STOPP-B1-X'),
      makeCrit('Sistema cardiovascular', 'START-B2-Y', 'START'),
    ];
    const groups = groupBySystem(crits);
    expect(groups.length).toBe(1);
    expect(groups[0].items.length).toBe(2);
  });

  it('preserva el orden de aparición de los sistemas', () => {
    const crits = [
      makeCrit('Sistema renal',          'STOPP-H1-X'),
      makeCrit('Sistema cardiovascular', 'STOPP-B1-Y'),
    ];
    const groups = groupBySystem(crits);
    expect(groups[0].system).toBe('Sistema renal');
    expect(groups[1].system).toBe('Sistema cardiovascular');
  });

  it('preserva el orden de los criterios dentro de cada grupo', () => {
    const crits = [
      makeCrit('Sistema cardiovascular', 'STOPP-B1-X'),
      makeCrit('Sistema cardiovascular', 'STOPP-B4-Y'),
      makeCrit('Sistema cardiovascular', 'START-B2-Z', 'START'),
    ];
    const items = groupBySystem(crits)[0].items;
    expect(items.map(c => c.id)).toEqual(['STOPP-B1-X', 'STOPP-B4-Y', 'START-B2-Z']);
  });

  it('items.length de cada grupo refleja el número de criterios para mostrar el contador', () => {
    const crits = [
      makeCrit('Sistema cardiovascular', 'STOPP-B1-X'),
      makeCrit('Sistema cardiovascular', 'STOPP-B4-Y'),
      makeCrit('Sistema cardiovascular', 'STOPP-B5-Z'),
      makeCrit('Sistema renal',          'STOPP-H1-W'),
    ];
    const groups = groupBySystem(crits);
    const cardio = groups.find(g => g.system === 'Sistema cardiovascular');
    const renal  = groups.find(g => g.system === 'Sistema renal');
    expect(cardio?.items.length).toBe(3);
    expect(renal?.items.length).toBe(1);
  });

  it('al quitar un criterio del input, el contador del grupo decrementa', () => {
    const initial = [
      makeCrit('Sistema cardiovascular', 'STOPP-B1-X'),
      makeCrit('Sistema cardiovascular', 'STOPP-B4-Y'),
      makeCrit('Sistema cardiovascular', 'STOPP-B5-Z'),
    ];
    expect(groupBySystem(initial)[0].items.length).toBe(3);
    const reduced = initial.filter(c => c.id !== 'STOPP-B4-Y');
    expect(groupBySystem(reduced)[0].items.length).toBe(2);
  });

  it('no emite un grupo cuando ningún criterio pertenece a ese sistema (no se renderiza cabecera vacía)', () => {
    const crits = [makeCrit('Sistema cardiovascular', 'STOPP-B1-X')];
    const groups = groupBySystem(crits);
    expect(groups.some(g => g.system === 'Sistema renal')).toBe(false);
    expect(groups.length).toBe(1);
  });
});

describe('critCode()', () => {
  it('extrae el código de sección de un ID STOPP', () => {
    expect(critCode('STOPP-B1-DIGOXINA')).toBe('B1');
  });

  it('extrae el código de sección de un ID START', () => {
    expect(critCode('START-C3-LEVODOPA')).toBe('C3');
  });

  it('devuelve cadena vacía si el ID no tiene guiones', () => {
    expect(critCode('SINFORMATO')).toBe('');
  });
});
