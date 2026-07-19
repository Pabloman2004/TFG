# Prompt — Corrección de los hallazgos de la Sección B (servicios y UI)

> Redactado 2026-07-18 tras la ronda de revisión general. Decisiones del
> usuario ya incorporadas: eliminar historial, Zod en la frontera de import,
> appConfig como fuente única de providers, alcance = bugs + a11y + `$any`
> (sin el refactor grande de duplicación). Copiar todo lo de abajo como
> prompt del agente.

---

Actúas como agente corrector sobre el repo `C:\Users\jcarl\TFG\TFG` — app
Angular 20 standalone `stopp-start-app` (criterios STOPP/START, TFG de
farmacia clínica). Tu encargo es corregir los hallazgos de la **Sección B
(servicios de aplicación y UI)** de la ronda de revisión general.

**Lee antes de empezar:**
- `docs/revisiones/informe-revision-general-seccion-b.md` — los 15 hallazgos
  (B1–B15) con evidencia `fichero:línea`, incluida la **adenda 2026-07-18**
  (importante: las referencias de línea de `meds-step.component.ts` están
  desplazadas ~+9 desde la línea 120, y hay helpers muertos nuevos).
- `CLAUDE.md` — normas del proyecto. **TDD no negociable** para todo
  comportamiento nuevo: test en rojo primero, cambio mínimo después. Datos
  inmutables, sin `any`/`$any`, schemas en fronteras de confianza.
- El proyecto usa el patrón Linked Chunks: hay comentarios `@linked
  docs/<doc>.md` en `src/` y un verificador `scripts/check-links.sh` (bash).
  Si eliminas o cambias ficheros con `@linked`, actualiza el doc enlazado y
  `docs/_map.md`, y deja `./scripts/check-links.sh` en verde.

**Reglas del encargo:**
- Rama nueva: `fix/seccion-b-ui-servicios`.
- Un commit por bloque coherente, mensajes en español. **No hagas push.**
- Suite: `npx ng test --watch=false --browsers=ChromeHeadless`. Ejecútala
  antes de empezar (línea base ~669 SUCCESS) y déjala en verde tras cada
  commit. El total BAJARÁ al eliminar el historial y specs muertas — anota
  los totales antes/después en el informe.
- **No toques el alcance de la Sección A** (otro agente puede estar
  trabajándolo en paralelo): `src/assets/data/criteria.json`,
  `src/app/core/services/*`, `src/app/core/data/*`,
  `src/app/core/group-visibility.ts`. Si un cambio tuyo parece exigir tocar
  eso, páralo y anótalo en el informe.
- Al terminar, escribe `docs/revisiones/revision-seccion-b-ui-resultado.md`: hallazgo →
  qué se hizo → tests → commit; más los totales de suite antes/después.

## Bloque 1 — Eliminar la feature de historial (B1; resuelve B9, B10 y la T12 de TASKS.md)

**Decisión tomada: eliminar, no conectar.** Nada llama a `saveToHistory()`
(`case-store.service.ts:114`) y ningún template enlaza `/historial`.

1. Borrar `src/app/historial/` completo (componente, html, css, spec).
2. Quitar la ruta `historial` de `app.routes.ts` y la constante de
   `app.routes.constants.ts`; actualizar `app.routes.spec.ts`.
3. En `CaseStoreService`: eliminar la señal `history`,
   `saveToHistory`/`deleteFromHistory`, el tipo `SavedCase` de `types.ts` y
   cualquier persistencia asociada. Añade limpieza de la clave de
   localStorage del historial en el arranque (mismo patrón que ya usa el
   constructor con la clave legada `results`) para no dejar basura en
   navegadores de usuarios.
4. `ConfirmResetDialogComponent` se queda (lo usan los steps para reset).
5. Docs del patrón Linked Chunks: eliminar `docs/historial.md`, retirar su
   entrada y ficheros de `docs/_map.md`, y revisar que ningún comentario
   `@linked docs/historial.md` quede en `src/`. `./scripts/check-links.sh`
   en verde.
6. Test de regresión razonable: la ruta desconocida `/historial` cae en el
   wildcard hacia `/medicaciones`.

## Bloque 2 — Shell y doble raíz (B5 + B6; cierra la T7 de TASKS.md)

**Decisión tomada: borrar `app.ts` y usar `appConfig` como fuente única.**

1. Borrar `src/app/app.ts`, `app.html`, `app.css`, `app.spec.ts`.
2. Mover los providers reales de `main.ts` (`provideAnimations`,
   `provideRouter(routes)`, `provideHttpClient`) a `app.config.ts`,
   conservando `provideBrowserGlobalErrorListeners()` y
   `provideZoneChangeDetection({ eventCoalescing: true })`, y hacer que
   `main.ts` bootstrapee `AppComponent` con `appConfig`. Es un cambio de
   comportamiento deliberado (gana el listener global de errores).
3. Limpiar `AppComponent` (`app.component.ts`): eliminar los métodos sin
   binding (`onSave`, `onLoad`, `openQuickGuide`, `resetCase`), el
   `<input type="file">` inalcanzable, `fileInputRef` y las ~45 líneas de CSS
   muerto. **La inyección de `DisplaySettingsService` NO se toca**: es la que
   aplica `--font-scale` al arrancar. Protégela con un test que lo documente
   (p. ej. «al crear el shell se aplica la escala guardada») y un comentario
   de una línea explicando la restricción.
4. Reescribir `app.component.spec.ts` para el shell real (sin `as any`, B15).

## Bloque 3 — Frontera de import con Zod (B2 + B14)

**Decisión tomada: añadir Zod como dependencia** (`npm install zod`).

1. TDD: primero los tests que hoy fallan — los cuatro casos del hallazgo B2
   (`info` basura, elementos de `diagnoses` no-string, `reviewedMedTabs: 42`,
   `labs` objeto vacío) más versión desconocida (`"version": "99.0"` se
   rechaza con mensaje claro, B14).
2. Definir el schema `CaseExport` en Zod (siguiendo CLAUDE.md: schema
   primero, derivar tipos con `z.infer`; sustituir los guards manuales
   `isPatientCase`/`isCaseExport` de `case-io.service.ts:25-38`).
3. El error de validación que le llega al usuario debe ser un mensaje breve
   en español («El fichero no es un caso válido…»), no el dump técnico de
   Zod, y `loadCase` no debe ejecutarse en absoluto con un fichero inválido
   (hoy hay carga parcial del estado — es el bug central de B2).
4. `version` queda validada contra la(s) versión(es) soportada(s) («1.0»).

## Bloque 4 — Bugs puntuales

1. **B3 — doble conteo del dx «Otro»**: en
   `diagnosis-step.component.ts`, `customDxFor` debe excluir el sufijo
   `__otro` (patrón ya existente en `customDrugsFor` de meds-step). Test:
   seleccionar «Otro» una vez suma exactamente 1 al badge del grupo y del
   tab, y no renderiza fila personalizada «otro».
2. **B4 — portapapeles**: `copyCriteria()` en ambos steps captura el rechazo
   de `navigator.clipboard.writeText` y muestra feedback (snackbar, patrón de
   `onFileLoad`). Test con clipboard doblado que rechaza.
3. **B8 — display-settings**: envolver los accesos a localStorage de
   `loadScale`/`apply` en try/catch (mismo criterio que `CaseStoreService`);
   si storage lanza, la app arranca con escala por defecto. Test con storage
   doblado que lanza.
4. **B13 — exportación JSON**: diferir `URL.revokeObjectURL` tras el click
   (`setTimeout(..., 0)` basta).
5. **Mejora 8 (misma familia que B4)**: `onExportPdf` en ambos steps captura
   errores de `ReportService.exportCase` y muestra snackbar.
6. **B7 + adenda — estado y código muerto**: eliminar del store `results`/
   `setResults` y `activeSystem`/`setActiveSystem` (y su persistencia); en
   ambos steps eliminar `exclusions`/`updateExclusions`/`excludedBy`,
   `lastCriterionId` y sus effects, y el computed `criteriaGroups` sin uso;
   en meds-step eliminar los helpers muertos post-refactor
   (`medicationById`, `medicationsByClass`, `durationCaptureMeds`) y las
   aserciones de spec que solo existían para cubrirlos. La suite en verde es
   la red: si algo estaba vivo de verdad, un test lo dirá.

## Bloque 5 — Accesibilidad y tipos de template (B11 + B12)

1. Filas de fármaco/diagnóstico: convertirlas en controles reales —
   `<label>` con `<input type="checkbox">` visualmente oculto (manteniendo el
   diseño actual con CSS) o `role="checkbox"` + `tabindex="0"` +
   `aria-checked` + manejo de Enter/Espacio. Elige UNA estrategia y aplícala
   uniformemente en ambos steps.
2. Toggle «Marcar como revisado»: input asociado de verdad al label.
3. Cabeceras plegables START/STOPP: `role="button"`, `tabindex="0"`,
   `aria-expanded`, teclado.
4. `TooltipDirective`: añadir `focus`/`blur`, `role="tooltip"` +
   `aria-describedby`, y clamp de la posición para no salirse del viewport
   por arriba (`tooltip.directive.ts:41`). Crear su spec (hoy no existe).
5. **B12**: sustituir los `$any($event.target)` restantes (2 en
   meds-step tras el refactor, y los que haya en diagnosis-step) por
   handlers tipados con narrowing (patrón `onTabSelectChange`,
   `meds-step.component.ts:231-233` pre-desplazamiento).
6. Tests de a11y mínimos: cada control nuevo es alcanzable por teclado y
   togglea con Enter/Espacio (Testing Library / harness de Angular).

## Bloque 6 — Higiene de tests (B15, lo que no haya caído ya)

1. `report.service.spec.ts`: reescribir contra la API pública
   (`exportCase()` con `createPdf` doblado verificando el `docDefinition`
   completo), eliminando el acceso a privados vía cast.
2. Añadir spec de `CaseIoService.exportCase()` (nombre de fichero, contenido
   serializado, revocación diferida del blob).
3. Eliminar los `as any` restantes en specs.

## Qué NO hacer

- No emprender el refactor grande de duplicación entre steps (toolbar,
  `onFileLoad`, `copyCriteria` compartidos): **fuera de alcance**, va en un
  encargo posterior. Si algún fix te obliga a duplicar algo pequeño en ambos
  steps, duplícalo y anótalo.
- No tocar `criteria.json`, `core/services/`, `core/data/`,
  `group-visibility.ts` (alcance Sección A, posible trabajo en paralelo).
- No tocar `TASKS.md`/`MEMORY.md` (se actualizan al cerrar); menciona en el
  informe que T7 y T12 quedan efectivamente resueltas por tus bloques 1-2.
- No commitear en `master` ni hacer push.

## Cierre

Suite completa en verde + `./scripts/check-links.sh` en verde. Informe en
`docs/revisiones/revision-seccion-b-ui-resultado.md` con totales de suite antes/después
(bajarán por las specs eliminadas — desglosa cuántas y por qué) y la lista de
commits en orden.
