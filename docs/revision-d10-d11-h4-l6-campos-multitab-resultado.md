# Resultado — D10/D11 diagnósticos, H4/L6 ubicación, campos multi-tab

**Manifiesto:** `docs/revision-d10-d11-h4-l6-campos-multitab.md`  
**Fecha cierre:** 2026-07-18  
**Orquestador:** `orquestador-revision`  
**Suite final (orquestador):** `npx ng test --watch=false --browsers=ChromeHeadless` → **669 SUCCESS**

## Resumen

| ID | Estado | Qué se hizo |
|----|--------|-------------|
| A1 | Corregido | Insomnio se habilita al marcar benzodiacepina |
| A2 | Corregido | Insomnio se habilita al marcar hipnótico-Z |
| B1 | DUDA abierta | 3 opciones sobre dónde vive el corticoide vs AR — sin decisión |
| B2 | Corregido | Paracetamol / Analgésicos simples visibles en Osteo |
| C1 | Corregido | Campos dosis/duración en todos los tabs donde está el fármaco |
| C2 | Corregido (vía C1) | Días del corticoide en Resp/Endo, no solo Osteo |
| C3 | Verificado | Umbrales D10/D11/H4/L6 OK en motor; sin código nuevo |

## Corregidos — cómo

### A1 + A2 — Insomnio sombreado con benzo / Z

**Causa:** `extractDrugClasses` en `dx-dependencies.ts` solo parseaba `inDrugClass`. D10/D11 usan `medicationClassDurationAbove`, así que `BENZODIACEPINA` / `HIPNOTICO_Z` no entraban en los triggers de Insomnio y el checkbox seguía deshabilitado.

**Fix:** reconocer también `medicationClassDurationAbove` (1.er argumento = clase).

**Ficheros:** `src/app/core/data/dx-dependencies.ts`, `dx-dependencies.spec.ts`

### B2 — Analgésicos simples en Osteo (L6)

**Causa:** el grupo ya estaba en taxonomía Osteo, pero L6 tenía `system: Analgésicos` (transversal) y operador `medicationClassDoseMgAbove` no extraído → la clase no entraba en relevancia específica del tab → el grupo iba a «Otros».

**Fix:** patrón E1 — `system` → `"Sistema musculoesquelético"` + `"relevance": {"medicationClasses":["ANALGESICO_SIMPLE"]}` en L6.

**Ficheros:** `src/assets/data/criteria.json`, tests taxonomy + group-visibility

### C1 + C2 — Campos hardcodeados por tab

**Causa:** inputs en `meds-step.component.html` atados a `@if (activeCategoryId() === 'renal'|'osteo'|…)` en vez de a meds visibles en el tab activo. Digoxina solo en Renal; corticoide días solo en Osteo (síntoma H4).

**Fix:** módulo `clinical-capture.ts` data-driven por clase; panel unificado en el tab donde el med es visible (propio o foráneo relevante). TFGe sigue solo en Renal.

**Ficheros:** `src/app/core/clinical-capture.ts` (+ spec), `meds-step.component.{ts,html,spec.ts}`, `docs/flujo-pasos.md`, `docs/_map.md`

## Verificados / descartados

- **C3:** umbrales motor confirmados (D10/D11 14 vs 13; H4 91 vs 90; L6 3000 vs 2999; sin dx asociado no disparan). Suite focalizada D/H/L: 118 SUCCESS. Sin cambios de código.

## Dudas pendientes (decisión humana)

### B1 — Dónde vive el corticoide sistémico vs AR (H4)

Opciones investigadas (detalle en `docs/proceso/informe-revision-d10-d11-h4-l6-seccion-b.md`):

1. Añadir corticoide también como grupo propio en Osteo.
2. Mantener solo Resp/Endo; no exigir Osteo (C1/C2 ya alinean el campo días).
3. Split intencional marca/días con hints de UX.

**No se eligió ganadora.** Tras C1/C2, la opción 2 es viable sin cambio de taxonomía (el campo días ya aparece donde se marca el corticoide).

## Informes de sección (aprobados)

- `docs/proceso/informe-revision-d10-d11-h4-l6-seccion-a.md`
- `docs/proceso/informe-revision-d10-d11-h4-l6-seccion-b.md`
- `docs/proceso/informe-revision-d10-d11-h4-l6-seccion-c.md`
- Progreso: `docs/proceso/progreso-ronda.md`

## Ficheros de producción/test tocados en esta ronda

- `src/app/core/data/dx-dependencies.ts` / `.spec.ts`
- `src/assets/data/criteria.json` (L6)
- `src/app/core/clinical-capture.ts` / `.spec.ts` (nuevo)
- `src/app/steps/meds-step/meds-step.component.{ts,html,spec.ts}`
- `src/app/core/data/medications-taxonomy.spec.ts`
- `src/app/core/group-visibility.spec.ts`
- `docs/flujo-pasos.md`, `docs/_map.md`
