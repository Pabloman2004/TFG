// @linked docs/catalogo-clinico.md
// Si cambias TAB_ORDER, OTROS_SYSTEMS, buildTabs o la construcción de DIAGNOSIS_TABS, actualiza el doc enlazado.

import { DIAGNOSIS_GROUPS, DIAGNOSIS_SUBGROUPS, slug } from './diagnoses';

export interface DiagnosisGroup {
  id: string;
  label: string;
  diagnoses: string[];
}

export interface DiagnosisTab {
  id: string;
  label: string;
  groups: DiagnosisGroup[];
}

const TAB_ORDER: string[] = [
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
];

const OTROS_SYSTEMS = new Set([
  'Oncológico',
  'Hepático',
  'Oftalmológico',
  'Dermatológico',
  'Inmunológico',
  'Infeccioso',
  'Geriátrico',
  'Sintomático',
  'Síntoma',
]);

const OTROS_GROUP_ORDER: string[] = [
  'Geriátrico',
  'Sintomático',
  'Síntoma',
  'Oncológico',
  'Hepático',
  'Oftalmológico',
  'Dermatológico',
  'Inmunológico',
  'Infeccioso',
];


const groupBySystem = (): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  for (const [label, system] of Object.entries(DIAGNOSIS_GROUPS)) {
    (result[system] ??= []).push(label);
  }
  return result;
};

const buildGroupsForSystem = (system: string, labels: string[]): DiagnosisGroup[] => {
  const subgroupOf = (label: string): string | undefined => DIAGNOSIS_SUBGROUPS[label];
  const labelsWithSubgroup = labels.filter(l => subgroupOf(l) !== undefined);
  if (labelsWithSubgroup.length === 0) {
    const id = slug(system);
    return [{ id, label: system, diagnoses: labels.slice().sort((a, b) => a.localeCompare(b, 'es')) }];
  }

  const bySub: Record<string, string[]> = {};
  for (const label of labels) {
    const sub = subgroupOf(label) ?? system;
    (bySub[sub] ??= []).push(label);
  }

  return Object.keys(bySub)
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map(sub => ({
      id: slug(sub),
      label: sub,
      diagnoses: bySub[sub].slice().sort((a, b) => a.localeCompare(b, 'es')),
    }));
};

const buildTabs = (): DiagnosisTab[] => {
  const bySystem = groupBySystem();
  const tabs: DiagnosisTab[] = [];

  for (const system of TAB_ORDER) {
    if (!bySystem[system]) continue;
    tabs.push({
      id: slug(system),
      label: system,
      groups: buildGroupsForSystem(system, bySystem[system]),
    });
  }

  for (const system of Object.keys(bySystem)) {
    if (TAB_ORDER.includes(system) || OTROS_SYSTEMS.has(system)) continue;
    tabs.push({
      id: slug(system),
      label: system,
      groups: buildGroupsForSystem(system, bySystem[system]),
    });
  }

  const otrosGroups: DiagnosisGroup[] = [
    ...OTROS_GROUP_ORDER.filter(s => bySystem[s]),
    ...Object.keys(bySystem).filter(s => OTROS_SYSTEMS.has(s) && !OTROS_GROUP_ORDER.includes(s)),
  ].map(system => ({
    id: slug(system),
    label: system,
    diagnoses: bySystem[system].slice().sort((a, b) => a.localeCompare(b, 'es')),
  }));

  if (otrosGroups.length > 0) {
    otrosGroups.sort((a, b) => a.label.localeCompare(b.label, 'es'));
    tabs.push({ id: 'otros', label: 'Otros', groups: otrosGroups });
  }

  return tabs;
};

export const DIAGNOSIS_TABS: DiagnosisTab[] = buildTabs();

export const DIAGNOSIS_CATEGORIES: DiagnosisGroup[] = DIAGNOSIS_TABS.flatMap(t => t.groups);
