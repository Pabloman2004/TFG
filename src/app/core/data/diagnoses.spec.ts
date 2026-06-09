import { resolveDiagnosisLabel } from './diagnoses';

describe('resolveDiagnosisLabel', () => {
  it('devuelve el label legible para un código conocido del catálogo', () => {
    expect(resolveDiagnosisLabel('hta')).toBe('HTA');
  });

  it('devuelve el label legible para un código de varias palabras', () => {
    expect(resolveDiagnosisLabel('bradicardia')).toBe('Bradicardia');
  });

  it('devuelve "Otro (sin especificar)" para el código genérico __otro', () => {
    expect(resolveDiagnosisLabel('reumatologico__otro')).toBe('Otro (sin especificar)');
  });

  it('devuelve "Otro (sin especificar)" para __otro de cualquier grupo', () => {
    expect(resolveDiagnosisLabel('metabolico__otro')).toBe('Otro (sin especificar)');
  });

  it('devuelve el texto del usuario con "(añadido)" para un diagnóstico personalizado', () => {
    expect(resolveDiagnosisLabel('reumatologico__bifosfonatos')).toBe('Bifosfonatos (añadido)');
  });

  it('capitaliza la primera letra del texto personalizado', () => {
    expect(resolveDiagnosisLabel('metabolico__metformina')).toBe('Metformina (añadido)');
  });

  it('preserva mayúsculas si el usuario ya las escribió', () => {
    expect(resolveDiagnosisLabel('neurologico__Gabapentina')).toBe('Gabapentina (añadido)');
  });

  it('devuelve el código en bruto si no tiene separador y no está en el catálogo', () => {
    expect(resolveDiagnosisLabel('codigo_desconocido')).toBe('codigo_desconocido');
  });
});
