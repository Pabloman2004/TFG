import { Med } from './types';
import { DrugGroup } from './data/medications-taxonomy';
import { DiagnosisGroup } from './data/diagnoses-taxonomy';
import { isMedGroupChecked, isDxGroupChecked } from './group-checked';

const med = (id: string, drugClasses: string[] = []): Med => ({ id, drugClasses });

const medGroup = (overrides: Partial<DrugGroup> = {}): DrugGroup => ({
  id: 'betabloqueantes',
  label: 'Betabloqueantes',
  drugs: ['Bisoprolol', 'Metoprolol', 'Carvedilol'],
  drugClass: 'BETABLOQUEANTE',
  ...overrides,
});

const dxGroup = (overrides: Partial<DiagnosisGroup> = {}): DiagnosisGroup => ({
  id: 'cardiovascular',
  label: 'Cardiovascular',
  diagnoses: ['Bradicardia', 'HTA', 'Angina de pecho'],
  ...overrides,
});

describe('isMedGroupChecked() — meds-step', () => {
  it('devuelve false si no hay ninguna medicación', () => {
    expect(isMedGroupChecked(medGroup(), [])).toBe(false);
  });

  it('devuelve true al marcar un fármaco del grupo', () => {
    expect(isMedGroupChecked(medGroup(), [med('Bisoprolol', ['BETABLOQUEANTE'])])).toBe(true);
  });

  it('vuelve a false al desmarcar el único hijo', () => {
    const g = medGroup();
    let meds: Med[] = [med('Bisoprolol', ['BETABLOQUEANTE'])];
    expect(isMedGroupChecked(g, meds)).toBe(true);
    meds = meds.filter(m => m.id !== 'Bisoprolol');
    expect(isMedGroupChecked(g, meds)).toBe(false);
  });

  it('mantiene true con múltiples hijos hasta desmarcar el último', () => {
    const g = medGroup();
    let meds: Med[] = [
      med('Bisoprolol', ['BETABLOQUEANTE']),
      med('Metoprolol', ['BETABLOQUEANTE']),
    ];
    expect(isMedGroupChecked(g, meds)).toBe(true);
    meds = meds.filter(m => m.id !== 'Bisoprolol');
    expect(isMedGroupChecked(g, meds)).toBe(true);
    meds = meds.filter(m => m.id !== 'Metoprolol');
    expect(isMedGroupChecked(g, meds)).toBe(false);
  });

  it('reconoce la opción "Otro" del grupo (otro__<groupId>)', () => {
    const g = medGroup();
    expect(isMedGroupChecked(g, [med('otro__betabloqueantes', ['BETABLOQUEANTE'])])).toBe(true);
  });

  it('reconoce un fármaco custom de la misma clase del grupo', () => {
    const g = medGroup();
    expect(isMedGroupChecked(g, [med('Esmolol', ['BETABLOQUEANTE'])])).toBe(true);
  });

  it('ignora medicaciones de otra clase', () => {
    const g = medGroup();
    expect(isMedGroupChecked(g, [med('Enalapril', ['IECA'])])).toBe(false);
  });

  it('no muta el array de meds que recibe', () => {
    const g = medGroup();
    const meds: Med[] = [med('Bisoprolol', ['BETABLOQUEANTE'])];
    const snapshot = JSON.stringify(meds);
    isMedGroupChecked(g, meds);
    expect(JSON.stringify(meds)).toBe(snapshot);
  });
});

describe('isDxGroupChecked() — diagnosis-step', () => {
  it('devuelve false si no hay diagnósticos', () => {
    expect(isDxGroupChecked(dxGroup(), [])).toBe(false);
  });

  it('devuelve true al marcar un diagnóstico conocido del grupo', () => {
    // "Bradicardia" se normaliza a "bradicardia" según DIAGNOSIS_MAP.
    expect(isDxGroupChecked(dxGroup(), ['bradicardia'])).toBe(true);
  });

  it('vuelve a false al desmarcar el único diagnóstico', () => {
    const g = dxGroup();
    let dx: string[] = ['bradicardia'];
    expect(isDxGroupChecked(g, dx)).toBe(true);
    dx = dx.filter(c => c !== 'bradicardia');
    expect(isDxGroupChecked(g, dx)).toBe(false);
  });

  it('mantiene true con varios diagnósticos hasta desmarcar el último', () => {
    const g = dxGroup();
    let dx: string[] = ['bradicardia', 'hta'];
    expect(isDxGroupChecked(g, dx)).toBe(true);
    dx = dx.filter(c => c !== 'bradicardia');
    expect(isDxGroupChecked(g, dx)).toBe(true);
    dx = dx.filter(c => c !== 'hta');
    expect(isDxGroupChecked(g, dx)).toBe(false);
  });

  it('reconoce la opción "Otro" del grupo (<groupId>__otro)', () => {
    const g = dxGroup();
    expect(isDxGroupChecked(g, ['cardiovascular__otro'])).toBe(true);
  });

  it('reconoce un diagnóstico custom asociado al grupo', () => {
    const g = dxGroup();
    expect(isDxGroupChecked(g, ['cardiovascular__Síndrome inventado'])).toBe(true);
  });

  it('ignora códigos de otros grupos', () => {
    const g = dxGroup();
    expect(isDxGroupChecked(g, ['renal__otro', 'enfermedad_renal_grave'])).toBe(false);
  });
});
