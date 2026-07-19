# Informe de sección D — Inventario y reorganización de `.md`

Ronda: revisión general 2026-07-17
(`docs/revisiones/manifiesto-revision-general-2026-07-17.md`).
Modo: solo análisis. No se ha movido, borrado ni renombrado ningún fichero;
este informe es el único artefacto escrito.

Inventario real: **55 ficheros `.md`** fuera de `node_modules`, `.git`,
`dist` y `.angular` (el manifiesto decía 54; el extra es
`scratchpad.md`, vacío, más el propio manifiesto sin commit).

## Hallazgos transversales (afectan a cualquier reorganización)

1. **Patrón Linked Chunks ata 9 docs a su ruta actual.**
   `scripts/check-links.sh:15` referencia `docs/_map.md` en ruta fija, y hay
   **36 comentarios `@linked docs/<concepto>.md`** en `src/` apuntando a los 8
   docs conceptuales (`accesibilidad-ui`, `caso-clinico`, `catalogo-clinico`,
   `flujo-pasos`, `historial`, `informes-y-exportacion`, `motor-criterios`,
   `navegacion-y-shell`). Moverlos rompe el script y los comentarios. Veredicto:
   **no se mueven en esta ronda** (una futura migración a `docs/arquitectura/`
   exigiría actualizar los 36 `@linked`, `_map.md` y el script a la vez).
2. **`check-links.sh` solo escanea `docs/*.md` de primer nivel** (CHECK 3,
   glob `docs/*.md` en `scripts/check-links.sh:201`). Mover docs a subcarpetas
   los saca del chequeo DOC_HUERFANO sin romper nada; las entradas de
   `EXCLUDED_DOCS` (líneas 185-198) que apunten a rutas movidas quedan muertas
   pero inocuas. Aun así los comandos finales las limpian.
3. **Bug latente detectado de paso** (severidad media, comprobación:
   `./scripts/check-links.sh`): hay 4 docs de primer nivel que NO están en
   `EXCLUDED_DOCS` ni tienen `@linked`
   (`docs/propuestas/plan-mejora-dosis-duracion-medicacion.md`,
   `docs/revisiones/revision-dosis-duracion-medicacion-resultado.md`,
   `docs/revisiones/revision-dosis-duracion-seccion-inventario.md`,
   `docs/revisiones/revision-dosis-duracion-seccion-lagunas.md`) → deberían disparar
   DOC_HUERFANO hoy. La reorganización propuesta (moverlos a subcarpetas) lo
   resuelve de raíz.
4. **Duplicados raíz vs docs, verificados con `git hash-object`:**
   - `STOPP_START_CRITERIOS_CONTEXTO.md` = `docs/clinico/STOPP_START_CRITERIOS_CONTEXTO.md`
     (hash `80e1ed1c`, **idénticos byte a byte**). La copia de `docs/` está
     referenciada por `scripts/check-links.sh:189` → borrar la de raíz.
   - `RALPH.md` = `docs/proceso/RALPH.md` (hash `d05c757f`, **idénticos**) →
     borrar la de raíz.
   - `VERIFICATION.md` = `docs/proceso/VERIFICATION.md` (hash `b4ef5fa6`,
     **idénticos**) → borrar la de raíz.
   - `REVIEW.md` (raíz, hash `bd871b48`) ≠ `docs/proceso/REVIEW.md`
     (`6b5781d0`). La de `docs/proceso/` es la viva (último commit
     2026-07-17; la raíz conserva un párrafo sobre `additionalCategories` ya
     retirado en la copia actualizada) → borrar la de raíz.
   - `dudas-raquel-pendientes.md` (raíz, `f9612529`) ≠
     `docs/clinico/dudas-raquel-pendientes.md` (`3fea4fc4`). **Aquí la viva es la de
     RAÍZ** (actualizada 2026-06-14, añade secciones 9 y 10 sobre
     dx-dependencies; la de `docs/` se quedó en 2026-05-22). Como
     `check-links.sh:190` referencia la ruta `docs/…` → FUSIONAR: volcar el
     contenido de raíz sobre la copia de `docs/` y borrar la de raíz.
5. **Tooling activo**: el loop Ralph (`docs/proceso/RALPH.md`) exige
   `TASKS.md` y `scratchpad.md` **en raíz**, y `TASKS.md` tiene aún **5 tareas
   pendientes** (T12-T16). Mientras no se cierre o descarte ese loop,
   `TASKS.md` y `scratchpad.md` son intocables. `.claude/` no existe en el
   repo; `angular.json` y `package.json` no referencian ningún `.md`.

## Tabla de inventario

Tamaños en bytes; fecha = último commit que tocó el fichero.

| # | Ruta | Tam. | Fecha | Propósito | Estado |
|---|------|------|-------|-----------|--------|
| 1 | `CLAUDE.md` | 7.8K | 2026-06-12 | Instrucciones de desarrollo para Claude Code (TDD, estilo) | VIVO |
| 2 | `AGENTS.md` | 1.7K | 2026-06-14 | Instrucciones para Cursor Cloud (descripción del proyecto, comandos) | VIVO |
| 3 | `MEMORY.md` | 19.8K | 2026-07-17 | Memoria de estado del proyecto para agentes (citada por informes de ronda) | VIVO |
| 4 | `TASKS.md` | 7.5K | 2026-07-17 | Cola de tareas del loop Ralph sobre REVIEW.md; **5 tareas [ ] pendientes** | VIVO |
| 5 | `scratchpad.md` | 0 | 2026-06-14 | Scratch del loop Ralph (vacío; el loop lo exige en raíz) | VIVO |
| 6 | `RALPH.md` | 3.2K | 2026-06-14 | Cómo lanzar el loop Ralph | DUPLICADO (= `docs/proceso/RALPH.md`) |
| 7 | `REVIEW.md` | 9.7K | 2026-06-14 | Consolidado de hallazgos de `analysis/` | DUPLICADO/OBSOLETO (versión viva en `docs/proceso/`) |
| 8 | `VERIFICATION.md` | 4.2K | 2026-06-14 | Verificación del patrón Linked Chunks (2026-06-11) | DUPLICADO (= `docs/proceso/VERIFICATION.md`) |
| 9 | `STOPP_START_CRITERIOS_CONTEXTO.md` | 31.9K | 2026-06-14 | Contexto clínico STOPP/START v3 + arquitectura | DUPLICADO (= copia de `docs/`) |
| 10 | `dudas-raquel-pendientes.md` | 11.7K | 2026-06-14 | Dudas clínicas para la tutora; **versión más nueva** (secciones 9-10) | VIVO (duplicado divergente) |
| 11 | `docs/_map.md` | 11K | 2026-07-17 | Mapa del patrón Linked Chunks; parseado por `check-links.sh` | VIVO |
| 12 | `docs/accesibilidad-ui.md` | 9.4K | 2026-06-12 | Doc conceptual @linked: escala de fuente + tooltips | VIVO |
| 13 | `docs/caso-clinico.md` | 9.9K | 2026-07-17 | Doc conceptual @linked: modelo de dominio + CaseStore | VIVO |
| 14 | `docs/catalogo-clinico.md` | 16.5K | 2026-07-17 | Doc conceptual @linked: catálogo estático de dx/meds | VIVO |
| 15 | `docs/flujo-pasos.md` | 14.9K | 2026-07-17 | Doc conceptual @linked: wizard de 2 pasos | VIVO |
| 16 | `docs/historial.md` | 6.3K | 2026-06-12 | Doc conceptual @linked: vista historial | VIVO |
| 17 | `docs/informes-y-exportacion.md` | 9K | 2026-06-12 | Doc conceptual @linked: PDF/export/portapapeles | VIVO |
| 18 | `docs/motor-criterios.md` | 15.2K | 2026-07-17 | Doc conceptual @linked: motor json-logic | VIVO |
| 19 | `docs/navegacion-y-shell.md` | 6.6K | 2026-06-12 | Doc conceptual @linked: bootstrap y rutas | VIVO |
| 20 | `docs/arquitectura/uml-diagrams.md` | 12.3K | 2026-06-14 | Diagramas UML de la app | VIVO |
| 21 | `docs/clinico/STOPP_START_CRITERIOS_CONTEXTO.md` | 31.9K | 2026-06-12 | Contexto clínico STOPP/START v3 (copia canónica, en whitelist del script) | VIVO |
| 22 | `docs/clinico/dudas-raquel-pendientes.md` | 9.3K | 2026-06-12 | Dudas tutora, versión ATRASADA (2026-05-22) | OBSOLETO (la raíz es más nueva) |
| 23 | `docs/propuestas/plan-mejora-dosis-duracion-medicacion.md` | 22K | 2026-07-17 | Plan de mejora PLAN-01 dosis/duración (sin implementar) | VIVO |
| 24 | `docs/propuestas/plan-visibilidad-medicamentos-multiclase.md` | 6.4K | 2026-07-17 | Plan de visibilidad multiclase (implementado en commit 1a49c0b) | HISTÓRICO |
| 25 | `docs/propuestas/propuesta-p14.md` | 10.9K | 2026-06-12 | Propuesta UI P14: unificar orientación de opciones (no implementada) | VIVO |
| 26 | `docs/propuestas/propuesta-p15.md` | 17.9K | 2026-06-12 | Propuesta P15: selector en árbol (iteración 1 implementada, resto pendiente) | VIVO |
| 27 | `docs/revisiones/revision-criterios-d-h.md` | 3.8K | 2026-07-17 | Informe ronda TDD criterios STOPP D-H (cerrada) | HISTÓRICO |
| 28 | `docs/revisiones/revision-dosis-duracion-medicacion.md` | 6.4K | 2026-07-17 | Manifiesto ronda dosis/duración | HISTÓRICO |
| 29 | `docs/revisiones/revision-dosis-duracion-medicacion-resultado.md` | 4.3K | 2026-07-17 | Resultado consolidado de esa ronda | HISTÓRICO |
| 30 | `docs/revisiones/revision-dosis-duracion-seccion-inventario.md` | 3.9K | 2026-07-17 | Informe de sección (inventario) de esa ronda | HISTÓRICO (subsumido por el resultado) |
| 31 | `docs/revisiones/revision-dosis-duracion-seccion-lagunas.md` | 8K | 2026-07-17 | Informe de sección (lagunas) de esa ronda | HISTÓRICO (subsumido por el resultado) |
| 32 | `docs/revisiones/revision-pendientes-relevancia.md` | 2.9K | 2026-07-17 | Manifiesto ronda pendientes de relevancia | HISTÓRICO |
| 33 | `docs/revisiones/revision-pendientes-relevancia-resultado.md` | 1.8K | 2026-07-17 | Resultado de esa ronda | HISTÓRICO |
| 34 | `docs/revisiones/revision-prueba-manual-visibilidad-multiclase.md` | 4.7K | 2026-07-17 | Informe revisión de la prueba manual multiclase | HISTÓRICO |
| 35 | `docs/revisiones/revision-visibilidad-clinica-por-sistema.md` | 12K | 2026-07-17 | Auditoría de 216 criterios + implementación multiclase | HISTÓRICO |
| 36 | `docs/revisiones/informe-revision-pendientes-relevancia.md` | 3.8K | 2026-07-17 | Informe de cierre de ronda pendientes-relevancia | HISTÓRICO |
| 37 | `docs/revisiones/manifiesto-revision-general-2026-07-17.md` | 3.7K | sin commit | Manifiesto de la ronda ACTUAL | VIVO |
| 38 | `docs/revisiones/manifiesto-revision-pendientes-relevancia.md` | 2.4K | 2026-07-17 | Manifiesto ronda pendientes-relevancia (cerrada) | HISTÓRICO |
| 39 | `docs/proceso/RALPH.md` | 3.2K | 2026-06-12 | Cómo lanzar el loop Ralph (copia canónica) | VIVO (loop con tareas pendientes) |
| 40 | `docs/proceso/REVIEW.md` | 9.5K | 2026-07-17 | Consolidado de hallazgos (copia viva, actualizada) | VIVO (fuente del loop Ralph) |
| 41 | `docs/proceso/VERIFICATION.md` | 4.2K | 2026-06-12 | Verificación Linked Chunks (copia canónica) | HISTÓRICO |
| 42 | `docs/propuestas/propuesta-p14.md` → ya listado | — | — | — | — |
| 43 | `docs/revisiones/analisis-proyecto.md` | 25.5K | 2026-07-12 | Análisis de arquitectura y salud del proyecto (solo lectura) | HISTÓRICO |
| 44 | `docs/revisiones/analisis-relevancia.md` | 27.8K | 2026-07-08 | Análisis de relevancia de meds por sistema (caso Digoxina) | HISTÓRICO |
| 45 | `docs/revisiones/auditoria-cardiovascular.md` | 25.1K | 2026-07-08 | Auditoría del sistema cardiovascular | HISTÓRICO |
| 46 | `docs/revisiones/verificacion-auditoria.md` | 14.7K | 2026-07-08 | Verificación escéptica de la auditoría CV | HISTÓRICO |
| 47 | `plans/checklist-prueba-manual-cardiovascular.md` | 19.2K | 2026-07-17 | Checklist manual de los 45 criterios CV | DUPLICADO funcional (subconjunto del maestro) |
| 48 | `plans/checklist-prueba-manual-todos-criterios.md` | 76.4K | 2026-07-17 | Checklist manual maestro de los 216 criterios | VIVO |
| 49 | `plans/checklist-prueba-manual-visibilidad-multiclase.md` | 4K | 2026-07-17 (modificado en working tree) | Checklist manual visibilidad multiclase | VIVO |
| 50 | `docs/historico/analysis/app-shell.md` | 10.3K | 2026-06-12 | Análisis por módulo (fase previa a los docs @linked) | HISTÓRICO |
| 51 | `docs/historico/analysis/core.md` | 8.5K | 2026-06-12 | Ídem | HISTÓRICO |
| 52 | `docs/historico/analysis/core-data.md` | 8.1K | 2026-06-12 | Ídem | HISTÓRICO |
| 53 | `docs/historico/analysis/core-services.md` | 10K | 2026-06-12 | Ídem | HISTÓRICO |
| 54 | `docs/historico/analysis/historial.md` | 4.9K | 2026-06-12 | Ídem | HISTÓRICO |
| 55 | `docs/historico/analysis/steps.md` | 9.5K | 2026-06-12 | Ídem | HISTÓRICO |
| 56 | `.cursor/plans/dx_deps_generalizadas_31e1e000.plan.md` | 14.6K | 2026-06-14 | Plan interno de Cursor (todos completados) | HISTÓRICO |

(La fila 42 es un descarte de numeración; total real: 55 ficheros.)

## Estructura de carpetas propuesta

```
TFG/
├── CLAUDE.md                      # INTOCABLE (Claude Code)
├── AGENTS.md                      # INTOCABLE (Cursor Cloud)
├── MEMORY.md                      # INTOCABLE (memoria de agentes)
├── TASKS.md                       # INTOCABLE mientras el loop Ralph tenga [ ]
├── scratchpad.md                  # INTOCABLE (ídem)
├── .cursor/plans/…                # INTOCABLE (interno de Cursor)
├── docs/
│   ├── _map.md                    # INTOCABLE (check-links.sh:15)
│   ├── accesibilidad-ui.md        # ┐
│   ├── caso-clinico.md            # │ 8 docs conceptuales @linked:
│   ├── catalogo-clinico.md        # │ NO se mueven (36 comentarios
│   ├── flujo-pasos.md             # │ @linked en src/ + _map.md +
│   ├── historial.md               # │ check-links.sh dependen de la
│   ├── informes-y-exportacion.md  # │ ruta docs/<concepto>.md)
│   ├── motor-criterios.md         # │
│   ├── navegacion-y-shell.md      # ┘
│   ├── clinico/
│   │   ├── STOPP_START_CRITERIOS_CONTEXTO.md
│   │   └── dudas-raquel-pendientes.md      (contenido fusionado desde raíz)
│   ├── arquitectura/
│   │   └── uml-diagrams.md
│   ├── propuestas/
│   │   ├── propuesta-p14.md
│   │   ├── propuesta-p15.md
│   │   ├── plan-mejora-dosis-duracion-medicacion.md
│   │   └── plan-visibilidad-medicamentos-multiclase.md
│   ├── revisiones/
│   │   ├── revision-criterios-d-h.md
│   │   ├── revision-dosis-duracion-medicacion.md
│   │   ├── revision-dosis-duracion-medicacion-resultado.md
│   │   ├── revision-dosis-duracion-seccion-inventario.md   (o fusionar)
│   │   ├── revision-dosis-duracion-seccion-lagunas.md      (o fusionar)
│   │   ├── revision-pendientes-relevancia.md
│   │   ├── revision-pendientes-relevancia-resultado.md
│   │   ├── revision-prueba-manual-visibilidad-multiclase.md
│   │   ├── revision-visibilidad-clinica-por-sistema.md
│   │   ├── informe-revision-pendientes-relevancia.md
│   │   ├── manifiesto-revision-pendientes-relevancia.md
│   │   ├── analisis-proyecto.md
│   │   ├── analisis-relevancia.md
│   │   ├── auditoria-cardiovascular.md
│   │   └── verificacion-auditoria.md
│   ├── historico/
│   │   └── analysis/              # los 6 análisis por módulo de 2026-06-12
│   └── proceso/                   # solo operación de rondas/loops VIVA
│       ├── RALPH.md
│       ├── REVIEW.md              # fuente del loop Ralph (T12-T16 pendientes)
│       ├── VERIFICATION.md
│       ├── manifiesto-revision-general-2026-07-17.md   # ronda actual
│       └── informe-revision-general-seccion-*.md       # informes de esta ronda
└── plans/                         # SOLO checklists/planes activos
    ├── checklist-prueba-manual-todos-criterios.md
    └── checklist-prueba-manual-visibilidad-multiclase.md
```

Al cerrar la ronda actual, `manifiesto-revision-general-2026-07-17.md` y sus
informes de sección migran también a `docs/revisiones/`.

## Tabla de veredictos

| Ruta actual | Veredicto | Destino / con qué | Justificación |
|-------------|-----------|-------------------|---------------|
| `CLAUDE.md` | INTOCABLE | raíz | Leído por Claude Code en cada sesión. |
| `AGENTS.md` | INTOCABLE | raíz | Cursor Cloud lee `AGENTS.md` de raíz. |
| `MEMORY.md` | INTOCABLE | raíz | Memoria de agentes; citado por `docs/revisiones/informe-revision-pendientes-relevancia.md:65`. |
| `TASKS.md` | INTOCABLE | raíz | Loop Ralph con 5 tareas [ ]; `docs/proceso/RALPH.md:5` lo exige en raíz. |
| `scratchpad.md` | INTOCABLE | raíz | Requerido en raíz por el loop (`RALPH.md:6`); borrable solo al cerrar el loop. |
| `.cursor/plans/dx_deps_generalizadas_31e1e000.plan.md` | INTOCABLE | donde está | Almacén interno de Cursor; no es documentación del proyecto. |
| `RALPH.md` (raíz) | BORRAR | — | Idéntico byte a byte a `docs/proceso/RALPH.md` (hash `d05c757f`). |
| `REVIEW.md` (raíz) | BORRAR | — | Copia atrasada; la viva es `docs/proceso/REVIEW.md` (commit 2026-07-17). |
| `VERIFICATION.md` (raíz) | BORRAR | — | Idéntico a `docs/proceso/VERIFICATION.md` (hash `b4ef5fa6`). |
| `STOPP_START_CRITERIOS_CONTEXTO.md` (raíz) | BORRAR | — | Idéntico a la copia de `docs/` (hash `80e1ed1c`), que es la referenciada por `check-links.sh:189`. |
| `dudas-raquel-pendientes.md` (raíz) | FUSIONAR | → `docs/clinico/dudas-raquel-pendientes.md` | La raíz es la versión nueva (secciones 9-10); se vuelca sobre la ruta que conoce el tooling y se borra la raíz. |
| `docs/clinico/dudas-raquel-pendientes.md` | CONSERVAR | `docs/clinico/dudas-raquel-pendientes.md` (tras fusión) | Dudas de la tutora = material clínico del TFG; actualizar `check-links.sh:190`. |
| `docs/clinico/STOPP_START_CRITERIOS_CONTEXTO.md` | CONSERVAR | `docs/clinico/` | Contexto clínico de referencia; actualizar `check-links.sh:189`. |
| `docs/_map.md` | INTOCABLE | `docs/_map.md` | Ruta cableada en `check-links.sh:15`. |
| `docs/{accesibilidad-ui,caso-clinico,catalogo-clinico,flujo-pasos,historial,informes-y-exportacion,motor-criterios,navegacion-y-shell}.md` | CONSERVAR | sin mover | 36 comentarios `@linked` en `src/` + `_map.md` + script dependen de la ruta exacta. |
| `docs/arquitectura/uml-diagrams.md` | CONSERVAR | `docs/arquitectura/` | Doc de arquitectura sin dependencias de ruta (solo entrada de whitelist, que se limpia). |
| `docs/propuestas/propuesta-p14.md` | CONSERVAR | `docs/propuestas/` | Propuesta aún no implementada. |
| `docs/propuestas/propuesta-p15.md` | CONSERVAR | `docs/propuestas/` | Propuesta parcialmente implementada (pasos 6-7 pendientes). |
| `docs/propuestas/plan-mejora-dosis-duracion-medicacion.md` | CONSERVAR | `docs/propuestas/` | Plan PLAN-01 pendiente de decisión del usuario. |
| `docs/propuestas/plan-visibilidad-medicamentos-multiclase.md` | CONSERVAR | `docs/propuestas/` | Ya implementado (1a49c0b) pero documenta la decisión de diseño. |
| `docs/revisiones/revision-criterios-d-h.md` | CONSERVAR | `docs/revisiones/` | Informe de ronda cerrada; traza del TFG. |
| `docs/revisiones/revision-dosis-duracion-medicacion.md` | CONSERVAR | `docs/revisiones/` | Manifiesto de ronda cerrada. |
| `docs/revisiones/revision-dosis-duracion-medicacion-resultado.md` | CONSERVAR | `docs/revisiones/` | Resultado consolidado de la ronda. |
| `docs/revisiones/revision-dosis-duracion-seccion-inventario.md` | FUSIONAR | con `…-medicacion-resultado.md` | Informe de sección subsumido por el resultado; si el humano confirma que no aporta nada extra, borrar; si no, mover a `docs/revisiones/`. |
| `docs/revisiones/revision-dosis-duracion-seccion-lagunas.md` | FUSIONAR | con `…-medicacion-resultado.md` | Ídem. |
| `docs/revisiones/revision-pendientes-relevancia.md` | CONSERVAR | `docs/revisiones/` | Manifiesto de ronda cerrada. |
| `docs/revisiones/revision-pendientes-relevancia-resultado.md` | CONSERVAR | `docs/revisiones/` | Resultado de ronda cerrada. |
| `docs/revisiones/revision-prueba-manual-visibilidad-multiclase.md` | CONSERVAR | `docs/revisiones/` | Informe de ronda cerrada. |
| `docs/revisiones/revision-visibilidad-clinica-por-sistema.md` | CONSERVAR | `docs/revisiones/` | Auditoría con valor de traza. |
| `docs/revisiones/informe-revision-pendientes-relevancia.md` | CONSERVAR | `docs/revisiones/` | Ronda cerrada; deja de ser "proceso" vivo. |
| `docs/revisiones/manifiesto-revision-pendientes-relevancia.md` | CONSERVAR | `docs/revisiones/` | Ídem. |
| `docs/revisiones/manifiesto-revision-general-2026-07-17.md` | CONSERVAR | `docs/proceso/` (a `docs/revisiones/` al cerrar) | Ronda en curso. |
| `docs/proceso/RALPH.md` | CONSERVAR | `docs/proceso/` | Instrucciones del loop aún abierto (T12-T16). |
| `docs/proceso/REVIEW.md` | CONSERVAR | `docs/proceso/` | Fuente viva del loop Ralph; a `docs/revisiones/` cuando el loop cierre. |
| `docs/proceso/VERIFICATION.md` | CONSERVAR | `docs/proceso/` | Evidencia de verificación del patrón; mover a `docs/revisiones/` al cerrar el loop. |
| `docs/revisiones/analisis-proyecto.md` | CONSERVAR | `docs/revisiones/` | Análisis de solo lectura terminado; no es un plan activo. |
| `docs/revisiones/analisis-relevancia.md` | CONSERVAR | `docs/revisiones/` | Ídem. |
| `docs/revisiones/auditoria-cardiovascular.md` | CONSERVAR | `docs/revisiones/` | Auditoría terminada. |
| `docs/revisiones/verificacion-auditoria.md` | CONSERVAR | `docs/revisiones/` | Verificación de la auditoría, terminada. |
| `plans/checklist-prueba-manual-cardiovascular.md` | FUSIONAR | con `checklist-prueba-manual-todos-criterios.md` | Los 45 criterios CV son subconjunto del checklist maestro de 216; borrar tras confirmar cobertura 1:1. |
| `plans/checklist-prueba-manual-todos-criterios.md` | CONSERVAR | `plans/` | Checklist maestro activo. |
| `plans/checklist-prueba-manual-visibilidad-multiclase.md` | CONSERVAR | `plans/` | Activo (modificado en el working tree actual). |
| `analysis/*.md` (6 ficheros) | CONSERVAR | `docs/historico/analysis/` | Superados por los docs conceptuales @linked que derivaron de ellos, pero son la fuente citada por `REVIEW.md`; se archivan, no se borran. |
| `docs/proceso/informe-revision-general-seccion-*.md` (esta ronda) | CONSERVAR | `docs/proceso/` → `docs/revisiones/` al cerrar | Artefactos de la ronda actual. |

**Totales**: 40 CONSERVAR · 4 FUSIONAR · 4 BORRAR · 7 INTOCABLE = 55.

## Bloque de comandos propuesto (NO ejecutado)

Orden seguro: primero borrar duplicados idénticos, luego fusionar, luego crear
carpetas y mover, por último actualizar `check-links.sh` y verificar. Ejecutar
desde la raíz del repo con working tree limpio, idealmente en una rama.

```bash
# 0. Rama de trabajo
git checkout -b chore/reorganizacion-docs

# 1. Borrar duplicados de raíz (idénticos o atrasados; canónicos en docs/)
git rm RALPH.md VERIFICATION.md STOPP_START_CRITERIOS_CONTEXTO.md REVIEW.md

# 2. Fusión dudas-raquel: la raíz es la versión nueva -> volcarla sobre docs/ y borrar raíz
cp dudas-raquel-pendientes.md docs/clinico/dudas-raquel-pendientes.md
git add docs/clinico/dudas-raquel-pendientes.md
git rm dudas-raquel-pendientes.md

# 3. Crear la estructura destino
mkdir -p docs/clinico docs/arquitectura docs/propuestas docs/revisiones docs/historico/analysis

# 4. Clínico
git mv docs/clinico/STOPP_START_CRITERIOS_CONTEXTO.md docs/clinico/
git mv docs/clinico/dudas-raquel-pendientes.md docs/clinico/

# 5. Arquitectura
git mv docs/arquitectura/uml-diagrams.md docs/arquitectura/

# 6. Propuestas y planes de mejora
git mv docs/propuestas/propuesta-p14.md docs/propuestas/
git mv docs/propuestas/propuesta-p15.md docs/propuestas/
git mv docs/propuestas/plan-mejora-dosis-duracion-medicacion.md docs/propuestas/
git mv docs/propuestas/plan-visibilidad-medicamentos-multiclase.md docs/propuestas/

# 7. Revisiones cerradas (desde docs/, docs/proceso/ y plans/)
git mv docs/revisiones/revision-criterios-d-h.md docs/revisiones/
git mv docs/revisiones/revision-dosis-duracion-medicacion.md docs/revisiones/
git mv docs/revisiones/revision-dosis-duracion-medicacion-resultado.md docs/revisiones/
git mv docs/revisiones/revision-dosis-duracion-seccion-inventario.md docs/revisiones/
git mv docs/revisiones/revision-dosis-duracion-seccion-lagunas.md docs/revisiones/
git mv docs/revisiones/revision-pendientes-relevancia.md docs/revisiones/
git mv docs/revisiones/revision-pendientes-relevancia-resultado.md docs/revisiones/
git mv docs/revisiones/revision-prueba-manual-visibilidad-multiclase.md docs/revisiones/
git mv docs/revisiones/revision-visibilidad-clinica-por-sistema.md docs/revisiones/
git mv docs/revisiones/informe-revision-pendientes-relevancia.md docs/revisiones/
git mv docs/revisiones/manifiesto-revision-pendientes-relevancia.md docs/revisiones/
git mv docs/revisiones/analisis-proyecto.md docs/revisiones/
git mv docs/revisiones/analisis-relevancia.md docs/revisiones/
git mv docs/revisiones/auditoria-cardiovascular.md docs/revisiones/
git mv docs/revisiones/verificacion-auditoria.md docs/revisiones/

# 8. Archivo histórico de la fase de análisis
git mv docs/historico/analysis/app-shell.md docs/historico/analysis/core.md docs/historico/analysis/core-data.md \
       docs/historico/analysis/core-services.md docs/historico/analysis/historial.md docs/historico/analysis/steps.md \
       docs/historico/analysis/
rmdir analysis

# 9. Actualizar rutas movidas en scripts/check-links.sh (whitelist EXCLUDED_DOCS).
#    Las entradas de docs movidos a subcarpetas quedan muertas (CHECK 3 solo
#    escanea docs/*.md de primer nivel); se retocan las dos rutas que siguen
#    siendo significativas y se eliminan las muertas:
sed -i \
  -e 's|"docs/clinico/STOPP_START_CRITERIOS_CONTEXTO.md"|"docs/clinico/STOPP_START_CRITERIOS_CONTEXTO.md"|' \
  -e 's|"docs/clinico/dudas-raquel-pendientes.md"|"docs/clinico/dudas-raquel-pendientes.md"|' \
  -e '/"docs\/uml-diagrams.md"/d' \
  -e '/"docs\/propuesta-p14.md"/d' \
  -e '/"docs\/propuesta-p15.md"/d' \
  -e '/"docs\/revision-criterios-d-h.md"/d' \
  -e '/"docs\/plan-visibilidad-medicamentos-multiclase.md"/d' \
  -e '/"docs\/revision-visibilidad-clinica-por-sistema.md"/d' \
  -e '/"docs\/revision-prueba-manual-visibilidad-multiclase.md"/d' \
  -e '/"docs\/revision-pendientes-relevancia.md"/d' \
  -e '/"docs\/revision-pendientes-relevancia-resultado.md"/d' \
  -e '/"docs\/revision-dosis-duracion-medicacion.md"/d' \
  scripts/check-links.sh
git add scripts/check-links.sh

# 10. Fusiones que requieren confirmación humana previa (NO ejecutar a ciegas):
# git rm docs/revisiones/revision-dosis-duracion-seccion-inventario.md   # si el resultado ya lo consolida
# git rm docs/revisiones/revision-dosis-duracion-seccion-lagunas.md      # idem
# git rm plans/checklist-prueba-manual-cardiovascular.md                 # si todos-criterios cubre los 45 CV

# 11. Verificar que el tooling sigue en verde antes de commitear
./scripts/check-links.sh
git status
# git commit -m "chore(docs): reorganizacion de .md en clinico/arquitectura/propuestas/revisiones/historico"
```

Notas de seguridad:
- No se toca ningún fichero de `src/` ni los 8 docs `@linked` ni `docs/_map.md`.
- `TASKS.md`, `scratchpad.md`, `MEMORY.md`, `CLAUDE.md`, `AGENTS.md` y
  `.cursor/` no se mueven.
- El paso 9 es limpieza, no requisito: CHECK 3 solo escanea `docs/*.md` de
  primer nivel, así que todas las entradas de whitelist de docs movidos a
  subcarpetas quedan muertas e inocuas. Se actualizan/eliminan por higiene.
- Tras el paso 7, `./scripts/check-links.sh` deja además de reportar el
  DOC_HUERFANO latente de los 4 docs de primer nivel sin whitelist (hallazgo
  transversal 3).
- El paso 10 queda comentado: son borrados condicionados a una comprobación de
  contenido que debe aprobar el humano.

---

## Adenda (2026-07-18) — nuevos `.md` tras el cierre de la ronda y la ronda d10-d11-h4-l6

Desde que se elaboró el inventario han aparecido **7 ficheros `.md` nuevos**
(todos sin commit). Veredicto propuesto, coherente con la estructura de arriba:

| Ruta | Propósito | Veredicto |
|------|-----------|-----------|
| `docs/revisiones/revision-general-2026-07-17-resultado.md` | Consolidado de la ronda general (bugs + plan + reorganización) | CONSERVAR → `docs/revisiones/` al cerrar su plan de acción |
| `docs/revisiones/revision-d10-d11-h4-l6-campos-multitab.md` | Manifiesto ronda correctiva D10/D11/H4/L6 (cerrada) | CONSERVAR → `docs/revisiones/` |
| `docs/revisiones/revision-d10-d11-h4-l6-campos-multitab-resultado.md` | Resultado de esa ronda (fixes aplicados, duda B1 abierta) | CONSERVAR → `docs/revisiones/` |
| `docs/proceso/informe-revision-d10-d11-h4-l6-seccion-{a,b,c}.md` (3) | Informes de sección de esa ronda | CONSERVAR → `docs/revisiones/` (contienen la investigación de la duda B1 aún abierta) |
| `docs/proceso/progreso-ronda.md` | Log de progreso de ronda | FUSIONAR/BORRAR al cerrar: si es genérico reutilizable, dejar en `docs/proceso/`; si es de una ronda concreta, absorber en su resultado |

**Totales actualizados**: 46 CONSERVAR · 5 FUSIONAR · 4 BORRAR · 7 INTOCABLE = **62**.

El bloque de comandos del informe sigue siendo válido; añadir al paso 7 los
movimientos de la tabla anterior cuando las rondas respectivas queden
committeadas y cerradas. Prioridad nueva: **commitear antes de mover** — todo
lo listado está `??` en git y un `git clean` lo perdería (ver C13 ampliado).

---

## Adenda (2026-07-19) — reorganización ejecutada

Se aplicó el bloque de comandos (pasos 1–9 + adenda) sobre el working tree.
Los duplicados de raíz y la fusión de `dudas-raquel` ya venían de la
sección C.

**Estructura resultante:**
```
docs/
├── _map.md + 7 docs @linked          (sin historial.md; feature eliminada en B1)
├── clinico/                          STOPP_START…, dudas-raquel (fusionado)
├── arquitectura/                     uml-diagrams.md
├── propuestas/                       p14, p15, plan-dosis-duración, plan-multiclase
├── revisiones/                       rondas cerradas + análisis/auditorías/prompts
├── historico/analysis/               6 snapshots (antes en analysis/)
└── proceso/                          RALPH, REVIEW, VERIFICATION, progreso-ronda
plans/                                3 checklists (CV + maestro + multiclase)
```

**No ejecutado (paso 10 — requiere confirmación humana):**
- Borrar `docs/revisiones/revision-dosis-duracion-seccion-{inventario,lagunas}.md`
- Borrar `plans/checklist-prueba-manual-cardiovascular.md`

**Tooling:** `scripts/check-links.sh` → `EXCLUDED_DOCS` vacía (CHECK 3 solo
ve `docs/*.md` de primer nivel, todos @linked). `docs/_map.md` documenta las
subcarpetas en Excluidos. Verificación: `./scripts/check-links.sh` →
**OK: todo limpio (0 problemas)**.
