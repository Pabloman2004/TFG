import { Crit, JsonLogicRule } from '../types';
import { ALL_CRITERIA } from '../services/criteria-test-helpers';
import {
  SYSTEM_TO_TABS,
  TRANSVERSAL,
  buildRelevance,
  extractReferences,
  resolveTabsForSystem,
} from './system-relevance';

const crit = (overrides: Partial<Crit> & { logic: JsonLogicRule }): Crit => ({
  id: 'TEST',
  type: 'STOPP',
  system: 'Sistema cardiovascular',
  summary: '',
  ...overrides,
});

describe('SYSTEM_TO_TABS', () => {
  it('mapea cada sistema definido a al menos un tab', () => {
    for (const [system, tabs] of Object.entries(SYSTEM_TO_TABS)) {
      expect(tabs.length).toBeGreaterThan(0, `${system} sin tabs`);
    }
  });

  it('expande SNC a snc + neurologico + psiquiatrico', () => {
    expect(SYSTEM_TO_TABS['Sistema nervioso central']).toEqual(['snc', 'neurologico', 'psiquiatrico']);
  });

  it('marca sistemas clínicamente transversales con "*"', () => {
    expect(SYSTEM_TO_TABS['Analgésicos']).toContain(TRANSVERSAL);
    expect(SYSTEM_TO_TABS['Riesgo de caídas']).toContain(TRANSVERSAL);
    expect(SYSTEM_TO_TABS['Carga antimuscarínica/anticolinérgica']).toContain(TRANSVERSAL);
    expect(SYSTEM_TO_TABS['Indicación de la medicación']).toContain(TRANSVERSAL);
  });
});

describe('resolveTabsForSystem', () => {
  it('devuelve los tabs configurados para un sistema conocido', () => {
    expect(resolveTabsForSystem('Sistema cardiovascular')).toEqual(['cardiovascular']);
  });

  it('devuelve array vacío para sistema desconocido', () => {
    expect(resolveTabsForSystem('Sistema inventado')).toEqual([]);
  });

  it('devuelve array vacío para system undefined', () => {
    expect(resolveTabsForSystem(undefined)).toEqual([]);
  });
});

describe('extractReferences', () => {
  it('extrae drugClasses de inDrugClass', () => {
    const refs = extractReferences({ inDrugClass: ['AINE', { var: 'medications' }] });
    expect([...refs.classes]).toEqual(['AINE']);
    expect(refs.dxs.size).toBe(0);
  });

  it('extrae códigos de diagnóstico de in[code, {var: diagnoses}]', () => {
    const refs = extractReferences({ in: ['insuficiencia_renal', { var: 'diagnoses' }] });
    expect([...refs.dxs]).toEqual(['insuficiencia_renal']);
    expect(refs.classes.size).toBe(0);
  });

  it('extrae diagnósticos sustitutos de egfrBelow según umbral', () => {
    const at30 = extractReferences({ egfrBelow: [30, { var: '' }] });
    expect(at30.dxs.has('enfermedad_renal_grave')).toBe(true);
    expect(at30.dxs.has('insuficiencia_renal_terminal')).toBe(true);

    const at20 = extractReferences({ egfrBelow: [20, { var: '' }] });
    expect(at20.dxs.has('enfermedad_renal_grave')).toBe(false);
    expect(at20.dxs.has('insuficiencia_renal_terminal')).toBe(true);

    const at10 = extractReferences({ egfrBelow: [10, { var: '' }] });
    expect(at10.dxs.size).toBe(0);
  });

  it('ignora in[code, {var: medications}] (referencias a meds individuales)', () => {
    const refs = extractReferences({ in: ['Digoxina', { var: 'medications' }] });
    expect(refs.classes.size).toBe(0);
    expect(refs.dxs.size).toBe(0);
  });

  it('camina lógica anidada con and/or/!', () => {
    const refs = extractReferences({
      and: [
        { inDrugClass: ['AINE', { var: 'medications' }] },
        { or: [
          { in: ['insuficiencia_renal', { var: 'diagnoses' }] },
          { '!': { inDrugClass: ['IBP', { var: 'medications' }] } },
        ] },
      ],
    });
    expect([...refs.classes].sort()).toEqual(['AINE', 'IBP']);
    expect([...refs.dxs]).toEqual(['insuficiencia_renal']);
  });

  it('devuelve sets vacíos para logic undefined', () => {
    const refs = extractReferences(undefined);
    expect(refs.classes.size).toBe(0);
    expect(refs.dxs.size).toBe(0);
  });

  it('extrae la clase de inDrugClass (D8/D10/F2 tras quitar gates de duración)', () => {
    const refs = extractReferences({
      inDrugClass: ['BENZODIACEPINA', { var: 'medications' }],
    });
    expect([...refs.classes]).toEqual(['BENZODIACEPINA']);
  });

  it('extrae la clase de operadores multiple* (A3/C3/M1)', () => {
    expect([...extractReferences({ multipleNSAIDs: [{ var: 'medications' }] }).classes])
      .toEqual(['AINE']);
    expect([...extractReferences({ multipleANTIAGREGANTES: [{ var: 'medications' }] }).classes])
      .toEqual(['ANTIAGREGANTE']);
    expect([...extractReferences({ multipleANTICOLINERGICOS: [{ var: 'medications' }] }).classes])
      .toEqual(['ANTICOLINERGICO']);
    expect([...extractReferences({ multipleARAII: [{ var: 'medications' }] }).classes])
      .toEqual(['ARA2']);
  });
});

describe('buildRelevance', () => {
  it('devuelve mapas vacíos para lista vacía de criterios', () => {
    const rel = buildRelevance([]);
    expect(rel.classesByTab.size).toBe(0);
    expect(rel.dxsByTab.size).toBe(0);
  });

  it('asigna clases del criterio al tab mapeado por su system', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema cardiovascular',
        logic: { inDrugClass: ['BETABLOQUEANTE', { var: 'medications' }] },
      }),
    ]);
    expect(rel.classesByTab.get('cardiovascular')?.has('BETABLOQUEANTE')).toBe(true);
  });

  it('propaga a TODOS los tabs definidos cuando system mapea a varios', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema nervioso central',
        logic: { inDrugClass: ['BENZODIACEPINA', { var: 'medications' }] },
      }),
    ]);
    expect(rel.classesByTab.get('snc')?.has('BENZODIACEPINA')).toBe(true);
    expect(rel.classesByTab.get('neurologico')?.has('BENZODIACEPINA')).toBe(true);
    expect(rel.classesByTab.get('psiquiatrico')?.has('BENZODIACEPINA')).toBe(true);
  });

  it('expande criterios transversales (Analgésicos) a todos los tabs provistos', () => {
    const allTabs = ['cardiovascular', 'renal', 'snc'];
    const rel = buildRelevance(
      [
        crit({
          system: 'Analgésicos',
          logic: { inDrugClass: ['AINE', { var: 'medications' }] },
        }),
      ],
      allTabs,
    );
    for (const t of allTabs) {
      expect(rel.classesByTab.get(t)?.has('AINE')).toBe(true, `falta en ${t}`);
    }
  });

  it('expande también los diagnósticos transversales a todos los tabs provistos', () => {
    const allTabs = ['cardiovascular', 'renal', 'neurologico'];
    const rel = buildRelevance(
      [
        crit({
          system: 'Analgésicos',
          logic: { in: ['dolor_neuropatico', { var: 'diagnoses' }] },
        }),
      ],
      allTabs,
    );

    for (const tabId of allTabs) {
      expect(rel.dxsByTab.get(tabId)?.has('dolor_neuropatico'))
        .withContext(`falta en ${tabId}`)
        .toBe(true);
    }
    expect(rel.specificClassesByTab.size).toBe(0);
    expect(rel.specificDxsByTab.size).toBe(0);
  });

  it('no incluye diagnósticos transversales en specificDxsByTab', () => {
    const allTabs = ['cardiovascular', 'renal'];
    const rel = buildRelevance(
      [
        crit({
          system: 'Analgésicos',
          logic: { in: ['dolor_neuropatico', { var: 'diagnoses' }] },
        }),
        crit({
          system: 'Sistema renal',
          logic: { in: ['insuficiencia_renal', { var: 'diagnoses' }] },
        }),
      ],
      allTabs,
    );

    expect(rel.specificDxsByTab.get('renal')?.has('insuficiencia_renal')).toBe(true);
    expect(rel.specificDxsByTab.get('renal')?.has('dolor_neuropatico')).toBeFalsy();
  });

  it('indexa psicosis solo en psiquiátrico, no en neurológico', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema nervioso central',
        logic: { in: ['psicosis', { var: 'diagnoses' }] },
      }),
    ]);

    expect(rel.dxsByTab.get('psiquiatrico')?.has('psicosis')).toBe(true);
    expect(rel.specificDxsByTab.get('psiquiatrico')?.has('psicosis')).toBe(true);
    expect(rel.dxsByTab.get('neurologico')?.has('psicosis')).toBeFalsy();
    expect(rel.specificDxsByTab.get('neurologico')?.has('psicosis')).toBeFalsy();
  });

  it('indexa vaginitis atrófica solo en ginecológico, no en urológico', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema urogenital',
        logic: { in: ['vaginitis_atrofica', { var: 'diagnoses' }] },
      }),
    ]);

    expect(rel.dxsByTab.get('ginecologico')?.has('vaginitis_atrofica')).toBe(true);
    expect(rel.specificDxsByTab.get('ginecologico')?.has('vaginitis_atrofica')).toBe(true);
    expect(rel.dxsByTab.get('urologico')?.has('vaginitis_atrofica')).toBeFalsy();
    expect(rel.specificDxsByTab.get('urologico')?.has('vaginitis_atrofica')).toBeFalsy();
  });

  it('sigue expandiendo a todos los tabs un dx cuyo origen no está en el mapeo multi-tab', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema nervioso central',
        logic: { in: ['insuficiencia_renal', { var: 'diagnoses' }] },
      }),
    ]);

    expect(rel.dxsByTab.get('neurologico')?.has('insuficiencia_renal')).toBe(true);
    expect(rel.dxsByTab.get('psiquiatrico')?.has('insuficiencia_renal')).toBe(true);
    expect(rel.dxsByTab.get('snc')?.has('insuficiencia_renal')).toBe(true);
  });

  it('indexa en renal los diagnósticos sustitutos de egfrBelow', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema renal',
        logic: { egfrBelow: [30, { var: '' }] },
      }),
    ]);

    expect(rel.specificDxsByTab.get('renal')?.has('enfermedad_renal_grave')).toBe(true);
    expect(rel.specificDxsByTab.get('renal')?.has('insuficiencia_renal_terminal')).toBe(true);
  });

  it('estreñimiento crónico aflora en urológico (I4) y gastrointestinal (F3-FARMACOS)', () => {
    const rel = buildRelevance(ALL_CRITERIA);
    expect(rel.specificDxsByTab.get('urologico')?.has('estrenimiento_cronico')).toBe(true);
    expect(rel.specificDxsByTab.get('gastrointestinal')?.has('estrenimiento_cronico')).toBe(true);
  });

  it('hipocalcemia aflora en renal (START-E1) para poder marcarse en ese tab', () => {
    const rel = buildRelevance(ALL_CRITERIA);
    expect(rel.specificDxsByTab.get('renal')?.has('hipocalcemia')).toBe(true);
  });

  it('inmunocompromiso/deterioro grave aflora en gastrointestinal (exclusión de START-F6)', () => {
    const rel = buildRelevance(ALL_CRITERIA);
    expect(rel.specificDxsByTab.get('gastrointestinal')?.has('inmunocompromiso_deterioro_grave')).toBe(true);
  });

  it('hipoxemia crónica aflora en respiratorio (START-G3) para poder marcarse en ese tab', () => {
    const rel = buildRelevance(ALL_CRITERIA);
    expect(rel.specificDxsByTab.get('respiratorio')?.has('hipoxemia_cronica')).toBe(true);
  });

  it('ignora criterios transversales si no se pasa allTabIds', () => {
    const rel = buildRelevance([
      crit({
        system: 'Riesgo de caídas',
        logic: { inDrugClass: ['BENZODIACEPINA', { var: 'medications' }] },
      }),
    ]);
    expect(rel.classesByTab.size).toBe(0);
  });

  it('asigna diagnósticos al tab mapeado', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema renal',
        logic: { in: ['insuficiencia_renal', { var: 'diagnoses' }] },
      }),
    ]);
    expect(rel.dxsByTab.get('renal')?.has('insuficiencia_renal')).toBe(true);
  });

  it('acumula múltiples clases del mismo tab a lo largo de varios criterios', () => {
    const rel = buildRelevance([
      crit({
        id: 'A',
        system: 'Sistema cardiovascular',
        logic: { inDrugClass: ['BETABLOQUEANTE', { var: 'medications' }] },
      }),
      crit({
        id: 'B',
        system: 'Sistema cardiovascular',
        logic: { inDrugClass: ['IECA', { var: 'medications' }] },
      }),
    ]);
    const cardio = rel.classesByTab.get('cardiovascular')!;
    expect(cardio.has('BETABLOQUEANTE')).toBe(true);
    expect(cardio.has('IECA')).toBe(true);
    expect(cardio.size).toBe(2);
  });

  it('indexa DIGOXINA desde inDrugClass en E1 (sin operador de dosis)', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema renal',
        logic: {
          and: [
            { egfrBelow: [30, { var: '' }] },
            { inDrugClass: ['DIGOXINA', { var: 'medications' }] },
          ],
        },
      }),
    ]);

    expect(rel.classesByTab.get('renal')?.has('DIGOXINA')).toBe(true);
    expect(rel.specificClassesByTab.get('renal')?.has('DIGOXINA')).toBe(true);
  });

  it('indexa ANALGESICO_SIMPLE desde inDrugClass (L6)', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema musculoesquelético',
        logic: {
          and: [
            { inDrugClass: ['ANALGESICO_SIMPLE', { var: 'medications' }] },
            { in: ['hepatopatia_cronica', { var: 'diagnoses' }] },
          ],
        },
      }),
    ]);

    expect(rel.specificClassesByTab.get('osteo')?.has('ANALGESICO_SIMPLE')).toBe(true);
  });

  it('une las clases explícitas con las extraídas de la lógica', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema gastrointestinal',
        logic: { inDrugClass: ['IBP', { var: 'medications' }] },
        relevance: { medicationClasses: ['HIERRO_ORAL'] },
      }),
    ]);

    expect(rel.classesByTab.get('gastrointestinal')).toEqual(
      new Set(['IBP', 'HIERRO_ORAL']),
    );
  });

  it('ignora criterios con system desconocido', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema inexistente',
        logic: { inDrugClass: ['AINE', { var: 'medications' }] },
      }),
    ]);
    expect(rel.classesByTab.size).toBe(0);
  });

  it('ignora criterios sin referencias a clases ni diagnósticos', () => {
    const rel = buildRelevance([
      crit({
        system: 'Sistema cardiovascular',
        logic: { '>=': [{ var: 'info.age' }, 65] },
      }),
    ]);
    expect(rel.classesByTab.size).toBe(0);
    expect(rel.dxsByTab.size).toBe(0);
  });

  it('rellena specificClassCriteriaByTab con el id del criterio específico', () => {
    const rel = buildRelevance([
      crit({
        id: 'STOPP-B19-TEST',
        system: 'Sistema cardiovascular',
        logic: { inDrugClass: ['CORTICOIDE_SISTEMICO', { var: 'medications' }] },
      }),
    ]);
    expect(
      rel.specificClassCriteriaByTab.get('cardiovascular')?.get('CORTICOIDE_SISTEMICO')?.has('STOPP-B19-TEST'),
    ).toBe(true);
    expect(rel.classesByCriterion.get('STOPP-B19-TEST')?.has('CORTICOIDE_SISTEMICO')).toBe(true);
  });

  it('un criterio transversal no aporta a specificClassCriteriaByTab', () => {
    const rel = buildRelevance(
      [
        crit({
          id: 'STOPP-K1-TEST',
          system: 'Riesgo de caídas',
          logic: { inDrugClass: ['BENZODIACEPINA', { var: 'medications' }] },
        }),
      ],
      ['cardiovascular', 'snc'],
    );
    expect(rel.classesByTab.get('cardiovascular')?.has('BENZODIACEPINA')).toBe(true);
    expect(rel.specificClassCriteriaByTab.get('cardiovascular')?.get('BENZODIACEPINA')).toBeUndefined();
  });

  it('STOPP con clase solo negada no aparece en specificClassesByTab', () => {
    const rel = buildRelevance([
      crit({
        type: 'STOPP',
        system: 'Sistema cardiovascular',
        logic: { '!': { inDrugClass: ['CALCIOANTAGONISTA_DHP', { var: 'medications' }] } },
      }),
    ]);
    expect(rel.specificClassesByTab.get('cardiovascular')?.has('CALCIOANTAGONISTA_DHP')).toBeFalsy();
  });

  it('START con clase solo negada sí aparece en specificClassesByTab', () => {
    const rel = buildRelevance([
      crit({
        type: 'START',
        system: 'Sistema cardiovascular',
        logic: { '!': { inDrugClass: ['HIERRO_IV', { var: 'medications' }] } },
      }),
    ]);
    expect(rel.specificClassesByTab.get('cardiovascular')?.has('HIERRO_IV')).toBe(true);
  });

  it('HIERRO_IV sigue en cardiovascular con datos reales (START-B11)', () => {
    const rel = buildRelevance(ALL_CRITERIA);
    expect(rel.specificClassesByTab.get('cardiovascular')?.has('HIERRO_IV')).toBe(true);
  });

  it('STOPP con la misma clase en ambas polaridades sí aparece', () => {
    const rel = buildRelevance([
      crit({
        type: 'STOPP',
        system: 'Sistema cardiovascular',
        logic: {
          and: [
            { inDrugClass: ['AINE', { var: 'medications' }] },
            { '!': { inDrugClass: ['AINE', { var: 'medications' }] } },
          ],
        },
      }),
    ]);
    expect(rel.specificClassesByTab.get('cardiovascular')?.has('AINE')).toBe(true);
  });
});

describe('alternativas dentro de un `or`', () => {
  it('marca como alternativos los diagnósticos de ramas distintas de un mismo or', () => {
    const rel = buildRelevance([
      crit({
        id: 'C1',
        system: 'Sistema musculoesquelético',
        logic: {
          and: [
            { in: ['deficit_vitamina_d', { var: 'diagnoses' }] },
            {
              or: [
                { in: ['osteopenia', { var: 'diagnoses' }] },
                { in: ['no_sale_de_casa', { var: 'diagnoses' }] },
              ],
            },
          ],
        },
      }),
    ]);
    const alts = rel.dxAlternativesByCriterion.get('C1');
    expect([...(alts?.get('no_sale_de_casa') ?? [])]).toEqual(['osteopenia']);
    expect([...(alts?.get('osteopenia') ?? [])]).toEqual(['no_sale_de_casa']);
  });

  it('no marca como alternativo un diagnóstico conjuntivo (fuera del or)', () => {
    const rel = buildRelevance([
      crit({
        id: 'C1',
        system: 'Sistema musculoesquelético',
        logic: {
          and: [
            { in: ['deficit_vitamina_d', { var: 'diagnoses' }] },
            {
              or: [
                { in: ['osteopenia', { var: 'diagnoses' }] },
                { in: ['no_sale_de_casa', { var: 'diagnoses' }] },
              ],
            },
          ],
        },
      }),
    ]);
    const alts = rel.dxAlternativesByCriterion.get('C1');
    expect(alts?.get('no_sale_de_casa')?.has('deficit_vitamina_d')).toBeFalsy();
    expect(alts?.get('deficit_vitamina_d')?.size ?? 0).toBe(0);
  });

  it('marca como alternativas las clases de ramas distintas de un mismo or', () => {
    const rel = buildRelevance([
      crit({
        id: 'C2',
        system: 'Sistema cardiovascular',
        logic: {
          and: [
            {
              or: [
                { inDrugClass: ['IECA', { var: 'medications' }] },
                { inDrugClass: ['ARA2', { var: 'medications' }] },
              ],
            },
            { inDrugClass: ['DIURETICO_AHORRADOR_POTASIO', { var: 'medications' }] },
          ],
        },
      }),
    ]);
    const alts = rel.classAlternativesByCriterion.get('C2');
    expect([...(alts?.get('IECA') ?? [])]).toEqual(['ARA2']);
    expect(alts?.get('IECA')?.has('DIURETICO_AHORRADOR_POTASIO')).toBeFalsy();
  });

  it('START-H5 real: no_sale_de_casa y osteopenia son alternativas, deficit_vitamina_d no', () => {
    const rel = buildRelevance(ALL_CRITERIA);
    const alts = rel.dxAlternativesByCriterion.get('START-H5-VITAMINA-D-DEFICIT-CAIDAS-OSTEOPENIA');
    expect(alts?.get('no_sale_de_casa')?.has('osteopenia')).toBe(true);
    expect(alts?.get('no_sale_de_casa')?.has('deficit_vitamina_d')).toBe(false);
  });
});
