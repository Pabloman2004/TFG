import {
  DIAGNOSIS_VARIANT_FAMILIES,
  MUTEX_SIBLINGS,
  familyMemberLabels,
  applyMutex,
} from './diagnosis-variants';
import { DIAGNOSIS_MAP, normalizeDiagnosis } from './diagnoses';

describe('DIAGNOSIS_VARIANT_FAMILIES — catálogo declarativo de familias con variantes excluyentes', () => {
  it('incluye la familia HTA como única familia activa en esta iteración', () => {
    expect(DIAGNOSIS_VARIANT_FAMILIES.map(f => f.id)).toEqual(['hta']);
  });

  it('la familia HTA declara su raíz seleccionable y sus tres variantes de gravedad', () => {
    const hta = DIAGNOSIS_VARIANT_FAMILIES.find(f => f.id === 'hta');
    expect(hta).toBeDefined();
    expect(hta!.rootLabel).toBe('HTA');
    expect(hta!.rootSelectable).toBe(true);
    expect(hta!.variants).toEqual(['HTA no complicada', 'HTA moderada', 'HTA grave']);
  });

  it('todo label de familia (raíz + variantes) existe en DIAGNOSIS_MAP', () => {
    for (const family of DIAGNOSIS_VARIANT_FAMILIES) {
      for (const label of familyMemberLabels(family)) {
        expect(DIAGNOSIS_MAP[label])
          .withContext(`"${label}" debe existir en DIAGNOSIS_MAP`)
          .toBeDefined();
      }
    }
  });
});

describe('familyMemberLabels — miembros del grupo radio', () => {
  it('incluye la raíz cuando es seleccionable, antes que las variantes', () => {
    const hta = DIAGNOSIS_VARIANT_FAMILIES.find(f => f.id === 'hta')!;
    expect(familyMemberLabels(hta)).toEqual([
      'HTA',
      'HTA no complicada',
      'HTA moderada',
      'HTA grave',
    ]);
  });

  it('excluye la raíz cuando no es seleccionable (solo encabezado)', () => {
    expect(
      familyMemberLabels({
        id: 'demo',
        rootLabel: 'Raíz',
        rootSelectable: false,
        variants: ['A', 'B'],
      }),
    ).toEqual(['A', 'B']);
  });
});

describe('MUTEX_SIBLINGS — índice código → códigos hermanos a desmarcar', () => {
  it('está indexado por código interno, no por label', () => {
    expect(MUTEX_SIBLINGS['hipertension_grave']).toBeDefined();
    expect(MUTEX_SIBLINGS['HTA grave']).toBeUndefined();
  });

  it('cada miembro mapea exactamente a los demás miembros de su familia (en código)', () => {
    const hta = DIAGNOSIS_VARIANT_FAMILIES.find(f => f.id === 'hta')!;
    const members = familyMemberLabels(hta);
    for (const label of members) {
      const code = normalizeDiagnosis(label);
      const expectedSiblings = members
        .filter(m => m !== label)
        .map(m => normalizeDiagnosis(m));
      expect(MUTEX_SIBLINGS[code]).toEqual(expectedSiblings);
    }
  });

  it('un miembro no aparece como hermano de sí mismo', () => {
    expect(MUTEX_SIBLINGS['hta']).not.toContain('hta');
  });

  it('todo código referenciado (clave y hermano) existe en el catálogo (DIAGNOSIS_MAP)', () => {
    const knownCodes = new Set(Object.values(DIAGNOSIS_MAP));
    for (const [code, siblings] of Object.entries(MUTEX_SIBLINGS)) {
      expect(knownCodes).withContext(`código "${code}"`).toContain(code);
      for (const sib of siblings) {
        expect(knownCodes).withContext(`hermano "${sib}"`).toContain(sib);
      }
    }
  });
});

describe('applyMutex — exclusividad mutua pura sobre códigos seleccionados', () => {
  it('al elegir una variante con otra hermana activa, deja solo la elegida', () => {
    const result = applyMutex(['hipertension_moderada'], 'hipertension_grave');
    expect(result).toEqual(['hipertension_grave']);
  });

  it('elimina TODOS los hermanos presentes (raíz + otras variantes) y conserva la elegida', () => {
    const result = applyMutex(
      ['hta', 'hta_no_complicada', 'hipertension_moderada'],
      'hipertension_grave',
    );
    expect(result).toEqual(['hipertension_grave']);
  });

  it('toggle-off: volver a elegir la variante ya activa la deja en "ninguna"', () => {
    expect(applyMutex(['hipertension_grave'], 'hipertension_grave')).toEqual([]);
  });

  it('la raíz "sin especificar" también es excluyente con las variantes', () => {
    expect(applyMutex(['hipertension_grave'], 'hta')).toEqual(['hta']);
    expect(applyMutex(['hta'], 'hipertension_grave')).toEqual(['hipertension_grave']);
  });

  it('preserva códigos ajenos a la familia (otros diagnósticos)', () => {
    const result = applyMutex(
      ['bradicardia', 'hipertension_moderada', 'epoc'],
      'hipertension_grave',
    );
    expect(result).toContain('bradicardia');
    expect(result).toContain('epoc');
    expect(result).toContain('hipertension_grave');
    expect(result).not.toContain('hipertension_moderada');
  });

  it('un código sin familia se comporta como toggle simple (añade)', () => {
    expect(applyMutex(['bradicardia'], 'epoc')).toEqual(['bradicardia', 'epoc']);
  });

  it('un código sin familia se comporta como toggle simple (quita)', () => {
    expect(applyMutex(['bradicardia', 'epoc'], 'epoc')).toEqual(['bradicardia']);
  });

  it('no muta el array de entrada', () => {
    const input = ['hipertension_moderada'];
    const snapshot = [...input];
    applyMutex(input, 'hipertension_grave');
    expect(input).toEqual(snapshot);
  });
});
