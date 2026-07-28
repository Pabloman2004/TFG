import { DrugGroup } from './data/medications-taxonomy';
import { Med } from './types';
import { medsVisibleInTabGroups } from './clinical-capture';

const med = (id: string, drugClasses: string[], extra: Partial<Med> = {}): Med => ({
  id,
  drugClasses,
  ...extra,
});

const cardioDigoxinaGroup: DrugGroup = {
  id: 'digoxina',
  label: 'Digoxina',
  drugs: ['Digoxina'],
  drugClass: 'DIGOXINA',
};

describe('medsVisibleInTabGroups', () => {
  it('incluye un medicamento seleccionado visible en el grupo del tab', () => {
    const meds = [med('Digoxina', ['DIGOXINA'])];
    expect(medsVisibleInTabGroups(meds, [cardioDigoxinaGroup]).map(m => m.id)).toEqual(['Digoxina']);
  });

  it('excluye medicamentos seleccionados que no están visibles en el tab activo', () => {
    const meds = [med('Prednisona', ['CORTICOIDE_SISTEMICO'])];
    expect(medsVisibleInTabGroups(meds, [cardioDigoxinaGroup])).toEqual([]);
  });
});
