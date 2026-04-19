import { DIAGNOSIS_GROUPS } from './diagnoses';

export interface DiagnosisGroup {
  id: string;
  label: string;
  diagnoses: string[];
}

const SYSTEM_ORDER: string[] = [
  'Cardiovascular',
  'Neurológico',
  'Psiquiátrico',
  'Renal',
  'Metabólico',
  'Endocrino',
  'Gastrointestinal',
  'Respiratorio',
  'Urológico',
  'Ginecológico',
  'Reumatológico',
  'Hematológico',
  'Oncológico',
  'Hepático',
  'Oftalmológico',
  'Dermatológico',
  'Inmunológico',
  'Infeccioso',
  'Geriátrico',
  'Sintomático',
  'Síntoma',
];

const slug = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_');

const buildGroups = (): DiagnosisGroup[] => {
  const bySystem: Record<string, string[]> = {};
  for (const [label, system] of Object.entries(DIAGNOSIS_GROUPS)) {
    (bySystem[system] ??= []).push(label);
  }
  const ordered = [
    ...SYSTEM_ORDER.filter(s => bySystem[s]),
    ...Object.keys(bySystem).filter(s => !SYSTEM_ORDER.includes(s)),
  ];
  return ordered.map(system => ({
    id: slug(system),
    label: system,
    diagnoses: bySystem[system].slice().sort((a, b) => a.localeCompare(b, 'es')),
  }));
};

export const DIAGNOSIS_CATEGORIES: DiagnosisGroup[] = buildGroups();
