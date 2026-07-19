# Resultado — Corrección Sección B (servicios y UI)

- **Rama:** `fix/seccion-b-ui-servicios`
- **Fecha:** 2026-07-19
- **Prompt:** `docs/revisiones/prompt-correccion-seccion-b.md`
- **Alcance no tocado (Sección A):** `criteria.json`, `core/services/`, `core/data/`, `group-visibility.ts`

## Totales de suite

| Momento | Specs |
|---------|------:|
| Línea base (antes de empezar) | **805 SUCCESS** |
| Tras Bloque 1 (sin historial) | 798 SUCCESS |
| Tras Bloque 2 (shell) | 791 SUCCESS |
| Tras Bloque 3 (Zod) | — (parcial) |
| Tras Bloque 4 (bugs) | 804 SUCCESS |
| Tras Bloque 5 (a11y) | 809 SUCCESS |
| Tras Bloque 6 / cierre | **807 SUCCESS** |

**Por qué baja el total:** se eliminaron specs del historial (`historial.component.spec.ts`) y de la raíz muerta (`app.spec.ts`), más tests de métodos privados de `ReportService` sustituidos por menos tests vía API pública. Se añadieron specs de Zod, a11y, tooltip, clipboard/PDF, display-settings y `exportCase`.

**Nota check-links:** `scripts/check-links.sh` ya reportaba 20 problemas en `master` (docs de revisión huérfanos / fuera de mapa, p. ej. `revision-seccion-a-*`). Esta ronda no empeoró ese conteo; se actualizó `_map.md` al retirar `docs/historial.md` y al añadir `case-export.schema.ts`.

**Tareas de TASKS.md:** T7 (doble raíz / shell) y T12 (historial) quedan efectivamente resueltas por los bloques 1–2; no se editó `TASKS.md`/`MEMORY.md` (cierre posterior).

## Hallazgos → acción → tests → commit

| Hallazgo | Qué se hizo | Tests | Commit |
|----------|-------------|-------|--------|
| **B1** (+ B9, B10) | Eliminado `src/app/historial/`, ruta, `SavedCase`, `history`/`saveToHistory`/`deleteFromHistory`; limpieza clave `historial` al arrancar; docs Linked Chunks | `/historial` → wildcard `/medicaciones`; limpieza localStorage | `63d175f` |
| **B5 + B6** (T7) | Borrados `app.ts`/`app.html`/`app.css`/`app.spec.ts`; `appConfig` fuente única; shell mínimo con `DisplaySettingsService` protegido | Shell + escala tipográfica al crear | `f2e0311` |
| **B2 + B14** | Zod `caseExportSchema` (versión literal `1.0`); mensaje ES breve; sin `loadCase` si falla | 4 casos B2 + versión 99.0 + sin dump Zod | `b8fb144` |
| **B3** | `customDxFor` excluye `__otro` | Badge grupo/tab = 1; sin fila «otro» | `c4f6715` |
| **B4** (+ mejora 8) | `copyCriteria` / `onExportPdf` con snackbar en ambos steps | Clipboard/PDF que rechazan | `c4f6715` |
| **B8** | try/catch en `loadScale`/`apply` | Storage que lanza | `c4f6715` |
| **B13** | `setTimeout(..., 0)` antes de `revokeObjectURL` | Spec de revoke diferido | `c4f6715` |
| **B7** (+ adenda) | Eliminados `results`/`activeSystem`, exclusions/lastCriterionId/criteriaGroups, helpers muertos meds | Suite en verde | `c4f6715` |
| **B11** | Filas `role=checkbox/radio` + teclado; toggle revisado con `<input>`; cabeceras `role=button`/`aria-expanded`; tooltip focus/blur/clamp | Specs a11y + `tooltip.directive.spec.ts` | `2617371` |
| **B12** | Handlers tipados (`onEgfrInput`, `onClinicalFieldInput`, narrowing en selects) | Compilación strictTemplates | `2617371` |
| **B15** | `report.service.spec` vía `exportCase` + `createPdf` doblado; specs `CaseIoService.exportCase`; sin `as any` restantes en specs tocados | report + case-io export | `b238480` |

## Commits (orden)

1. `63d175f` — fix(B1): eliminar feature de historial inaccesible
2. `f2e0311` — fix(B5/B6): unificar shell con appConfig y eliminar raíz muerta
3. `b8fb144` — fix(B2/B14): validar importación de caso con schema Zod
4. `c4f6715` — fix(B3/B4/B7/B8/B13): bugs puntuales y limpieza de estado muerto
5. `2617371` — fix(B11/B12): accesibilidad de controles y eliminación de `$any` en templates
6. `b238480` — test(B15): higiene de specs de report y exportCase
7. `11bffec` — docs: informe de resultado de la corrección Sección B
8. `6611429` — docs: registrar informe Sección B en excluidos de `_map.md`

## Fuera de alcance (anotado)

- Refactor grande de duplicación toolbar/`onFileLoad`/`copyCriteria` entre steps (duplicación mínima aceptada en B4).
- Actualización de `TASKS.md` / `MEMORY.md`.
- Push a remoto (prohibido por el encargo).
