// Regenera checklist con tabs de medicamentos y diagnósticos
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const criteria = JSON.parse(fs.readFileSync(path.join(root, 'src/assets/data/criteria.json'), 'utf8')).criteria;

const medsSrc = fs.readFileSync(path.join(root, 'src/app/core/data/medications.ts'), 'utf8');
const MED_BY_CLASS = {};
const ALL_MEDS = [];
for (const m of medsSrc.matchAll(/\{\s*id:\s*"([^"]+)",\s*drugClasses:\s*\[([^\]]+)\]/g)) {
  ALL_MEDS.push(m[1]);
  for (const c of [...m[2].matchAll(/"([^"]+)"/g)].map(x => x[1])) {
    if (!MED_BY_CLASS[c]) MED_BY_CLASS[c] = [];
    if (!MED_BY_CLASS[c].includes(m[1])) MED_BY_CLASS[c].push(m[1]);
  }
}
const byClass = (dc) => MED_BY_CLASS[dc] || [];

// Estructura espejo de medications-taxonomy.ts (solo drugClass + additionalCategories)
const RAW_DRUG_CATEGORIES = [
  { id: 'cardiovascular', label: 'Cardiovascular', groups: [
    { drugs: byClass('BETABLOQUEANTE') }, { drugs: byClass('IECA') }, { drugs: byClass('ARA2') },
    { drugs: byClass('DIURETICO_ASA') }, { drugs: byClass('DIURETICO_TIAZIDICO') },
    { drugs: byClass('ANTAGONISTA_ALDOSTERONA') }, { drugs: byClass('CALCIOANTAGONISTA_DHP') },
    { drugs: byClass('CALCIOANTAGONISTA_NO_DHP') }, { drugs: byClass('ANTIARITMICO') },
    { drugs: byClass('NITRATO') }, { drugs: byClass('DIGOXINA') },
    { drugs: byClass('SACUBITRILO_VALSARTAN') }, { drugs: byClass('ANTIHIPERTENSIVO_CENTRAL') },
    { drugs: byClass('ISGLT2') },
  ]},
  { id: 'anticoagulantes', label: 'Anticoagulantes', groups: [
    { drugs: byClass('ANTICOAGULANTE_AVK') }, { drugs: byClass('ANTICOAGULANTE_DIRECTO') },
    { drugs: byClass('ANTIAGREGANTE') },
  ]},
  { id: 'snc', label: 'SNC', groups: [
    { drugs: byClass('ISRS'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('ISRN') },
    { drugs: byClass('ANTIDEPRESIVO_TRICICLICO'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('BENZODIACEPINA') }, { drugs: byClass('HIPNOTICO_Z') },
    { drugs: byClass('NEUROLEPTICO'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('ANTIEPILÉPTICO') }, { drugs: byClass('GABAPENTINOIDE') },
    { drugs: byClass('INHIBIDOR_ACETILCOLINESTERASA') }, { drugs: byClass('ANTIDEMENCIA') },
    { drugs: byClass('ESTABILIZADOR_ANIMO'), additionalCategories: ['cardiovascular'] },
    { drugs: [...byClass('DOPAMINERGICO'), ...byClass('AGONISTA_DOPAMINERGICO')] },
    { drugs: byClass('ANTIPARKINSONIAN_ANTICOLINERGICO') }, { drugs: byClass('OPIOIDE') },
  ]},
  { id: 'renal', label: 'Renal', groups: [
    { drugs: byClass('EPO') }, { drugs: byClass('QUELANTE_FOSFORO') }, { drugs: byClass('VITAMINA_D') },
    { drugs: byClass('CALCIO') }, { drugs: byClass('HIERRO_ORAL') },
    { drugs: byClass('HIERRO_IV'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('DIURETICO_AHORRADOR_POTASIO'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('DIURETICO_ASA') }, { drugs: byClass('ANTAGONISTA_ALDOSTERONA') },
    { drugs: byClass('IECA') }, { drugs: byClass('ARA2') }, { drugs: byClass('ISGLT2') },
  ]},
  { id: 'gastrointestinal', label: 'Gastrointestinal', groups: [
    { drugs: byClass('IBP') }, { drugs: byClass('LAXANTE') }, { drugs: byClass('PROCINETICO') },
    { drugs: byClass('ANTIEMETICO_5HT3'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('PROBIOTICO') }, { drugs: byClass('FIBRA') }, { drugs: byClass('ANTIESPASMÓDICO') },
  ]},
  { id: 'respiratorio', label: 'Respiratorio', groups: [
    { drugs: byClass('LAMA') }, { drugs: byClass('LABA') }, { drugs: byClass('CORTICOIDE_INHALADO') },
    { drugs: byClass('METILXANTINA') }, { drugs: byClass('ANTIHISTAMINICO_1GEN') },
    { drugs: byClass('CORTICOIDE_SISTEMICO'), additionalCategories: ['cardiovascular'] },
  ]},
  { id: 'endocrino', label: 'Endocrino/Metabólico', groups: [
    { drugs: byClass('SULFONILUREA') }, { drugs: byClass('TIAZOLIDINDIONA') }, { drugs: byClass('BIGUANIDA') },
    { drugs: byClass('HORMONA_TIROIDEA') },
    { drugs: byClass('ESTATINA'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('INHIBIDOR_XANTINA_OXIDASA') }, { drugs: byClass('CORTICOIDE_SISTEMICO') },
    { drugs: byClass('ACIDO_FOLICO') }, { drugs: byClass('ISGLT2') },
  ]},
  { id: 'urologico', label: 'Urológico', groups: [
    { drugs: byClass('ALFABLOQUEANTE') }, { drugs: byClass('ALFABLOQUEANTE_PROSTATICO') },
    { drugs: byClass('INHIBIDOR_5ALFA_REDUCTASA') }, { drugs: byClass('ANTIESPASMÓDICO_URINARIO') },
    { drugs: byClass('AGONISTA_BETA3'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('ESTROGENO_TOPICO') },
    { drugs: byClass('INHIBIDOR_PDE5'), additionalCategories: ['cardiovascular'] },
  ]},
  { id: 'osteo', label: 'Osteo/Músculo-esq.', groups: [
    { drugs: byClass('BIFOSFONATO') }, { drugs: byClass('ANTIRRESORTIVO') }, { drugs: byClass('ANABOLIZANTE_OSEO') },
    { drugs: byClass('COLCHICINA') }, { drugs: byClass('FAME') },
    { drugs: byClass('RELAJANTE_MUSCULAR'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('AINE'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('ANALGESICO_SIMPLE') }, { drugs: byClass('OPIOIDE') }, { drugs: byClass('GABAPENTINOIDE') },
    { drugs: byClass('ANTIDEPRESIVO_TRICICLICO') },
  ]},
  { id: 'antibioticos', label: 'Antibióticos', groups: [
    { drugs: byClass('QUINOLONA'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('MACROLIDO'), additionalCategories: ['cardiovascular'] },
    { drugs: byClass('ANTIBIOTICO_URINARIO') },
    { drugs: { list: ['Amoxicilina', 'Amoxicilina/Clavulánico', 'Cefalexina', 'Doxiciclina', 'Trimetoprim/Sulfametoxazol'] } },
  ]},
];

const CAT_LABEL = Object.fromEntries(RAW_DRUG_CATEGORIES.map(c => [c.id, c.label]));
const MED_TABS = new Map();
const MED_GROUP_SIZE = new Map();

for (const cat of RAW_DRUG_CATEGORIES) {
  for (const g of cat.groups) {
    const drugs = g.drugs?.list ?? g.drugs ?? [];
    const tabLabels = new Set([cat.label]);
    for (const addId of g.additionalCategories || []) {
      if (CAT_LABEL[addId]) tabLabels.add(CAT_LABEL[addId]);
    }
    for (const drug of drugs) {
      if (!MED_TABS.has(drug)) MED_TABS.set(drug, new Set());
      for (const t of tabLabels) MED_TABS.get(drug).add(t);
      MED_GROUP_SIZE.set(drug, drugs.length);
    }
  }
}
for (const drug of ALL_MEDS) {
  if (!MED_TABS.has(drug)) MED_TABS.set(drug, new Set(['Otros']));
}

function fmtMedTabs(drug) {
  const tabs = [...(MED_TABS.get(drug) || ['Otros'])].sort();
  const unitario = MED_GROUP_SIZE.get(drug) === 1;
  let s = tabs.join(' + ');
  if (unitario && tabs.length === 1 && tabs[0] !== 'Otros') {
    s += ' (grupo unitario; si no visible → Otros)';
  }
  return s;
}

function fmtMed(drug) {
  return `**${drug}** [tab ${fmtMedTabs(drug)}]`;
}

const dxSrc = fs.readFileSync(path.join(root, 'src/app/core/data/diagnoses.ts'), 'utf8');
const DIAGNOSIS_GROUPS = {};
for (const m of dxSrc.match(/export const DIAGNOSIS_GROUPS[^=]*=\s*\{([\s\S]*?)\n\};/)[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  DIAGNOSIS_GROUPS[m[1]] = m[2];
}
const DX_LABEL = {};
for (const m of dxSrc.match(/export const DIAGNOSIS_MAP[^=]*=\s*\{([\s\S]*?)\n\};/)[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  DX_LABEL[m[2]] = m[1];
}

const TAB_ORDER = ['Cardiovascular','Neurológico','Psiquiátrico','Renal','Metabólico','Endocrino','Gastrointestinal','Respiratorio','Urológico','Ginecológico','Reumatológico','Hematológico'];
const OTROS_SYSTEMS = new Set(['Oncológico','Hepático','Oftalmológico','Dermatológico','Inmunológico','Infeccioso','Geriátrico','Sintomático','Síntoma']);

function dxTab(label) {
  const system = DIAGNOSIS_GROUPS[label];
  if (!system) return '?(sin grupo)';
  if (TAB_ORDER.includes(system)) return system;
  if (OTROS_SYSTEMS.has(system)) return `Otros (${system})`;
  return system;
}

function fmtDx(codeOrLabel) {
  const label = DX_LABEL[codeOrLabel] ?? codeOrLabel;
  return `dx **${label}** [tab ${dxTab(label)}]`;
}

const CLASS_EXAMPLE = (dc) => (MED_BY_CLASS[dc]?.[0] ?? dc);

function fmtClass(dc) {
  const ex = CLASS_EXAMPLE(dc);
  if (MED_BY_CLASS[dc]) return fmtMed(ex) + ` (clase ${dc})`;
  return `clase ${dc}`;
}

const OPS = {
  multipleNSAIDs: () => `marcar 2 AINEs distintos (p. ej. ${fmtMed('Ibuprofeno')} + ${fmtMed('Naproxeno')})`,
  multipleLoopDiuretics: () => `marcar 2 diuréticos de asa (p. ej. ${fmtMed('Furosemida')} + ${fmtMed('Torasemida')})`,
  multipleThiazideDiuretics: () => `marcar 2 tiazídicos (p. ej. ${fmtMed('Hidroclorotiazida')} + ${fmtMed('Indapamida')})`,
  multipleIECA: () => `marcar 2 IECA (p. ej. ${fmtMed('Enalapril')} + ${fmtMed('Ramipril')})`,
  multipleARAII: () => `marcar 2 ARA-II (p. ej. ${fmtMed('Valsartán')} + ${fmtMed('Losartán')})`,
  multipleAldosteroneAntagonists: () => `marcar 2 antag. aldosterona (p. ej. ${fmtMed('Espironolactona')} + ${fmtMed('Eplerenona')})`,
  multipleDiureticosAhorradoresPotasio: () => `marcar 2 ahorradores K+ (p. ej. ${fmtMed('Amilorida')} + ${fmtMed('Triamtereno')})`,
  multipleISRS: () => `marcar 2 ISRS (p. ej. ${fmtMed('Sertralina')} + ${fmtMed('Fluoxetina')})`,
  multipleANTIAGREGANTES: () => `marcar 2 antiagregantes (p. ej. ${fmtMed('Ácido acetilsalicílico')} + ${fmtMed('Clopidogrel')})`,
  multipleANTICOLINERGICOS: () => `marcar 2 anticolinérgicos (p. ej. ${fmtMed('Oxibutinina')} + ${fmtMed('Amitriptilina')})`,
  digoxinaDosisAlta: () => `${fmtMed('Digoxina')} con dosis ≥125 µg/día y duración >90 días (JSON: doseMcgDay/durationDays)`,
};

function parseLogic(node, neg = false) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(n => parseLogic(n, neg));
  const parts = [];
  for (const [key, val] of Object.entries(node)) {
    if (key === 'and') parts.push(...parseLogic(val, neg));
    else if (key === 'or') {
      const subs = val.map(v => parseLogic(v, neg)).filter(a => a.length);
      if (subs.length) parts.push(`(${subs.map(s => s.join(' + ')).join(' | ')})`);
    } else if (key === '!') parts.push(...parseLogic(val, true));
    else if (key === 'inDrugClass' && Array.isArray(val)) {
      parts.push(neg ? `NO marcar ${fmtClass(val[0])}` : `marcar ${fmtClass(val[0])}`);
    } else if (key === 'in' && Array.isArray(val) && val[1]?.var === 'diagnoses') {
      parts.push(neg ? `NO marcar ${fmtDx(val[0])}` : fmtDx(val[0]));
    } else if (key === 'in' && Array.isArray(val) && val[1]?.var === 'medications') {
      parts.push(neg ? `NO marcar ${fmtMed(val[0])}` : `marcar ${fmtMed(val[0])}`);
    } else if (OPS[key]) parts.push(neg ? `NO: ${OPS[key]()}` : OPS[key]());
    else if (key === 'egfrBelow') {
      const th = val[0];
      parts.push(neg ? `NO: TFGe < ${th}` : `TFGe < ${th} (lab egfr=${th - 1} o dx **Enfermedad renal grave** [tab Renal])`);
    } else if (['>', '>=', '<', '<=', '==', '!='].includes(key) && Array.isArray(val)) {
      const [a, b] = val;
      if (a?.var === 'info.age') {
        if (key === '>=') parts.push(neg ? `edad < ${b}` : `edad ≥ ${b} (campo paciente — sin pantalla UI)`);
      } else if (a?.var?.startsWith('labs.')) {
        const labName = a.var.replace('labs.', '');
        const labLabels = { fc_lpm: 'FC', potasio_mmol_l: 'K+', sodio_mmol_l: 'Na+', calcio_corregido_mmol_l: 'Ca corr.', pas_mmhg: 'PAS', pad_mmhg: 'PAD', qtc_ms: 'QTc', egfr_ml_min_173: 'TFGe', tsh_uUl: 'TSH' };
        const lbl = labLabels[labName] ?? labName;
        if (!neg) {
          let sample = b;
          if (key === '<' && typeof b === 'number') sample = b - (labName.includes('mmol') ? 0.1 : 1);
          if (key === '>' && typeof b === 'number') sample = b + (labName.includes('mmol') ? 0.1 : 1);
          if (key === '>=' && typeof b === 'number') sample = b;
          parts.push(`${lbl}=${sample} (lab — sin pantalla UI)`);
        }
      } else if (a?.var === 'labs.egfr_ml_min_173' && b === null && key === '==') {
        parts.push(neg ? 'TFGe informado' : 'TFGe vacío/null');
      }
    } else if (typeof val === 'object') parts.push(...parseLogic(val, neg));
  }
  return parts;
}

function shortSummary(s) {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > 85 ? t.slice(0, 82) + '…' : t;
}

function triggerLine(c) {
  const parts = parseLogic(c.logic);
  const deduped = [...new Set(parts)];
  const pos = deduped.filter(p => !p.startsWith('NO'));
  const neg = deduped.filter(p => p.startsWith('NO'));
  let text = pos.join(' + ');
  if (neg.length) text += (text ? ' ' : '') + `[${neg.map(n => n.replace(/^NO:?\s*/, 'y NO ')).join('; ')}]`;
  return text || '(logic no traducida — revisar JSON)';
}

function buildMarkdown(filterSystem = null) {
  const filtered = filterSystem ? criteria.filter(c => c.system === filterSystem) : criteria;
  const systems = filterSystem ? [filterSystem] : [...new Set(criteria.map(c => c.system))].sort((a, b) => a.localeCompare(b, 'es'));

  const title = filterSystem
    ? `# Checklist — prueba manual criterios ${filterSystem}`
    : `# Checklist — prueba manual de TODOS los criterios`;

  let md = `${title}\n\n`;
  md += `Fuente: \`criteria.json\` (${filtered.length} criterios). Tabs según \`medications-taxonomy.ts\` y \`diagnoses-taxonomy.ts\`.\n\n`;
  md += `Formato: \`N. ID — resumen — Para que salte: …\` con **[tab …]** en cada fármaco y dx.\n\n`;
  md += `Leyenda tabs meds: tab principal (+ tabs adicionales si aplica). Grupos unitarios pueden estar en **Otros** si no hay relevancia/dx habilitante.\n\n`;
  md += `Leyenda tabs dx: tab de diagnósticos en la UI (\`Otros (Sistema)\` = subgrupo dentro del tab Otros).\n\n`;

  let totalStopp = 0, totalStart = 0;

  for (const sys of systems) {
    const crits = filtered.filter(c => c.system === sys);
    const stopp = crits.filter(c => c.type === 'STOPP').sort((a, b) => a.id.localeCompare(b.id));
    const start = crits.filter(c => c.type === 'START').sort((a, b) => a.id.localeCompare(b.id));
    totalStopp += stopp.length;
    totalStart += start.length;

    md += `---\n\n## ${sys}\n\n*(STOPP: ${stopp.length} | START: ${start.length})*\n\n`;
    if (stopp.length) {
      md += `### STOPP\n\n`;
      stopp.forEach((c, i) => { md += `${i + 1}. ${c.id} — ${shortSummary(c.summary)} — Para que salte: ${triggerLine(c)}\n\n`; });
    }
    if (start.length) {
      md += `### START\n\n`;
      start.forEach((c, i) => { md += `${i + 1}. ${c.id} — ${shortSummary(c.summary)} — Para que salte: ${triggerLine(c)}\n\n`; });
    }
  }

  md += `---\n\n## Totales\n\n| Tipo | Cantidad |\n|------|----------|\n| STOPP | ${totalStopp} |\n| START | ${totalStart} |\n| **Total** | **${filtered.length}** |\n\n`;

  if (!filterSystem) {
    md += `## Índice rápido — tabs de medicamentos\n\n| Tab | Contenido principal |\n|-----|---------------------|\n`;
    md += `| Cardiovascular | Betabloqueantes, IECA, ARA-II, diuréticos, antiarrítmicos, digoxina, iSGLT2… |\n`;
    md += `| Anticoagulantes | AVK, AODs, antiagregantes |\n`;
    md += `| SNC | ISRS, tricíclicos, BZD, neurolépticos, opioides… (+ Cardiovascular si additionalCategories) |\n`;
    md += `| Renal, GI, Respiratorio, Endocrino/Metabólico, Urológico, Osteo/Músculo-esq., Antibióticos | Ver taxonomy |\n`;
    md += `| Otros | Fármacos huérfanos o grupos unitarios no aflorados |\n\n`;
    md += `## Índice rápido — tabs de diagnósticos\n\n`;
    md += `Tabs propios: Cardiovascular, Neurológico, Psiquiátrico, Renal, Metabólico, Endocrino, Gastrointestinal, Respiratorio, Urológico, Ginecológico, Reumatológico, Hematológico.\n\n`;
    md += `Tab **Otros**: Geriátrico, Sintomático, Síntoma, Oftalmológico, Oncológico, Hepático, etc.\n\n`;
  }

  md += `## OJO / casos difíciles solo con selección UI\n\n`;
  md += `- **Edad** y **labs**: sin pantalla; importar JSON.\n`;
  md += `- **Digoxina** [tab Cardiovascular]: grupo unitario — puede requerir dx/relevancia previa, o buscar en **Otros**.\n`;
  md += `- **Ondansetrón** [tab Gastrointestinal + Cardiovascular]: grupo unitario; si no visible → **Otros**.\n`;
  md += `- **Duplicidades** (\`multiple*\`): ≥2 fármacos de la misma clase.\n`;
  md += `- **START**: disparan cuando **NO** está el fármaco.\n`;
  md += `- **Dx foráneos**: algunos dx de un tab aparecen como grupo foráneo en otro tab si un criterio los referencia.\n`;

  return md;
}

const outAll = path.join(root, 'plans/checklist-prueba-manual-todos-criterios.md');
fs.writeFileSync(outAll, buildMarkdown(), 'utf8');
console.log('Written', outAll);

const outCv = path.join(root, 'plans/checklist-prueba-manual-cardiovascular.md');
fs.writeFileSync(outCv, buildMarkdown('Sistema cardiovascular'), 'utf8');
console.log('Written', outCv);
