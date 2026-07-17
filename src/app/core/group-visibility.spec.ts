import { computeMedGroupBuckets, computeDxGroupBuckets, medGroupsVisibleInTab, dxGroupsVisibleInTab } from './group-visibility';
import { DRUG_CATEGORIES, DrugCategory } from './data/medications-taxonomy';
import { DiagnosisTab } from './data/diagnoses-taxonomy';
import { buildRelevance, Relevance } from './data/system-relevance';
import { Med } from './types';
import { MEDICATIONS } from './data/medications';
import { ALL_CRITERIA } from './services/criteria-test-helpers';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const CATS: DrugCategory[] = [
  {
    id: 'cardio',
    label: 'Cardiovascular',
    groups: [
      { id: 'g1', label: 'Betabloqueantes', drugs: ['Bisoprolol', 'Atenolol'], drugClass: 'BETABLOQUEANTE' },
      { id: 'g2', label: 'Diuréticos', drugs: ['Furosemida', 'Torasemida'], drugClass: 'DIURETICO_ASA' },
      { id: 'g_single', label: 'Digoxina solo', drugs: ['Digoxina'], drugClass: 'DIGOXINA' },
    ],
  },
  {
    id: 'neuro',
    label: 'Neurológico',
    groups: [
      { id: 'g3', label: 'ISRS', drugs: ['Citalopram', 'Sertralina'], drugClass: 'ISRS' },
      { id: 'g_single2', label: 'Solo uno', drugs: ['Donepezilo'], drugClass: 'IACE' },
    ],
  },
];

const toClassMap = (record: Record<string, string[]>) =>
  new Map(Object.entries(record).map(([k, v]) => [k, new Set(v)]));

const makeRelevance = (
  classesByTab: Record<string, string[]>,
  specificClassesByTab: Record<string, string[]> = classesByTab,
): Relevance => ({
  classesByTab: toClassMap(classesByTab),
  specificClassesByTab: toClassMap(specificClassesByTab),
  dxsByTab: new Map(),
  specificDxsByTab: new Map(),
});

const TABS: DiagnosisTab[] = [
  {
    id: 'cardio',
    label: 'Cardiovascular',
    groups: [
      { id: 'dg1', label: 'HTA', diagnoses: ['Hipertensión arterial'] },
      { id: 'dg2', label: 'FA', diagnoses: ['Fibrilación auricular'] },
    ],
  },
  {
    id: 'neuro',
    label: 'Neurológico',
    groups: [
      { id: 'dg3', label: 'Demencia', diagnoses: ['Demencia'] },
    ],
  },
];

const makeDxRelevance = (dxsByTab: Record<string, string[]>): Relevance => ({
  classesByTab: new Map(),
  specificClassesByTab: new Map(),
  dxsByTab: new Map(Object.entries(dxsByTab).map(([k, v]) => [k, new Set(v)])),
  specificDxsByTab: new Map(Object.entries(dxsByTab).map(([k, v]) => [k, new Set(v)])),
});

// ─── computeMedGroupBuckets ────────────────────────────────────────────────────

describe('computeMedGroupBuckets', () => {
  it('tab "otros": devuelve grupo único con medicaciones de grupos de 1 drug', () => {
    const result = computeMedGroupBuckets('otros', CATS, null, 'otros');
    expect(result.ownAll.length).toBe(1);
    expect(result.ownAll[0].id).toBe('otros');
    expect(result.ownAll[0].drugs).toContain('Digoxina');
    expect(result.ownAll[0].drugs).toContain('Donepezilo');
    expect(result.foreignRelevant.length).toBe(0);
  });

  it('tab "otros" vacío cuando no hay grupos de 1 drug', () => {
    const cats: DrugCategory[] = [
      { id: 'cardio', label: 'C', groups: [{ id: 'g1', label: 'G1', drugs: ['A', 'B'], drugClass: 'X' }] },
    ];
    const result = computeMedGroupBuckets('otros', cats, null, 'otros');
    expect(result.ownAll.length).toBe(0);
    expect(result.foreignRelevant.length).toBe(0);
  });

  it('tab regular sin relevancia: solo ownAll sin foreign', () => {
    const result = computeMedGroupBuckets('cardio', CATS, null, 'otros');
    expect(result.ownAll.length).toBe(2);
    expect(result.foreignRelevant.length).toBe(0);
  });

  it('tab regular con foreign relevante: incluye grupos de otros tabs', () => {
    const rel = makeRelevance({ cardio: ['ISRS'] });
    const result = computeMedGroupBuckets('cardio', CATS, rel, 'otros');
    expect(result.foreignRelevant.length).toBe(1);
    expect(result.foreignRelevant[0].id).toBe('g3');
    expect(result.foreignRelevant[0].originTabId).toBe('neuro');
  });

  it('filtra un grupo foráneo por todas las clases de cada medicamento', () => {
    const categories: DrugCategory[] = [
      {
        id: 'anticoagulantes',
        label: 'Anticoagulantes',
        groups: [{
          id: 'aod',
          label: 'AOD',
          drugs: ['Apixabán', 'Dabigatrán'],
          drugClass: 'ANTICOAGULANTE_DIRECTO',
        }],
      },
      { id: 'renal', label: 'Renal', groups: [] },
    ];
    const medications: Med[] = [
      {
        id: 'Apixabán',
        drugClasses: ['ANTICOAGULANTE_DIRECTO', 'INHIBIDOR_FACTOR_XA'],
      },
      {
        id: 'Dabigatrán',
        drugClasses: ['ANTICOAGULANTE_DIRECTO', 'INHIBIDOR_DIRECTO_TROMBINA'],
      },
    ];
    const rel = makeRelevance({ renal: ['INHIBIDOR_FACTOR_XA'] });

    const result = computeMedGroupBuckets('renal', categories, rel, 'otros', medications);

    expect(result.foreignRelevant.length).toBe(1);
    expect(result.foreignRelevant[0].drugs).toEqual(['Apixabán']);
  });

  it('muestra un medicamento multiclase en cada tab donde comparte alguna clase', () => {
    const categories: DrugCategory[] = [
      {
        id: 'anticoagulantes',
        label: 'Anticoagulantes',
        groups: [{
          id: 'aod',
          label: 'AOD',
          drugs: ['Apixabán'],
          drugClass: 'ANTICOAGULANTE_DIRECTO',
        }],
      },
      { id: 'renal', label: 'Renal', groups: [] },
      { id: 'cardiovascular', label: 'Cardiovascular', groups: [] },
    ];
    const medications: Med[] = [{
      id: 'Apixabán',
      drugClasses: ['ANTICOAGULANTE_DIRECTO', 'INHIBIDOR_FACTOR_XA'],
    }];
    const rel = makeRelevance({
      renal: ['INHIBIDOR_FACTOR_XA'],
      cardiovascular: ['ANTICOAGULANTE_DIRECTO'],
    });

    const renal = computeMedGroupBuckets('renal', categories, rel, 'otros', medications);
    const cardiovascular = computeMedGroupBuckets(
      'cardiovascular',
      categories,
      rel,
      'otros',
      medications,
    );

    expect(renal.foreignRelevant.flatMap(group => group.drugs)).toEqual(['Apixabán']);
    expect(cardiovascular.foreignRelevant.flatMap(group => group.drugs)).toEqual(['Apixabán']);
  });

  it('hace aflorar grupos sin drugClass a partir de las clases de sus medicamentos', () => {
    const categories: DrugCategory[] = [
      {
        id: 'antibioticos',
        label: 'Antiinfecciosos',
        groups: [{
          id: 'generales',
          label: 'Antibióticos generales',
          drugs: ['Amoxicilina', 'Doxiciclina'],
        }],
      },
      { id: 'gastrointestinal', label: 'Gastrointestinal', groups: [] },
    ];
    const medications: Med[] = [
      { id: 'Amoxicilina', drugClasses: ['ANTIBIOTICO'] },
      { id: 'Doxiciclina', drugClasses: ['ANTIBIOTICO'] },
    ];
    const rel = makeRelevance({ gastrointestinal: ['ANTIBIOTICO'] });

    const result = computeMedGroupBuckets(
      'gastrointestinal',
      categories,
      rel,
      'otros',
      medications,
    );

    expect(result.foreignRelevant.flatMap(group => group.drugs)).toEqual([
      'Amoxicilina',
      'Doxiciclina',
    ]);
  });

  it('no duplica un medicamento dentro del mismo tab si pertenece a varios grupos', () => {
    const categories: DrugCategory[] = [
      {
        id: 'anticoagulantes',
        label: 'Anticoagulantes',
        groups: [
          {
            id: 'aod',
            label: 'AOD',
            drugs: ['Apixabán'],
            drugClass: 'ANTICOAGULANTE_DIRECTO',
          },
          {
            id: 'factor_xa',
            label: 'Factor Xa',
            drugs: ['Apixabán'],
            drugClass: 'INHIBIDOR_FACTOR_XA',
          },
        ],
      },
      { id: 'renal', label: 'Renal', groups: [] },
    ];
    const medications: Med[] = [{
      id: 'Apixabán',
      drugClasses: ['ANTICOAGULANTE_DIRECTO', 'INHIBIDOR_FACTOR_XA'],
    }];
    const rel = makeRelevance({ renal: ['INHIBIDOR_FACTOR_XA'] });

    const result = computeMedGroupBuckets('renal', categories, rel, 'otros', medications);

    expect(result.foreignRelevant.flatMap(group => group.drugs)).toEqual(['Apixabán']);
  });

  it('no incluye foreign si la clase ya está en ownAll', () => {
    const rel = makeRelevance({ cardio: ['BETABLOQUEANTE'] });
    const result = computeMedGroupBuckets('cardio', CATS, rel, 'otros');
    expect(result.foreignRelevant.length).toBe(0);
  });

  it('ownAll está ordenado por label', () => {
    const result = computeMedGroupBuckets('cardio', CATS, null, 'otros');
    const labels = result.ownAll.map(g => g.label);
    expect(labels).toEqual([...labels].sort());
  });

  // ─── Unitarios relevantes (afloran por relevancia clínica) ─────────────────

  it('(a) grupo unitario cuya clase ES relevante en el tab aparece en ownAll de ese tab', () => {
    const rel = makeRelevance({ cardio: ['DIGOXINA'] });
    const result = computeMedGroupBuckets('cardio', CATS, rel, 'otros');
    expect(result.ownAll.map(g => g.id)).toContain('g_single');
  });

  it('(b) grupo unitario cuya clase NO es relevante en el tab no aparece en ese tab', () => {
    const rel = makeRelevance({ cardio: ['ISRS'] });
    const result = computeMedGroupBuckets('cardio', CATS, rel, 'otros');
    expect(result.ownAll.map(g => g.id)).not.toContain('g_single');
    expect(result.foreignRelevant.map(g => g.drugClass)).not.toContain('DIGOXINA');
  });

  it('(c) grupo unitario relevante en varios tabs aparece en todos ellos (propio y foráneo)', () => {
    const rel = makeRelevance({ cardio: ['DIGOXINA'], neuro: ['DIGOXINA'] });
    const cardio = computeMedGroupBuckets('cardio', CATS, rel, 'otros');
    expect(cardio.ownAll.map(g => g.id)).toContain('g_single');
    const neuro = computeMedGroupBuckets('neuro', CATS, rel, 'otros');
    expect(neuro.foreignRelevant.map(g => g.drugClass)).toContain('DIGOXINA');
    expect(neuro.foreignRelevant.find(g => g.drugClass === 'DIGOXINA')?.originTabId).toBe('cardio');
  });

  it('un unitario que aflora en otro tab también permanece visible en su tab principal', () => {
    const rel = makeRelevance({ neuro: ['DIGOXINA'] }, { neuro: ['DIGOXINA'] });

    const cardio = computeMedGroupBuckets('cardio', CATS, rel, 'otros');
    const neuro = computeMedGroupBuckets('neuro', CATS, rel, 'otros');
    const otros = computeMedGroupBuckets('otros', CATS, rel, 'otros');

    expect(cardio.ownAll.map(group => group.id)).toContain('g_single');
    expect(neuro.foreignRelevant.flatMap(group => group.drugs)).toContain('Digoxina');
    expect(otros.ownAll.flatMap(group => group.drugs)).not.toContain('Digoxina');
  });

  it('(d) un unitario que aflora por relevancia ya no va a "Otros"; uno no relevante sí', () => {
    const rel = makeRelevance({ cardio: ['DIGOXINA'] });
    const result = computeMedGroupBuckets('otros', CATS, rel, 'otros');
    expect(result.ownAll[0].drugs).not.toContain('Digoxina');
    expect(result.ownAll[0].drugs).toContain('Donepezilo');
  });

  it('(e) un unitario relevante SOLO por vía transversal no aflora en ningún tab y sigue en "Otros"', () => {
    const catsParacetamol: DrugCategory[] = [
      {
        id: 'cardio',
        label: 'Cardiovascular',
        groups: [
          { id: 'g1', label: 'Betabloqueantes', drugs: ['Bisoprolol', 'Atenolol'], drugClass: 'BETABLOQUEANTE' },
          { id: 'g_para', label: 'Analgésicos simples', drugs: ['Paracetamol'], drugClass: 'ANALGESICO_SIMPLE' },
        ],
      },
    ];
    // Procedencia transversal: ANALGESICO_SIMPLE está en classesByTab (full, expandida
    // a todos los tabs por el comodín "Analgésicos") pero NO en specificClassesByTab.
    const rel = makeRelevance({ cardio: ['ANALGESICO_SIMPLE'] }, {});

    const cardio = computeMedGroupBuckets('cardio', catsParacetamol, rel, 'otros');
    expect(cardio.ownAll.map(g => g.id)).not.toContain('g_para');
    expect(cardio.foreignRelevant.map(g => g.drugClass)).not.toContain('ANALGESICO_SIMPLE');

    const otros = computeMedGroupBuckets('otros', catsParacetamol, rel, 'otros');
    expect(otros.ownAll[0].drugs).toContain('Paracetamol');
  });
});

// ─── medGroupsVisibleInTab ─────────────────────────────────────────────────────

describe('medGroupsVisibleInTab', () => {
  it('devuelve lista plana de ownAll + foreignRelevant', () => {
    const rel = makeRelevance({ cardio: ['ISRS'] });
    const result = medGroupsVisibleInTab('cardio', CATS, rel, 'otros');
    const ids = result.map(g => g.id);
    expect(ids).toContain('g1');
    expect(ids).toContain('g2');
    expect(ids).toContain('g3');
  });
});

describe('visibilidad farmacológica con datos clínicos reales', () => {
  const relevance = buildRelevance(ALL_CRITERIA);

  const foreignDrugsIn = (tabId: string): readonly string[] =>
    computeMedGroupBuckets(
      tabId,
      DRUG_CATEGORIES,
      relevance,
      'otros',
      MEDICATIONS,
    ).foreignRelevant.flatMap(group => group.drugs);

  it('hace visibles en Renal los medicamentos citados mediante clases específicas', () => {
    const renalDrugs = foreignDrugsIn('renal');

    expect(renalDrugs).toContain('Digoxina');
    expect(renalDrugs).toContain('Apixaban');
    expect(renalDrugs).toContain('Dabigatrán');
    expect(renalDrugs).toContain('Edoxaban');
    expect(renalDrugs).toContain('Rivaroxaban');
    expect(renalDrugs).toContain('Nitrofurantoína');
    expect(renalDrugs).toContain('Metotrexato');
  });

  it('asigna cada medicamento renal al grupo con coincidencia de clase directa', () => {
    const renal = computeMedGroupBuckets(
      'renal',
      DRUG_CATEGORIES,
      relevance,
      'otros',
      MEDICATIONS,
    );

    expect(renal.foreignRelevant.find(group => group.id === 'biguan')?.drugs)
      .toEqual(['Metformina']);
    expect(renal.foreignRelevant.find(group => group.id === 'bifosf')?.drugs)
      .toEqual(['Alendronato', 'Ibandronato', 'Risedronato', 'Zoledronato']);
    expect(renal.foreignRelevant.find(group => group.id === 'antirres')?.drugs ?? [])
      .not.toContain('Alendronato');
  });

  it('mantiene visibles en su tab principal los unitarios que afloran en otros sistemas', () => {
    const principalCases = [
      { tabId: 'snc', groupId: 'estab_anim', drugId: 'Litio' },
      { tabId: 'gastrointestinal', groupId: 'antiemet', drugId: 'Ondansetrón' },
      { tabId: 'endocrino', groupId: 'biguan', drugId: 'Metformina' },
      { tabId: 'endocrino', groupId: 'acido_folico', drugId: 'Ácido fólico' },
      { tabId: 'endocrino', groupId: 'antineoplasicos', drugId: 'Tamoxifeno' },
      { tabId: 'osteo', groupId: 'relaj_musc', drugId: 'Tizanidina' },
      { tabId: 'antibioticos', groupId: 'atb_urin', drugId: 'Nitrofurantoína' },
      { tabId: 'antibioticos', groupId: 'antipaludicos', drugId: 'Quinina' },
    ];

    for (const { tabId, groupId, drugId } of principalCases) {
      const buckets = computeMedGroupBuckets(
        tabId,
        DRUG_CATEGORIES,
        relevance,
        'otros',
        MEDICATIONS,
      );
      expect(
        buckets.ownAll.find(group => group.id === groupId)?.drugs,
      ).withContext(`${drugId} ausente de ${tabId}/${groupId}`).toContain(drugId);
    }
  });

  it('hace visible el hierro oral en Gastrointestinal por relevancia explícita', () => {
    const gastrointestinalDrugs = foreignDrugsIn('gastrointestinal');

    expect(gastrointestinalDrugs).toContain('Sulfato ferroso');
    expect(gastrointestinalDrugs).toContain('Fumarato ferroso');
    expect(gastrointestinalDrugs).toContain('Gluconato ferroso');
  });

  it('hace visibles antibióticos de otros sistemas donde se referencia la clase agregada', () => {
    expect(foreignDrugsIn('gastrointestinal')).toContain('Amoxicilina');
    expect(foreignDrugsIn('urologico')).toContain('Amoxicilina');
  });
});

// ─── computeDxGroupBuckets ─────────────────────────────────────────────────────

describe('computeDxGroupBuckets', () => {
  it('tab "otros": devuelve todos los grupos del tab sin foreign', () => {
    const otrosTab: DiagnosisTab = { id: 'otros', label: 'Otros', groups: [{ id: 'og1', label: 'Otros DX', diagnoses: ['X'] }] };
    const result = computeDxGroupBuckets(otrosTab, [...TABS, otrosTab], null);
    expect(result.ownGroups).toEqual(otrosTab.groups);
    expect(result.foreignRelevant.length).toBe(0);
  });

  it('sin relevancia: solo ownGroups sin foreign', () => {
    const result = computeDxGroupBuckets(TABS[0], TABS, null);
    expect(result.ownGroups).toEqual(TABS[0].groups);
    expect(result.foreignRelevant.length).toBe(0);
  });

  it('con dx relevante de otro tab: incluye grupo foreign', () => {
    const rel = makeDxRelevance({ cardio: ['demencia'] });
    const result = computeDxGroupBuckets(TABS[0], TABS, rel);
    expect(result.foreignRelevant.length).toBe(1);
    expect(result.foreignRelevant[0].originTabId).toBe('neuro');
    expect(result.foreignRelevant[0].diagnoses).toContain('Demencia');
  });

  it('no incluye diagnósticos ya presentes en ownGroups', () => {
    const rel = makeDxRelevance({ cardio: ['hipertension_arterial'] });
    const result = computeDxGroupBuckets(TABS[0], TABS, rel);
    expect(result.foreignRelevant.length).toBe(0);
  });

  it('no muestra como foráneos diagnósticos solo presentes en dxsByTab (vía transversal)', () => {
    const rel: Relevance = {
      classesByTab: new Map(),
      specificClassesByTab: new Map(),
      dxsByTab: new Map([['cardio', new Set(['demencia'])]]),
      specificDxsByTab: new Map(),
    };
    const result = computeDxGroupBuckets(TABS[0], TABS, rel);
    expect(result.foreignRelevant.length).toBe(0);
  });
});

// ─── dxGroupsVisibleInTab ──────────────────────────────────────────────────────

describe('dxGroupsVisibleInTab', () => {
  it('devuelve lista plana de ownGroups + foreignRelevant', () => {
    const rel = makeDxRelevance({ cardio: ['demencia'] });
    const result = dxGroupsVisibleInTab(TABS[0], TABS, rel);
    const ids = result.map(g => g.id);
    expect(ids).toContain('dg1');
    expect(ids).toContain('dg2');
    expect(ids).toContain('foreign__neuro');
  });
});
