import { partitionGroupDiagnoses } from './diagnosis-variant-view';

describe('partitionGroupDiagnoses — separa árboles de familia de los diagnósticos planos', () => {
  it('agrupa las variantes de HTA en una familia y deja el resto como planos', () => {
    const { families, plain } = partitionGroupDiagnoses([
      'HTA',
      'HTA grave',
      'HTA moderada',
      'HTA no complicada',
      'Intolerancia/fallo a otros antihipertensivos',
    ]);

    expect(families.length).toBe(1);
    expect(families[0].id).toBe('hta');
    expect(plain).toEqual(['Intolerancia/fallo a otros antihipertensivos']);
  });

  it('ordena las variantes según la familia (gravedad), no alfabéticamente', () => {
    const { families } = partitionGroupDiagnoses([
      'HTA grave',
      'HTA moderada',
      'HTA no complicada',
    ]);

    expect(families[0].variants).toEqual([
      'HTA no complicada',
      'HTA moderada',
      'HTA grave',
    ]);
  });

  it('expone la raíz como seleccionable con label "(sin especificar)" cuando está en el grupo', () => {
    const { families } = partitionGroupDiagnoses(['HTA', 'HTA grave']);

    expect(families[0].showRoot).toBe(true);
    expect(families[0].rootLabel).toBe('HTA');
    expect(families[0].rootDisplayLabel).toBe('HTA (sin especificar)');
  });

  it('no muestra raíz si el grupo no incluye el label raíz', () => {
    const { families } = partitionGroupDiagnoses(['HTA grave', 'HTA moderada']);

    expect(families[0].showRoot).toBe(false);
    expect(families[0].variants).toEqual(['HTA moderada', 'HTA grave']);
  });

  it('no crea familia si ninguna variante aparece en el grupo', () => {
    const { families, plain } = partitionGroupDiagnoses(['Bradicardia', 'Angina de pecho']);

    expect(families).toEqual([]);
    expect(plain).toEqual(['Bradicardia', 'Angina de pecho']);
  });

  it('solo incluye en la familia las variantes presentes en el grupo', () => {
    const { families, plain } = partitionGroupDiagnoses(['HTA grave']);

    expect(families[0].variants).toEqual(['HTA grave']);
    expect(plain).toEqual([]);
  });

  it('preserva el orden original de los diagnósticos planos', () => {
    const { plain } = partitionGroupDiagnoses(['Bradicardia', 'HTA', 'Angina de pecho']);

    expect(plain).toEqual(['Bradicardia', 'Angina de pecho']);
  });
});
