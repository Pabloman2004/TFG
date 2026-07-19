# Informe de ronda — Pendientes de relevancia clínica y catálogo (2026-07-17)

Ronda cerrada por el orquestador de revisión. Tres secciones delegadas y
aprobadas (manifiesto: `manifiesto-revision-pendientes-relevancia.md`).
Solo análisis: no se modificó código en esta ronda.

**Corrección transversal del orquestador:** los informes de sección citaban
comandos `npx vitest run …`; este repo usa **Karma + Jasmine** (builder
`@angular/build:karma`, `angular.json:81`). El equivalente correcto es
`ng test --include='**/<spec>.spec.ts'`.

## Veredicto global

**Ningún bug de implementación estricto.** Los 9 puntos se confirman como
reales, pero todos son decisiones de diseño/producto pendientes o deuda
inocua, no defectos que rompan la app.

## Sección A — Relevancia de diagnósticos (puntos 1–5)

1. **Expansiones SYSTEM_TO_TABS — CONFIRMADO.** SNC → 3 tabs, Endocrino,
 Urogenital, Musculoesquelético y Anticoagulantes → 2 tabs cada uno
 (`system-relevance.ts:22-36`). Psicosis (STOPP-D21, criterio puramente
 psiquiátrico) aflora en Neurológico; Vaginitis atrófica (START-I3) aflora
 en Urológico incluso con paciente varón (el índice ignora el sexo aunque
 el criterio exige `sex == "f"`).
  - *Comprobar:* tab Neurológico → buscar "Psicosis"; tab Urológico con
   varón → "Vaginitis atrófica sintomática" visible.
2. **Sistemas transversales — CONFIRMADO, el caso más ruidoso.** Analgésicos,
 Riesgo de caídas, Carga anticolinérgica e Indicación expanden a TODOS los
 tabs (`system-relevance.ts:32-35`, comodín `*`). Las clases tienen filtro
 "específico" (`specificClassesByTab`) pero los diagnósticos NO: el bloque
 "Relevantes de otros sistemas" del tab Renal es 100 % de origen
 transversal (Artrosis, Dolor neuropático, Caídas, HBP, HTA).
  - *Comprobar:* tab Renal → "Relevantes de otros sistemas" lleno de
   diagnósticos sin relación renal.
3. **egfrBelow en E1–E10 — HUECO CONFIRMADO (sin romper la UI actual).** Los
 10 criterios usan solo `egfrBelow`; el extractor no lo entiende, así que
 aportan cero diagnósticos al índice, aunque el operador equipara
 `enfermedad_renal_grave` (&lt;30) e `insuficiencia_renal_terminal` (&lt;15)
 (`criteria-engine.service.ts:254-269`). El campo `relevance` existe pero
 solo admite `medicationClasses` (`types.ts:33-35`) — no hay vía
 declarativa para diagnósticos. Dos soluciones posibles: ampliar
 `relevance` con `diagnoses`, o enseñar `egfrBelow` al extractor.
  - *Comprobar:* marcar "Enfermedad renal grave" + Metformina dispara
   STOPP-E6 (el motor sí funciona), pero ese diagnóstico no aparece como
   relevante en ningún tab distinto de Renal.

## Sección B — Catálogo y taxonomía (puntos 6–8)

4.  **Renombrar "Antibióticos" → "Antiinfecciosos" — solo presentación.**  
 Cambio funcional único: `medications-taxonomy.ts:180` (el `id:  'antibioticos'` NO cambia; toda la lógica va por id). Además:
 `scripts/gen-checklist-tabs.js:88` y `:279` (espejo del label) y regenerar
 los checklists de `plans/`. El fixture de
 `group-visibility.spec.ts:175` no se rompe (autocontenido).

- *Comprobar:* selector de categoría del paso Medicamentos: hoy
 "Antibióticos" contiene Antifúngicos y Antipalúdicos (incoherencia
 visible que motiva el renombrado).

`**additionalCategories` — campo muerto en producción.** Declarado en
 `medications-taxonomy.ts:13` y asignado en 17 grupos (15 con
 `['cardiovascular']`, 2 con `['anticoagulantes']`); nadie en `src/app` lo
 lee — la visibilidad cross-tab la gobierna el índice de relevancia. Único
 lector: `scripts/gen-checklist-tabs.js:104`, sobre su propia copia espejo
 de los datos. Coherente con MEMORY.md ("concepto eliminado, pendiente
 borrar rastros"). Si se borra, decidir qué hace el script generador.

