import { buildCriteriaText } from './clipboard-text';
import { Crit } from './types';

const makeCrit = (summary: string, type: 'STOPP' | 'START' = 'STOPP', system = 'Sistema cardiovascular', id = 'STOPP-B1-X'): Crit => ({
  id, type, system, summary,
});

describe('buildCriteriaText()', () => {
  it('indica que no hay criterios cuando la lista está vacía', () => {
    expect(buildCriteriaText([])).toContain('Sin criterios aplicables');
  });

  it('incluye el nombre del sistema como encabezado', () => {
    const text = buildCriteriaText([makeCrit('Texto', 'STOPP', 'Sistema renal', 'STOPP-H1-X')]);
    expect(text).toContain('SISTEMA RENAL');
  });

  it('incluye el resumen de cada criterio', () => {
    const text = buildCriteriaText([makeCrit('Evitar AINEs')]);
    expect(text).toContain('Evitar AINEs');
  });

  it('incluye el tipo del criterio (STOPP/START)', () => {
    const stopp = makeCrit('Criterio STOPP', 'STOPP', 'Sistema cardiovascular', 'STOPP-B1-X');
    const start = makeCrit('Criterio START', 'START', 'Sistema cardiovascular', 'START-B2-Y');
    const text = buildCriteriaText([stopp, start]);
    expect(text).toContain('STOPP');
    expect(text).toContain('START');
  });

  it('incluye el código de sección del criterio', () => {
    const text = buildCriteriaText([makeCrit('Texto', 'STOPP', 'Sistema cardiovascular', 'STOPP-B1-DIGOXINA')]);
    expect(text).toContain('B1');
  });

  it('agrupa bajo el mismo sistema criterios del mismo sistema', () => {
    const crits = [
      makeCrit('Criterio 1', 'STOPP', 'Sistema cardiovascular', 'STOPP-B1-X'),
      makeCrit('Criterio 2', 'START', 'Sistema cardiovascular', 'START-B2-Y'),
    ];
    const text = buildCriteriaText(crits);
    const occurrences = (text.match(/SISTEMA CARDIOVASCULAR/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  it('crea secciones separadas para sistemas distintos', () => {
    const crits = [
      makeCrit('Cardio', 'STOPP', 'Sistema cardiovascular', 'STOPP-B1-X'),
      makeCrit('Renal',  'STOPP', 'Sistema renal',          'STOPP-H1-Y'),
    ];
    const text = buildCriteriaText(crits);
    expect(text).toContain('SISTEMA CARDIOVASCULAR');
    expect(text).toContain('SISTEMA RENAL');
  });
});
