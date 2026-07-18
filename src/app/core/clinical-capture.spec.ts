import { DrugGroup } from './data/medications-taxonomy';
import { Med } from './types';
import { clinicalCaptureFields, medsVisibleInTabGroups } from './clinical-capture';

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

const respSteroidGroup: DrugGroup = {
  id: 'corticoide_sist',
  label: 'Corticoides sistémicos',
  drugs: ['Prednisona'],
  drugClass: 'CORTICOIDE_SISTEMICO',
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

describe('clinicalCaptureFields', () => {
  it('expone dosis y duración de Digoxina', () => {
    const fields = clinicalCaptureFields([med('Digoxina', ['DIGOXINA'])]);
    expect(fields.map(f => f.field)).toEqual(['doseMcgDay', 'durationDays']);
  });

  it('expone duración de corticoide sistémico', () => {
    const fields = clinicalCaptureFields([med('Prednisona', ['CORTICOIDE_SISTEMICO'])]);
    expect(fields).toEqual([jasmine.objectContaining({
      medId: 'Prednisona',
      field: 'durationDays',
      label: 'Prednisona (días)',
    })]);
  });

  it('expone mg/día de paracetamol', () => {
    const fields = clinicalCaptureFields([med('Paracetamol', ['ANALGESICO_SIMPLE'])]);
    expect(fields[0]?.field).toBe('doseMgDay');
  });
});

describe('captura clínica por tab visible', () => {
  it('muestra campos de corticoide en Respiratorio cuando Prednisona está seleccionada ahí', () => {
    const selected = [med('Prednisona', ['CORTICOIDE_SISTEMICO'])];
    const visible = medsVisibleInTabGroups(selected, [respSteroidGroup]);
    const fields = clinicalCaptureFields(visible);
    expect(fields.some(f => f.field === 'durationDays' && f.medId === 'Prednisona')).toBeTrue();
  });

  it('no muestra campos de corticoide en Cardiovascular si Prednisona no es visible ahí', () => {
    const selected = [med('Prednisona', ['CORTICOIDE_SISTEMICO'])];
    const visible = medsVisibleInTabGroups(selected, [cardioDigoxinaGroup]);
    expect(clinicalCaptureFields(visible)).toEqual([]);
  });
});
