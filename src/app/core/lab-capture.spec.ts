import { LAB_SPECS, LabKey, labCaptureFields } from './lab-capture';
import { ALL_CRITERIA, makeLabs } from './services/criteria-test-helpers';

describe('lab-capture — panel fijo de analítica', () => {
  it('ofrece todos los campos con ficha de presentación, siempre', () => {
    const keys = labCaptureFields(makeLabs({})).map(f => f.key);
    expect(keys).toEqual(Object.keys(LAB_SPECS) as LabKey[]);
  });

  it('no depende de ninguna selección: con labs vacíos devuelve el panel completo', () => {
    expect(labCaptureFields(null).length).toBe(Object.keys(LAB_SPECS).length);
  });

  it('rellena el valor de cada campo desde los labs informados', () => {
    const fields = labCaptureFields(makeLabs({ egfr_ml_min_173: 25, pas_mmhg: 150 }));
    const byKey = new Map(fields.map(f => [f.key, f.value]));
    expect(byKey.get('egfr_ml_min_173')).toBe(25);
    expect(byKey.get('pas_mmhg')).toBe(150);
  });

  it('devuelve valor null cuando la analítica no está informada', () => {
    const fields = labCaptureFields(null);
    expect(fields.every(f => f.value === null)).toBe(true);
  });

  it('todo lab consumido por un criterio real tiene ficha de presentación', () => {
    const referenced = new Set<string>();
    const walk = (node: unknown): void => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (k === 'var' && typeof v === 'string' && v.startsWith('labs.')) {
          referenced.add(v.slice('labs.'.length));
          continue;
        }
        walk(v);
      }
    };
    ALL_CRITERIA.forEach(c => walk(c.logic));

    const sinFicha = [...referenced].filter(lab => !(lab in LAB_SPECS));
    expect(sinFicha).toEqual([]);
  });
});
