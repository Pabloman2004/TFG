# Revisión general del proyecto — Resultado consolidado (ronda 2026-07-17)

- **Manifiesto:** `docs/proceso/manifiesto-revision-general-2026-07-17.md`
- **Informes de sección** (todos revisados y aprobados por el orquestador):
  - A — Motor de criterios y datos clínicos: `docs/proceso/informe-revision-general-seccion-a.md`
  - B — Servicios de aplicación y UI: `docs/proceso/informe-revision-general-seccion-b.md`
  - C — Coherencia documental: `docs/proceso/informe-revision-general-seccion-c.md`
  - D — Inventario y reorganización de `.md`: `docs/proceso/informe-revision-general-seccion-d.md`
- **Modo de la ronda:** solo análisis. No se ha cambiado código ni movido/borrado
  ningún fichero. Todo lo de abajo es propuesta pendiente de decisión.
- **Verificación del orquestador:** hallazgos de severidad alta re-comprobados
  de forma independiente sobre el código (A1, A2, B1, B3 confirmados).

Totales: **48 hallazgos** (A: 20, B: 15, C: 13) + inventario completo de los
55 `.md` con veredicto por fichero (D). Severidad: **6 altas, 19 medias,
23 bajas** (C1/C2 documentales cuentan como altas por riesgo de pérdida de
información/decisiones erróneas).

---

## 1. Bugs de severidad ALTA

| Id | Resumen | Evidencia |
|----|---------|-----------|
| A1 | STOPP-C12 dispara sin que el paciente tome ISRS: la lógica solo exige anticoagulante + antecedentes de sangrado | `criteria.json:456` |
| A2 | START-I3/I4 inalcanzables: comparan `info.sex` con `"f"` pero el tipo es `'F' \| 'M'` y `normalizeCase` no normaliza `info` | `criteria.json:1640,1647`, `types.ts:4` |
| A3 | STOPP-B20-ANTIHIPERTENSIVO solo evalúa la clase ANTIHIPERTENSIVO_CENTRAL aunque summary/excludes prometen también diuréticos y alfabloqueantes | `criteria.json:316-322` |
| B1 | El historial es una feature inaccesible: nada llama a `saveToHistory()` y ningún template enlaza `/historial` | `case-store.service.ts:114` |
| C1 | `TASKS.md` marca T7 (borrar `app.ts`/`app.config.ts`…) como hecha pero nunca se ejecutó; los 5 ficheros siguen ahí | `TASKS.md:36` |
| C2 | La copia canónica `docs/dudas-raquel-pendientes.md` está atrasada: las §9–§10 (anclas dx, overrides CV) solo existen en la copia de raíz; borrar la raíz sin fusionar pierde las preguntas para Raquel | hashes `f961252` vs `3fea4fc` |

## 2. Bugs de severidad MEDIA (resumen; detalle en los informes)

**Motor de criterios (A):**
- A4 — D12 penaliza quetiapina/clozapina (las excepciones de STOPP v3); excludes contradicen el summary.
- A5 — C16 (AAS prevención primaria) no niega `cardiopatia_isquemica` ni `ictus_previo`: falso positivo en prevención secundaria.
- A6 — J3 usa BETABLOQUEANTE completo en vez de BETABLOQUEANTE_NO_CARDIOSELECTIVO: bisoprolol dispara.
- A7 — B6 dispara con cualquier ANTIARITMICO (flecainida), no solo amiodarona.
- A8 — Checkbox inertes: `prostatismo_retencion_urinaria` no equivale a los códigos que evalúan D1/D4; `aneurisma_aortico` sin referencia alguna.
- A9 — K8-PSICOTROPICO/K11 usan `riesgo_caidas_repeticion`; el resto de la sección K usa `caidas_repeticion`.
- A10 — C4 greya todos los anticoagulantes en FA+antiagregante, justo cuando START-C1/C7 recomiendan anticoagular.
- A11 — `extractReferences` no ve clases en operadores custom; el parche `relevance.medicationClasses` solo cubre 3 de ~19 criterios afectados.
- A12 — `excludes` con fármacos inexistentes en catálogo (Paroxetina, Fluvoxamina) en A3-ISRS/C12/D7.
- A13 — START-H2 sin condición de duración: una pauta corta de corticoide dispara protección ósea.
- A14 — I7 usa la clase ISRN completa (venlafaxina dispara un criterio de duloxetina); único STOPP sin `excludes`.

**Servicios y UI (B):**
- B2 — Validación de import incompleta: `info` sin validar, `reviewedMedTabs` no-array provoca TypeError con carga parcial del estado.
- B3 — Doble conteo del diagnóstico "Otro" en badges de grupo y tab (+ fila fantasma "otro").
- B4 — `copyCriteria()` sin manejo del rechazo de `navigator.clipboard.writeText`.
- B5 — Shell con UI muerta e inyección load-bearing oculta de `DisplaySettingsService`.
- B6 — Doble raíz: `app.ts`/`app.config.ts` muertos con providers divergentes del bootstrap real.
- B7 — Estado muerto persistido (`results`, `activeSystem`) y computeds/effects sin uso en ambos steps.

**Documentación (C):**
- C3 — `REVIEW.md` raíz describe `additionalCategories` que ya no existe (la copia viva es `docs/proceso/REVIEW.md`).
- C4/C5/C6 — `docs/historial.md`, `docs/navegacion-y-shell.md` y `docs/_map.md` siguen describiendo el bug de la ruta `/historial` ya corregido (contradicciones internas incluidas).
- C7 — `MEMORY.md` (raíz) con cabecera atrasada, "BUG bloqueante" parcialmente falso y contradicción interna sobre PROMPT 6.
- C8 — TASKS.md T12 pendiente pero ya implementada (con fallback `'Fecha desconocida'` en vez de `'—'`).
- D-extra — 4 docs de primer nivel sin whitelist ni `@linked` disparan DOC_HUERFANO en `check-links.sh`.

## 3. Bugs de severidad BAJA

Detalle en los informes: A15–A20 (código muerto `normalizeCriterion` con deep-clone
de 216 criterios por evaluación, B16 inerte sin formulario de paciente, comentarios
erróneos en `dx-dependencies-overrides.ts` y `group-visibility.ts`, 16 clases sin
criterio — DHP y sales de calcio decorativos —, variantes HTA desiguales),
B8–B15 (localStorage sin try/catch en display-settings, sexo `null` → "Hombre",
diálogo de borrado engañoso, accesibilidad de filas/toggles/tooltip, `$any()` ×9,
`revokeObjectURL` síncrono, `version` de export sin interpretar, anti-patrones de
test), C9–C13 (snapshots de `analysis/` obsoletos, `AGENTS.md` con tamaño de suite
viejo, enlaces rotos en plan de Cursor, duplicados sin referencias, manifiesto de
la ronda anterior sin trackear).

---

## 4. Plan de acción propuesto

Cada fase deja el proyecto en verde y es committeable por separado. Bajo las
normas del proyecto, cada fix de código entra por TDD (test que reproduce el
bug primero).

### Fase 1 — Correcciones clínicas del motor (impacto en recomendaciones)
1. **A1**: añadir cláusula `inDrugClass(ISRS)` a STOPP-C12 + test del caso "anticoagulante + antecedentes sin ISRS".
2. **A2**: normalizar `info.sex` en `normalizeCase` (o usar `'F'` en el JSON) + tests de START-I3/I4.
3. **A3**: convertir la lógica de B20-ANTIHIPERTENSIVO en `or` sobre las 4 clases (patrón K3).
4. **A5, A6, A7, A14**: afinar clases/negaciones (C16 ampliar negados; J3 → NO_CARDIOSELECTIVO; B6 → solo Amiodarona; I7 → decisión: duloxetina sola o summary genérico ISRN).
5. **A4**: decidir con criterio clínico (Raquel) el tratamiento de quetiapina/clozapina en D12 y alinear summary/excludes.
6. **A9**: unificar `caidas_repeticion`/`riesgo_caidas_repeticion` (o `or` uniforme en toda la sección K).
7. **A10**: cambiar el exclude de C4 al antiagregante (patrón C5).
8. **A13**: añadir `medicationClassDurationAbove` a START-H2 (patrón H4).
9. **Nuevas specs I/J/K/M** — las 4 secciones sin spec propia concentran A2, A6, A9 y A14.

### Fase 2 — Robustez del motor y datos
10. **A11**: enseñar los operadores custom a `extractReferences` y retirar los parches `relevance.medicationClasses`.
11. **A8 + A12 + A19**: guard automático catálogo↔criterios (spec de datos: ids de excludes existen, clases con miembros, dx referenciados) y decidir destino de los checkbox/fármacos inertes.
12. **A15**: eliminar `normalizeCriterion`/`normalizeLogic` (o moverlas a `loadCriteria` una sola vez).
13. **A20**: política documentada de variantes HTA por criterio.

### Fase 3 — Bugs de aplicación
14. **B1**: decidir destino del historial — conectar (botón guardar + enlace de navegación; la infraestructura existe y está testeada) o eliminar la feature. Decisión del usuario.
15. **B2 + B14**: schema (Zod o guards completos) en la frontera de import, con manejo de versión.
16. **B3**: excluir `__otro` en `customDxFor` (patrón ya usado en meds-step).
17. **B4, B8, B9, B10**: manejo de errores de portapapeles/localStorage, sexo `null`, diálogo de confirmación parametrizable.
18. **B5 + B6 + B7 (+ C1/T7)**: limpieza del código muerto del shell y del estado muerto del store — cierra de verdad la tarea T7 de TASKS.md; proteger con test/comentario la inyección de `DisplaySettingsService`.
19. **B11 + B12**: accesibilidad de filas/toggles/tooltip y sustitución de los 9 `$any()`.

### Fase 4 — Documentación (rápida, sin riesgo)
20. **C2**: fusionar §9–§10 de `dudas-raquel-pendientes.md` (raíz) en `docs/` **antes** de borrar la raíz.
21. **C1 + C8**: corregir TASKS.md (T7 → `[ ]` o ejecutarla en Fase 3; T12 → `[x]` o reescribir contrato).
22. **C4, C5, C6, C7, C10**: actualizar las menciones al bug de `/historial` ya corregido en `docs/historial.md`, `docs/navegacion-y-shell.md`, `docs/_map.md`, `MEMORY.md` y el conteo de specs de `AGENTS.md`.
23. **C13**: commitear manifiesto/informes de la ronda anterior (y de esta) para no perder trazabilidad.
24. **C9**: marcar los `analysis/*.md` como snapshot histórico (lo resuelve la reorganización).

### Fase 5 — Reorganización de `.md` (sección 5 de este documento)

---

## 5. Reorganización de los `.md`

Inventario completo (55 ficheros, veredicto uno a uno, estructura de carpetas y
bloque de comandos `git mv`/`git rm` listo para ejecutar) en
`docs/proceso/informe-revision-general-seccion-d.md`. Resumen ejecutivo:

### Borrar (4 — duplicados de raíz; los canónicos quedan en `docs/`)
| Fichero | Motivo |
|---------|--------|
| `RALPH.md` | Idéntico byte a byte a `docs/proceso/RALPH.md` |
| `VERIFICATION.md` | Idéntico a `docs/proceso/VERIFICATION.md` |
| `STOPP_START_CRITERIOS_CONTEXTO.md` | Idéntico a `docs/STOPP_START_CRITERIOS_CONTEXTO.md` (la de docs/ es la referenciada por `check-links.sh`) |
| `REVIEW.md` | Copia atrasada (describe `additionalCategories`, ya eliminado); la viva es `docs/proceso/REVIEW.md` |

### Fusionar (4)
- `dudas-raquel-pendientes.md` (raíz) → volcar sobre `docs/dudas-raquel-pendientes.md` y borrar la raíz. **La raíz es la versión nueva** (§9–§10); no borrar sin fusionar (C2).
- `docs/revision-dosis-duracion-seccion-{inventario,lagunas}.md` → subsumidos por el `-resultado`; borrar solo tras confirmación de que no aportan nada extra.
- `plans/checklist-prueba-manual-cardiovascular.md` → subconjunto (45 de 216) del checklist maestro; borrar tras confirmar cobertura 1:1.

### Intocables (7 — tooling)
`CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `TASKS.md` y `scratchpad.md` (el loop
Ralph los exige en raíz y tiene tareas T12–T16 abiertas), `docs/_map.md` (ruta
cableada en `scripts/check-links.sh:15`), `.cursor/plans/*`.

**Restricción clave:** los 8 docs conceptuales de `docs/` (`caso-clinico`,
`catalogo-clinico`, `motor-criterios`, `flujo-pasos`, `historial`,
`informes-y-exportacion`, `navegacion-y-shell`, `accesibilidad-ui`) tienen 36
comentarios `@linked` en `src/` apuntando a su ruta exacta — **no se mueven**
en esta ronda.

### Estructura destino (el resto, 40 ficheros a conservar)
```
docs/
├── _map.md + 8 docs @linked          (sin mover)
├── clinico/                          STOPP_START_CRITERIOS_CONTEXTO, dudas-raquel (fusionado)
├── arquitectura/                     uml-diagrams
├── propuestas/                       propuesta-p14, propuesta-p15, plan-mejora-dosis-duracion, plan-visibilidad-multiclase
├── revisiones/                       todos los revision-*.md + manifiestos/informes de rondas cerradas + los 4 análisis/auditorías de plans/
├── historico/analysis/               los 6 snapshots de analysis/
└── proceso/                          solo la operación viva (RALPH, REVIEW, VERIFICATION, ronda actual)
plans/                                solo los 2 checklists activos
```

Al aplicarla: actualizar las 2 rutas significativas de `EXCLUDED_DOCS` en
`scripts/check-links.sh` y ejecutar `./scripts/check-links.sh` antes de
commitear (comandos exactos en el informe D, paso 9-11).

---

## 6. Decisiones que quedan en manos del usuario

1. **Historial (B1):** ¿conectar la feature o eliminarla?
2. **D12 (A4):** tratamiento clínico de quetiapina/clozapina — consultar con Raquel.
3. **I7 (A14):** ¿criterio solo para duloxetina o para toda la clase ISRN?
4. **Checkbox inertes (A8/A19):** ¿eliminar del catálogo o conectar a criterios?
5. **Formulario de paciente (A16/B16):** ¿crear step de datos (edad/sexo) o retirar B16/I3/I4 mientras tanto?
6. **Fusiones condicionales de la reorganización** (informes de sección dosis-duración, checklist CV).

---

## Adenda (2026-07-18) — impacto de la ronda d10-d11-h4-l6-campos-multitab

Tras el cierre de esta ronda, la ronda correctiva
`docs/revision-d10-d11-h4-l6-campos-multitab-resultado.md` aplicó fixes que el
orquestador ha verificado (diff revisado + suite completa **669 SUCCESS**):

- **A11**: parcialmente mitigado — el parche `relevance.medicationClasses`
  cubre ahora también L6 (el único caso con impacto visible); el problema
  estructural de `extractReferences` sigue abierto (mejora nº 10 del plan).
  El extractor gemelo de `dx-dependencies.ts` ya entiende
  `medicationClassDurationAbove`: sirve de patrón para el fix.
- **B12**: mayormente resuelto — `$any()` en meds-step baja de 9 a 2 al
  sustituirse los paneles hardcodeados por `clinical-capture.ts` (nuevo, con
  spec y datos inmutables).
- **Nuevo (menor)**: `medicationById`/`medicationsByClass`/`durationCaptureMeds`
  quedan sin uso en templates (solo specs) — sumar a la limpieza de la
  Fase 3, punto 18.
- **Docs**: `docs/flujo-pasos.md` y `docs/_map.md` actualizados
  coherentemente por la propia ronda (verificado). C13 se amplía: ya hay ~14
  `.md` y todo el código de la ronda sin commitear — **commitear es ahora el
  paso más urgente de la Fase 4**.
- Inventario de `.md`: 55 → **62** (adenda del informe D con veredictos).
- El resto de hallazgos y el plan de acción **no cambian**. Las adendas
  detalladas están al final de cada informe de sección.
