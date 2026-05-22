import { Crit, JsonLogicRule } from '../types';
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
});
