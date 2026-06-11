import { computeMedGroupBuckets, computeDxGroupBuckets, medGroupsVisibleInTab, dxGroupsVisibleInTab } from './group-visibility';
import { DrugCategory } from './data/medications-taxonomy';
import { DiagnosisTab } from './data/diagnoses-taxonomy';
import { Relevance } from './data/system-relevance';

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

const makeRelevance = (classesByTab: Record<string, string[]>): Relevance => ({
  classesByTab: new Map(Object.entries(classesByTab).map(([k, v]) => [k, new Set(v)])),
  dxsByTab: new Map(),
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
  dxsByTab: new Map(Object.entries(dxsByTab).map(([k, v]) => [k, new Set(v)])),
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
