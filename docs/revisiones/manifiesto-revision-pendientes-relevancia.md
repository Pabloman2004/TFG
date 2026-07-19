# Manifiesto de revisión — Pendientes de relevancia clínica y catálogo (2026-07-17)

Ronda de revisión sobre los 9 puntos pendientes reportados tras el trabajo de
visibilidad multiclase y relevancia por sistema. Objetivo por punto: (a) resumen
de lo hecho, (b) detección de bugs, (c) pasos de comprobación manual rápida.

## Sección A — Relevancia de diagnósticos y extractor (`system-relevance.ts`, `criteria.json`)

1. **Condiciones negadas**: ¿el extractor registra referencias bajo `!`/negación
   (p. ej. "no artrosis", "no dolor neuropático") como relevantes en
   "Relevantes de otros sistemas"? Determinar si debe ignorarlas.
2. **Expansiones SNC / Urogenital / Endocrino**: ¿`SYSTEM_TO_TABS` expande un
   diagnóstico mono-tab (psicosis → Neurológico, vaginitis → Urológico) a tabs
   de más?
3. **Sistemas transversales** (Analgésicos, Caídas…): ¿Dolor neuropático o
   Caídas aparecen en tabs sin relación clara (p. ej. Renal)?
4. **Efectos extrapiramidales en Psiquiátrico**: ¿aparece como relevante desde
   Neurológico? Anotar para decisión clínica.
5. **Dependencias implícitas de `egfrBelow`**: E1–E10 usan TFGe y diagnósticos
   renales que el índice no registra. Verificar el hueco y opciones (campo
   `relevance` del criterio vs. enseñar al extractor `egfrBelow`).

## Sección B — Catálogo de medicamentos y taxonomía (`medications-taxonomy.ts`, catálogo)

6. **Paroxetina / Fluvoxamina**: aparecen en `excludes` de criterios ISRS pero
   no en `MEDICATIONS`. Confirmar y valorar: añadirlas al catálogo o retirarlas
   de `excludes`.
7. **Renombrar "Antibióticos" → "Antiinfecciosos"**: solo label de tab en
   `medications-taxonomy.ts` + docs/checklist. Verificar dónde toca.
8. **`additionalCategories`**: campo sin uso en grupos de medicamentos.
   Confirmar que nada lo lee y opciones (conectar a visibilidad o borrar).

## Sección C — Verificación automática

9. **Mutation testing**: confirmar que no hay runner (Stryker u otro) en el
   repo y qué haría falta para ejecutarlo sobre `group-visibility` /
   `system-relevance`.

## Reglas de la ronda

- Solo análisis y verificación: **no se cambia código** en esta ronda.
- Cada sección entrega: estado actual verificado en código/tests, bugs con
  `fichero:línea`, y comprobación manual (UI o test) reproducible en <2 min.
- El orquestador de revisión aprueba cada informe antes de cerrar la ronda.
