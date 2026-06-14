// Diff: buildDxDependencies(includeExcludeClasses=true) vs (=false)
// Para cada dx que pierde una clase, comprueba si esa clase aparece en
// la lógica POSITIVA (no excludes) de algún otro criterio STOPP que referencie ese dx.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const criteriaJson = JSON.parse(
  readFileSync(resolve(__dirname, '../src/assets/data/criteria.json'), 'utf-8'),
);

// ── 1. DIAGNOSIS_MAP: import-like parse de diagnoses.ts ────────────────────────
// El fichero tiene: export const DIAGNOSIS_MAP: Record<string, string> = { 'Label': 'code', ... };
// Usamos el módulo TS no disponible en Node, así que parseamos el texto.
const diagnosesText = readFileSync(
  resolve(__dirname, '../src/app/core/data/diagnoses.ts'), 'utf-8',
);

// Extrae el bloque de DIAGNOSIS_MAP (línea "export const DIAGNOSIS_MAP..." hasta el "};" siguiente)
// Usa comillas dobles: "Label": "code"
const diagMapStart = diagnosesText.indexOf('export const DIAGNOSIS_MAP');
if (diagMapStart === -1) { console.error('No se encontró DIAGNOSIS_MAP'); process.exit(1); }
const diagMapSection = diagnosesText.slice(diagMapStart);
// Encuentra el primer '{' y el '};\n' que cierra el mapa
const braceStart = diagMapSection.indexOf('{');
// Busca el cierre del bloque contando llaves
let depth = 0, braceEnd = -1;
for (let i = braceStart; i < diagMapSection.length; i++) {
  if (diagMapSection[i] === '{') depth++;
  else if (diagMapSection[i] === '}') { depth--; if (depth === 0) { braceEnd = i; break; } }
}
const diagMapBody = diagMapSection.slice(braceStart + 1, braceEnd);

const diagMap = {};
// Entries como: "Label": "code" (comillas dobles)
for (const m of diagMapBody.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  diagMap[m[1]] = m[2];   // label → code
}
const reverseMap = Object.fromEntries(Object.entries(diagMap).map(([l, c]) => [c, l]));

console.log(`[debug] DIAGNOSIS_MAP entries: ${Object.keys(diagMap).length}`);
console.log(`[debug] Sample labels: ${Object.keys(diagMap).slice(0, 3).join(', ')}`);

// ── 2. Anchor labels (non-doubtful) ────────────────────────────────────────────
const anchorText = readFileSync(
  resolve(__dirname, '../src/app/core/data/dx-anchor-labels-candidate.ts'), 'utf-8',
);

// Parse cada objeto del array DX_ANCHOR_LABELS_CANDIDATE
// Buscamos bloques { label: '...', rationale: '...' } con o sin doubtful
const anchorLabels = new Set();
// Dividir por objetos del array: split en '  {' y para cada uno extraer label y si tiene doubtful
const objectBlocks = anchorText.split(/\n\s*\{/).slice(1); // cada bloque es un objeto
for (const block of objectBlocks) {
  const labelMatch = block.match(/label:\s*'([^']+)'/);
  if (!labelMatch) continue;
  const hasDoubtful = block.includes('doubtful');
  if (!hasDoubtful) anchorLabels.add(labelMatch[1]);
}

console.log(`[debug] Anchor labels (non-doubtful): ${anchorLabels.size}`);
console.log(`[debug] Sample anchors: ${[...anchorLabels].slice(0, 5).join(', ')}`);

// ── 3. Walkers ─────────────────────────────────────────────────────────────────
function extractDrugClasses(node) {
  const classes = new Set();
  function walk(n, negated) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(x => walk(x, negated)); return; }
    for (const [k, v] of Object.entries(n)) {
      if (k === '!' || k === 'not') { walk(v, true); continue; }
      if (k === 'inDrugClass' && Array.isArray(v) && typeof v[0] === 'string') {
        if (!negated) classes.add(v[0]);
        continue;
      }
      walk(v, negated);
    }
  }
  walk(node, false);
  return classes;
}

function extractPositiveDxCodes(node) {
  const codes = new Set();
  function walk(n, negated) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(x => walk(x, negated)); return; }
    for (const [k, v] of Object.entries(n)) {
      if (k === '!' || k === 'not') { walk(v, true); continue; }
      if (k === 'in' && Array.isArray(v) && typeof v[0] === 'string'
          && v[1] && typeof v[1] === 'object' && v[1]['var'] === 'diagnoses') {
        if (!negated) codes.add(v[0]);
        continue;
      }
      walk(v, negated);
    }
  }
  walk(node, false);
  return codes;
}

// ── 4. Solo criterios STOPP con lógica estándar (que tienen dx codes) ─────────
const stoppCriteria = criteriaJson.criteria.filter(c => c.type === 'STOPP' && c.logic);
const stoppWithDx = stoppCriteria.filter(c => extractPositiveDxCodes(c.logic).size > 0);
console.log(`[debug] STOPP criteria total: ${stoppCriteria.length}, con dx codes: ${stoppWithDx.length}`);

// ── 5. Build derived map ───────────────────────────────────────────────────────
function buildMap(includeExcludeClasses) {
  const byCode = new Map();
  for (const c of stoppCriteria) {
    const dxCodes = extractPositiveDxCodes(c.logic);
    if (dxCodes.size === 0) continue;
    const drugClasses = extractDrugClasses(c.logic);
    const excludeClasses = includeExcludeClasses ? (c.excludes?.drugClasses ?? []) : [];
    for (const code of dxCodes) {
      const bucket = byCode.get(code) ?? new Set();
      drugClasses.forEach(cls => bucket.add(cls));
      excludeClasses.forEach(cls => bucket.add(cls));
      byCode.set(code, bucket);
    }
  }
  const result = {};
  for (const [code, classes] of byCode) {
    const label = reverseMap[code];
    if (!label || anchorLabels.has(label)) continue;
    if (classes.size === 0) continue;
    result[label] = [...classes].sort();
  }
  return result;
}

const withExcl = buildMap(true);
const withoutExcl = buildMap(false);

console.log(`[debug] Entries with=true: ${Object.keys(withExcl).length}, with=false: ${Object.keys(withoutExcl).length}`);

// ── 6. Diff ────────────────────────────────────────────────────────────────────
const allLabels = new Set([...Object.keys(withExcl), ...Object.keys(withoutExcl)]);

const diffs = [];
const same = [];

for (const label of [...allLabels].sort()) {
  const wCls = new Set(withExcl[label] ?? []);
  const woCls = new Set(withoutExcl[label] ?? []);
  // Clases presentes CON excludes pero NO sin excludes = "perdidas" al pasar a false
  const lostWhenFalse = [...wCls].filter(c => !woCls.has(c)).sort();
  // Clases presentes SIN excludes pero NO con excludes (no debería ocurrir)
  const gainedWhenFalse = [...woCls].filter(c => !wCls.has(c)).sort();

  if (lostWhenFalse.length === 0 && gainedWhenFalse.length === 0) {
    same.push(label);
  } else {
    diffs.push({ label, lostWhenFalse, gainedWhenFalse, wCls: [...wCls].sort(), woCls: [...woCls].sort() });
  }
}

// ── 7. Para cada clase perdida, buscar cobertura en lógica positiva ──────────
function criteriaForDx(dxLabel) {
  const code = diagMap[dxLabel];
  if (!code) return [];
  return stoppCriteria.filter(c => extractPositiveDxCodes(c.logic).has(code));
}

function classInPositiveLogic(criterion, cls) {
  return extractDrugClasses(criterion.logic).has(cls);
}

// ── 8. Reporte ─────────────────────────────────────────────────────────────────
console.log('\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  DIFF: includeExcludeClasses=TRUE → FALSE');
console.log('  Clases que se pierden al pasar a false (solo venían de excludes)');
console.log('═══════════════════════════════════════════════════════════════\n');

if (diffs.length === 0) {
  console.log('✅ Ningún dx afectado. Cambio de default a false es completamente seguro.\n');
} else {
  const infraGatings = [];

  for (const { label, lostWhenFalse, gainedWhenFalse, wCls, woCls } of diffs) {
    console.log(`\n🔸 ${label}`);
    console.log(`   CON excludes  (true):  [${wCls.join(', ')}]`);
    console.log(`   SIN excludes (false):  [${woCls.join(', ')}]`);
    if (gainedWhenFalse.length > 0) {
      console.log(`   ⁉️  Clases EXTRA sin excludes (inesperado): ${gainedWhenFalse.join(', ')}`);
    }
    if (lostWhenFalse.length > 0) {
      console.log(`   ─ Clases perdidas:`);
      const critsForDx = criteriaForDx(label);
      for (const cls of lostWhenFalse) {
        const coveredBy = critsForDx.filter(c => classInPositiveLogic(c, cls));
        const inExclOf = critsForDx.filter(c => (c.excludes?.drugClasses ?? []).includes(cls));
        if (coveredBy.length > 0) {
          console.log(`     ✅ ${cls} — cubierta en lógica+ de: ${coveredBy.map(c => c.id).join(', ')}`);
        } else {
          console.log(`     ❌ ${cls} — NO cubierta por lógica+ de ningún criterio STOPP para "${label}"`);
          if (inExclOf.length > 0) {
            console.log(`        (aparece en excludes.drugClasses de: ${inExclOf.map(c => c.id).join(', ')})`);
            // Qué dices ese criterio (summary)
            for (const c of inExclOf) console.log(`        → "${c.summary}"`);
          }
          console.log(`        → ⚠️  INFRA-GATING NUEVO: sin override, este dx ya no exige ${cls}`);
          infraGatings.push({ label, cls, viaExcludesOf: inExclOf.map(c => c.id) });
        }
      }
    }
  }

  // Resumen final
  console.log('\n───────────────────────────────────────────────────────────────');
  console.log(`  Diagnósticos afectados: ${diffs.length}`);
  console.log(`  Diagnósticos sin cambio: ${same.length}`);
  if (infraGatings.length > 0) {
    console.log(`\n  ❌ INFRA-GATINGS NUEVOS — clases sin cobertura en lógica positiva (${infraGatings.length}):`);
    for (const { label, cls, viaExcludesOf } of infraGatings) {
      console.log(`     • "${label}" pierde requerimiento de ${cls} (solo venía via excludes de ${viaExcludesOf.join(', ')})`);
    }
    console.log('\n  Estos dx necesitan un override explícito si queremos mantener el gating.');
  } else {
    console.log('\n  ✅ Todas las clases perdidas están cubiertas por lógica+ de otro criterio STOPP.');
    console.log('     Cambio de default a false es clínicamente seguro.');
  }
}

console.log('\n═══════════════════════════════════════════════════════════════\n');
