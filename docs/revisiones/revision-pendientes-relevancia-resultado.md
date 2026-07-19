# Resultado — pendientes de relevancia visual y taxonomía

Manifiesto: `docs/revisiones/revision-pendientes-relevancia.md`.

## Corregidos

| ID | Qué se hizo |
|----|-------------|
| R1 | Añadido `specificDxsByTab` (espejo de clases). `computeDxGroupBuckets` usa solo ese mapa para «Relevantes de otros sistemas», así los transversales dejan de inundar tabs como Renal. |
| R2 | En sistemas multi-tab, cada diagnóstico se indexa solo en su tab de origen si ese tab está entre los mapeados (Psicosis → Psiquiátrico; Vaginitis → Ginecológico). Si el origen no está en el mapeo, se mantiene la expansión completa. |
| R3 | `extractReferences` interpreta `egfrBelow`: umbral ≥30 → `enfermedad_renal_grave`; ≥15 → `insuficiencia_renal_terminal`. |
| T1 | Rótulo del tab `antibioticos`: «Antibióticos» → «Antiinfecciosos» (id interno sin cambios). |
| T2 | Eliminado `additionalCategories` del tipo `DrugGroup` y de los grupos; docs alineados. |

## Verificados / descartados

Ninguno.

## Dudas pendientes

Ninguna en este manifiesto.

## Estado de tests

- Suite: `636 SUCCESS` (`npx ng test --watch=false --browsers=ChromeHeadless`).
- Linked Chunks: `OK: todo limpio (0 problemas)` tras excluir los manifiestos
  de revisión del patrón.

## Ficheros modificados

- `src/app/core/data/system-relevance.ts` (+ spec)
- `src/app/core/group-visibility.ts` (+ spec)
- `src/app/core/data/medications-taxonomy.ts` (+ spec)
- `src/app/steps/meds-step/meds-step.component.spec.ts`
- `docs/motor-criterios.md`, `docs/catalogo-clinico.md`, `docs/_map.md`
- `docs/proceso/REVIEW.md`, `docs/revisiones/revision-prueba-manual-visibilidad-multiclase.md`
- `docs/revisiones/revision-pendientes-relevancia.md` (manifiesto)
- `docs/revisiones/revision-pendientes-relevancia-resultado.md` (este informe)
