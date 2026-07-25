import { ALL_CRITERIA } from '../services/criteria-test-helpers';
import { buildDxDependencies } from './dx-dependencies';
import {
  collapseFamilyConflationInOr,
  extractPositiveDxCodesForDependencies,
} from './diagnosis-family';

describe('collapseFamilyConflationInOr', () => {
  it('colapsa variantes IC cuando el ancla está en el OR', () => {
    const collapsed = collapseFamilyConflationInOr(
      new Set(['insuficiencia_cardiaca', 'ic_nyha_3_4', 'ic_funcion_sistolica_conservada']),
    );
    expect([...collapsed]).toEqual(['insuficiencia_cardiaca']);
  });

  it('colapsa variantes HTA cuando el ancla está en el OR', () => {
    const collapsed = collapseFamilyConflationInOr(
      new Set(['hta', 'hta_no_complicada', 'hipertension_moderada', 'hipertension_grave']),
    );
    expect([...collapsed]).toEqual(['hta']);
  });

  it('no colapsa demencia y Lewy (familias distintas)', () => {
    const collapsed = collapseFamilyConflationInOr(
      new Set(['demencia', 'demencia_cuerpos_lewy']),
    );
    expect([...collapsed].sort()).toEqual(['demencia', 'demencia_cuerpos_lewy']);
  });

  it('no colapsa parkinsonismo y Lewy (sin ancla común en familia)', () => {
    const collapsed = collapseFamilyConflationInOr(
      new Set(['parkinsonismo', 'demencia_cuerpos_lewy']),
    );
    expect([...collapsed].sort()).toEqual(['demencia_cuerpos_lewy', 'parkinsonismo']);
  });
});

describe('extractPositiveDxCodesForDependencies', () => {
  it('STOPP-J2: solo asigna insuficiencia_cardiaca, no variantes IC', () => {
    const j2 = ALL_CRITERIA.find(c => c.id === 'STOPP-J2-TIAZOLIDINDIONA-INSUFICIENCIA-CARDIACA');
    expect(j2).toBeDefined();
    expect([...extractPositiveDxCodesForDependencies(j2?.logic)]).toEqual(['insuficiencia_cardiaca']);
  });

  it('ignora diagnósticos bajo negación', () => {
    const codes = extractPositiveDxCodesForDependencies({
      and: [
        { inDrugClass: ['DIURETICO_ASA', { var: 'medications' }] },
        { '!': { or: [{ in: ['insuficiencia_cardiaca', { var: 'diagnoses' }] }] } },
        { in: ['hta', { var: 'diagnoses' }] },
      ],
    });
    expect([...codes].sort()).toEqual(['hta']);
  });
});

describe('buildDxDependencies — conflación padre/variante (derivación pura)', () => {
  const pure = () => buildDxDependencies(ALL_CRITERIA, {});

  it('IC FE conservada no hereda TIAZOLIDINDIONA del OR genérico (J2)', () => {
    const classes = pure()['Insuficiencia cardíaca con función sistólica conservada']?.classes ?? [];
    expect(classes).not.toContain('TIAZOLIDINDIONA');
  });

  it('IC FE conservada conserva deps de criterio directo (B1 digoxina)', () => {
    const classes = pure()['Insuficiencia cardíaca con función sistólica conservada']?.classes ?? [];
    expect(classes).toContain('DIGOXINA');
  });

  it('IC NYHA III-IV no hereda TIAZOLIDINDIONA del OR genérico', () => {
    const classes = pure()['Insuficiencia cardíaca NYHA III-IV']?.classes ?? [];
    expect(classes).not.toContain('TIAZOLIDINDIONA');
  });

  it('HTA grave no hereda DIURETICO_ASA de OR con ancla HTA', () => {
    const classes = pure()['HTA grave']?.classes ?? [];
    expect(classes).not.toContain('DIURETICO_ASA');
  });

  it('HTA moderada no hereda DIURETICO_ASA de OR con ancla HTA', () => {
    const classes = pure()['HTA moderada']?.classes ?? [];
    expect(classes).not.toContain('DIURETICO_ASA');
  });

  it('HTA no complicada no hereda DIURETICO_ASA de OR con ancla HTA', () => {
    const classes = pure()['HTA no complicada']?.classes ?? [];
    expect(classes).not.toContain('DIURETICO_ASA');
  });

  it('Demencia por cuerpos de Lewy y Demencia genérica son anclas fuera del mapa de gating', () => {
    // DLB es ancla desde que START-D4 (rivastigmina) la necesita como diagnóstico
    // independiente: no debe quedar gateada tras un neuroléptico (STOPP-D12).
    const pureDeps = pure();
    expect(pureDeps['Demencia por cuerpos de Lewy']).toBeUndefined();
    expect(pureDeps['Demencia']).toBeUndefined();
  });
});
