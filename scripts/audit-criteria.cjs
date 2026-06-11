// @linked docs/motor-criterios.md
// Si cambias la estructura de criteria.json, medications.ts o diagnoses.ts, actualiza el doc enlazado.

// One-shot audit script — not for production. Run with: node scripts/audit-criteria.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const criteria = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/assets/data/criteria.json'), 'utf8')).criteria;
const medsTs = fs.readFileSync(path.join(ROOT, 'src/app/core/data/medications.ts'), 'utf8');
const dxTs = fs.readFileSync(path.join(ROOT, 'src/app/core/data/diagnoses.ts'), 'utf8');

// Extract all drug classes appearing in MEDICATIONS (the source of truth for what a med has)
const validClasses = new Set();
for (const m of medsTs.matchAll(/drugClasses:\s*\[([^\]]+)\]/g)) {
  for (const c of m[1].matchAll(/"([^"]+)"/g)) validClasses.add(c[1]);
}

// Extract diagnosis codes from DIAGNOSIS_MAP (right side of pairs)
const validDxCodes = new Set();
{
  const mapMatch = dxTs.match(/export const DIAGNOSIS_MAP[^{]*\{([\s\S]*?)\};/);
  if (mapMatch) {
    for (const m of mapMatch[1].matchAll(/:\s*"([a-z0-9_]+)"/g)) validDxCodes.add(m[1]);
  }
}

// Walk logic for inDrugClass / in[code, {var:"diagnoses"}] / in[name, {var:"medications"}]
function walk(node, acc) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { for (const x of node) walk(x, acc); return; }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'inDrugClass' && Array.isArray(v) && typeof v[0] === 'string') {
      acc.classes.add(v[0]);
    } else if (k === 'in' && Array.isArray(v) && typeof v[0] === 'string' && v[1] && typeof v[1] === 'object' && v[1].var === 'diagnoses') {
      acc.diagnoses.add(v[0]);
    } else if (k === 'in' && Array.isArray(v) && typeof v[0] === 'string' && v[1] && typeof v[1] === 'object' && v[1].var === 'medications') {
      acc.medRefs.add(v[0]);
    } else {
      walk(v, acc);
    }
  }
}

const perCrit = [];
const noSystem = [];
const medRefsByCrit = []; // criteria that reference meds individually (not via class)
const allSystems = new Map(); // system -> count

for (const c of criteria) {
  const acc = { classes: new Set(), diagnoses: new Set(), medRefs: new Set() };
  walk(c.logic, acc);
  const entry = { id: c.id, system: c.system, classes: [...acc.classes], diagnoses: [...acc.diagnoses], medRefs: [...acc.medRefs] };
  perCrit.push(entry);
  if (!c.system) noSystem.push(c.id);
  if (acc.medRefs.size > 0) medRefsByCrit.push(entry);
  if (c.system) allSystems.set(c.system, (allSystems.get(c.system) ?? 0) + 1);
}

// Aggregate referenced classes / diagnoses
const refClasses = new Map(); // class -> [critIds]
const refDxs = new Map();
for (const e of perCrit) {
  for (const cls of e.classes) {
    if (!refClasses.has(cls)) refClasses.set(cls, []);
    refClasses.get(cls).push(e.id);
  }
  for (const dx of e.diagnoses) {
    if (!refDxs.has(dx)) refDxs.set(dx, []);
    refDxs.get(dx).push(e.id);
  }
}

const unknownClasses = [...refClasses.keys()].filter(c => !validClasses.has(c));
const unknownDxs = [...refDxs.keys()].filter(d => !validDxCodes.has(d));

// Output
console.log('=== 1) UNIQUE `system` VALUES ===');
[...allSystems.entries()].sort((a,b)=>b[1]-a[1]).forEach(([s,n]) => console.log(`  ${n.toString().padStart(3)}  ${s}`));
console.log(`  TOTAL CRITERIA: ${criteria.length}\n`);

console.log('=== 2) PER-CRITERION SUMMARY (first 5 + last 3 for sample) ===');
const sample = [...perCrit.slice(0, 5), null, ...perCrit.slice(-3)];
for (const e of sample) {
  if (e === null) { console.log('  ...'); continue; }
  console.log(`  ${e.id}`);
  console.log(`    system    : ${e.system}`);
  console.log(`    classes   : ${e.classes.join(', ') || '—'}`);
  console.log(`    diagnoses : ${e.diagnoses.join(', ') || '—'}`);
  if (e.medRefs.length) console.log(`    medRefs   : ${e.medRefs.join(', ')}`);
}
console.log(`  (Showing 8 of ${perCrit.length}. Full data exported below if requested.)\n`);

console.log('=== 3) INCONSISTENCIES ===\n');

console.log(`-- Criteria without "system" field --`);
console.log(noSystem.length === 0 ? '  NONE\n' : `  ${noSystem.length} found:\n${noSystem.map(x=>'    '+x).join('\n')}\n`);

console.log(`-- Criteria referencing individual medications (not via class) --`);
if (medRefsByCrit.length === 0) console.log('  NONE\n');
else {
  console.log(`  ${medRefsByCrit.length} criteria reference medications by name in logic:`);
  for (const e of medRefsByCrit) console.log(`    ${e.id}  →  meds: ${e.medRefs.join(', ')}`);
  console.log('');
}

console.log(`-- Drug classes referenced in criteria but UNKNOWN in medications.ts --`);
if (unknownClasses.length === 0) console.log('  NONE\n');
else {
  for (const cls of unknownClasses.sort()) {
    console.log(`  ${cls}`);
    for (const cid of refClasses.get(cls)) console.log(`    used by: ${cid}`);
  }
  console.log('');
}

console.log(`-- Diagnosis codes referenced in criteria but UNKNOWN in DIAGNOSIS_MAP --`);
if (unknownDxs.length === 0) console.log('  NONE\n');
else {
  for (const dx of unknownDxs.sort()) {
    console.log(`  ${dx}`);
    for (const cid of refDxs.get(dx)) console.log(`    used by: ${cid}`);
  }
  console.log('');
}

console.log('=== 4) COVERAGE SUMMARY ===');
console.log(`  Distinct drug classes in MEDICATIONS  : ${validClasses.size}`);
console.log(`  Distinct drug classes used in criteria: ${refClasses.size}`);
console.log(`  Distinct diagnosis codes in DIAGNOSIS_MAP : ${validDxCodes.size}`);
console.log(`  Distinct diagnosis codes used in criteria : ${refDxs.size}`);
const unusedClasses = [...validClasses].filter(c => !refClasses.has(c));
const unusedDxs = [...validDxCodes].filter(d => !refDxs.has(d));
console.log(`  Classes declared but UNUSED in criteria   : ${unusedClasses.length}`);
if (unusedClasses.length) console.log(`    ${unusedClasses.sort().join(', ')}`);
console.log(`  Diagnoses declared but UNUSED in criteria : ${unusedDxs.length}`);
if (unusedDxs.length) console.log(`    ${unusedDxs.sort().join(', ')}`);

console.log('\n=== 5) CLASSES BY SYSTEM (relevance preview) ===');
const bySystem = new Map();
for (const e of perCrit) {
  if (!e.system) continue;
  if (!bySystem.has(e.system)) bySystem.set(e.system, { classes: new Set(), dxs: new Set() });
  e.classes.forEach(c => bySystem.get(e.system).classes.add(c));
  e.diagnoses.forEach(d => bySystem.get(e.system).dxs.add(d));
}
for (const [sys, sets] of [...bySystem.entries()].sort()) {
  console.log(`  [${sys}]`);
  console.log(`    classes (${sets.classes.size}): ${[...sets.classes].sort().join(', ') || '—'}`);
  console.log(`    dxs     (${sets.dxs.size}): ${[...sets.dxs].sort().join(', ') || '—'}`);
}
