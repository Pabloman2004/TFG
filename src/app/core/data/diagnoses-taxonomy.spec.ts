import { DIAGNOSIS_TABS } from './diagnoses-taxonomy';

describe('DIAGNOSIS_TABS — agrupación clínica', () => {
  it('presenta Demencia y SCPD juntas en el sistema neurológico', () => {
    const neurological = DIAGNOSIS_TABS.find(tab => tab.id === 'neurologico');
    const dementia = neurological?.groups.find(group => group.id === 'demencia_y_scpd');

    expect(dementia?.diagnoses).toEqual([
      'Demencia',
      'Síntomas conductuales de la demencia',
    ]);
  });

  it('muestra los efectos extrapiramidales por neurolépticos en Neurológico', () => {
    const neurological = DIAGNOSIS_TABS.find(tab => tab.id === 'neurologico');

    expect(
      neurological?.groups.flatMap(group => group.diagnoses),
    ).toContain('Efectos extrapiramidales por neurolépticos');
  });
});
