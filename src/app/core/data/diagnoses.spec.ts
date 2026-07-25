import {
  resolveDiagnosisLabel,
  normalizeDiagnosis,
  DIAGNOSIS_GROUPS,
  DIAGNOSIS_MAP,
} from './diagnoses';

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

describe('normalizeDiagnosis', () => {
  it('devuelve el valor del DIAGNOSIS_MAP para una entrada conocida', () => {
    const [label, key] = Object.entries(DIAGNOSIS_MAP)[0];
    expect(normalizeDiagnosis(label)).toBe(key);
  });

  it('entry ya mapeada en DIAGNOSIS_MAP: pasa por el mapa, no por el fallback', () => {
    expect(normalizeDiagnosis('HTA')).toBe('hta');
  });

  it('entrada desconocida sin acento: convierte a minúsculas y reemplaza espacios', () => {
    expect(normalizeDiagnosis('Diabetes Mellitus')).toBe('diabetes_mellitus');
  });

  it('[T9] entrada desconocida CON acento: normaliza NFD igual que slug (sin acento)', () => {
    expect(normalizeDiagnosis('Ictús agudo')).toBe('ictus_agudo');
  });

  it('[T9] otro acento: "Fibrilación" → "fibrilacion"', () => {
    expect(normalizeDiagnosis('Fibrilación no mapeada')).toBe('fibrilacion_no_mapeada');
  });

  it('incluye esofagitis erosiva como diagnóstico seleccionable para STOPP-F5', () => {
    expect(DIAGNOSIS_MAP['Esofagitis erosiva']).toBe('esofagitis_erosiva');
  });

  it('incluye la hipoxemia crónica documentada como diagnóstico respiratorio para START-G3', () => {
    const label = 'Hipoxemia crónica documentada (pO2 < 60 mmHg o SatO2 < 89%)';
    expect(DIAGNOSIS_MAP[label]).toBe('hipoxemia_cronica');
    expect(DIAGNOSIS_GROUPS[label]).toBe('Respiratorio');
  });
});
