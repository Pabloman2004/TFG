# Informe de revisión — Sección B: Servicios de aplicación y UI

- **Ronda:** Revisión general del proyecto (manifiesto `docs/proceso/manifiesto-revision-general-2026-07-17.md`)
- **Fecha:** 2026-07-17
- **Método:** análisis estático (no se ejecutó la suite Karma). Todos los hallazgos verificados sobre el código real con `fichero:línea`.

## Alcance revisado (ficheros leídos íntegros)

- `src/app/core/case-store.service.ts` (+ spec)
- `src/app/core/case-io.service.ts` (+ spec)
- `src/app/core/report.service.ts` (+ spec)
- `src/app/core/display-settings.service.ts` (+ spec)
- `src/app/core/group-visibility.ts`
- `src/app/core/group-checked.ts`
- `src/app/core/clipboard-text.ts`
- `src/app/core/criteria-groups.ts`
- `src/app/core/types.ts`
- `src/app/steps/meds-step/meds-step.component.ts` / `.html` (+ spec, cabecera)
- `src/app/steps/diagnosis-step/diagnosis-step.component.ts` / `.html` (+ spec, cabecera)
- `src/app/historial/historial.component.ts` / `.html` (+ spec)
- `src/app/app.ts`, `src/app/app.html`, `src/app/app.component.ts`, `src/app/app.routes.ts`, `src/app/app.routes.constants.ts`, `src/app/app.config.ts`, `src/main.ts`
- `src/app/confirm-reset-dialog.component.ts`, `src/app/display-options-dialog.component.ts`, `src/app/quick-guide-dialog.component.ts`
- `src/app/shared/tooltip.directive.ts`
- `src/types/json-logic-js.d.ts`, `src/types/pdfmake-browser.d.ts`
- Specs de shell: `app.spec.ts`, `app.component.spec.ts`, `app.routes.spec.ts`, `confirm-reset-dialog.component.spec.ts` (listado), `historial.component.spec.ts`

Todo el alcance pedido existe. No hay spec para `tooltip.directive.ts`, `quick-guide-dialog.component.ts`, `display-options-dialog.component.ts` ni `case-io.exportCase()` (solo `importFile`).

---

## Hallazgos

### B1 — El historial es una feature inaccesible: nada llama a `saveToHistory()` ni enlaza a `/historial` (severidad: **alta**)

`CaseStoreService.saveToHistory()` (`src/app/core/case-store.service.ts:114`) no tiene ningún call-site fuera de su propia definición: ni componentes, ni templates, ni el shell. Además, ningún template de la app contiene un enlace o botón hacia la ruta `historial`; la única mención en HTML está dentro del propio `historial.component.html`. La ruta existe (`src/app/app.routes.ts:14`) y hay tests que la validan (`src/app/app.routes.spec.ts:21`), pero un usuario:

1. No puede guardar nunca un caso en el historial (el botón "Guardar" de los pasos llama a `saveCase()` → `caseIo.exportCase()`, es decir, descarga JSON; `meds-step.component.ts:381`).
2. Solo puede llegar a la vista tecleando la URL a mano, y la encontrará siempre vacía ("No hay casos guardados todavía").

**Comprobación:** `grep -rn "saveToHistory" src/` → una sola aparición (la definición). `grep -rn "historial" src/app --include=*.html` → solo `historial.component.html`.

### B2 — Validación de importación incompleta: JSON malformados pasan el guard y rompen `loadCase` o inyectan basura en el estado (severidad: **media**)

`isPatientCase` (`src/app/core/case-io.service.ts:25-32`) no valida:

- `info`: cualquier valor (string, número, objeto arbitrario) se acepta y acaba en `store.patient` y persistido en localStorage.
- Los elementos de `diagnoses`: `["hta", 123, {}]` pasa (`Array.isArray` sin comprobar strings).
- `reviewedMedTabs` / `reviewedDxTabs`: un fichero con `"reviewedMedTabs": 42` pasa la validación y `loadCase` lanza `TypeError` en `new Set(patientCase.reviewedMedTabs ?? [])` (`src/app/core/case-store.service.ts:136`); el snackbar muestra el mensaje técnico en inglés del TypeError (`meds-step.component.ts:392-394` muestra `err.message` tal cual), y el estado queda parcialmente cargado (patient/diagnoses/meds ya se habían asignado en `case-store.service.ts:132-135`).
- `labs` con objeto vacío `{}` pasa (`Object.values({}).every(...)` es `true`), dejando un `Labs` sin claves cuya lectura devuelve `undefined` en vez de `null`.

**Comprobación:** importar un fichero con `{"version":"1.0","patientCase":{"info":"x","diagnoses":[],"medications":[],"labs":null,"reviewedMedTabs":42}}` → excepción no controlada por el validador y carga parcial. Los specs de `case-io.service.spec.ts` no cubren ninguno de estos cuatro casos.

### B3 — Doble conteo del diagnóstico "Otro" en badges de grupo y de tab (severidad: **media**)

Al pulsar "Otro" en un grupo de diagnósticos se añade el código `${group.id}__otro` (`diagnosis-step.component.ts:249-265`). Ese código cumple a la vez las dos ramas de conteo:

- `groupSelectionCount` (`diagnosis-step.component.ts:271-279`): suma `+1` por `isOtroDxSelected(group)` **y** `+1` porque `customDxFor(group)` (`:234-242`) no excluye el sufijo `__otro` (filtra solo `knownCodes` y `DIAGNOSIS_REVERSE_MAP`, y `${group.id}__otro` empieza por `${group.id}__`).
- `tabSelectionCount` (`diagnosis-step.component.ts:165-178`): mismo doble conteo.

Efecto visible: seleccionar una sola vez "Otro" muestra badge "2" en el grupo y en el tab, y además renderiza una fila personalizada rotulada literalmente "otro" (`diagnosis-step.component.html:188-195`). En meds no ocurre porque `customDrugsFor` excluye explícitamente los ids `otro__` (`meds-step.component.ts:313-315`) y el conteo los suma una sola vez (`:346-353`).

**Comprobación:** con la app abierta, en cualquier tab de diagnósticos pulsar "Otro" en un grupo → el contador del tab sube 2. Estáticamente: seguir `${group.id}__otro` por `customDxFor` + `isOtroDxSelected`.

### B4 — `copyCriteria()` sin manejo de fallo del portapapeles (severidad: **media**)

`navigator.clipboard.writeText(text)` puede rechazar (permiso denegado, documento sin foco, contexto no seguro). En `meds-step.component.ts:433-438` y `diagnosis-step.component.ts:337-342` la promesa rechazada no se captura: queda un *unhandled rejection*, `copied` nunca se pone a `true` y el usuario no recibe ningún feedback de error (a diferencia de `onFileLoad`, que sí usa try/catch + snackbar).

**Comprobación:** en Chrome, denegar el permiso "clipboard-write" para el origen y pulsar "Copiar criterios" → error en consola, botón sin cambio de estado.

### B5 — Shell `AppComponent` con UI muerta, input de fichero inalcanzable y dependencia oculta load-bearing (severidad: **media**)

El template real del shell (`src/app/app.component.ts:22-27`) solo contiene `<router-outlet>` y un `<input type="file">` oculto. Consecuencias:

- Nada dispara `fileInputRef` (`:76`), por lo que `onLoad` (`:91-107`) es inalcanzable desde el shell (los pasos tienen su propio input y su propio `onFileLoad`).
- `onSave` (`:87`), `openQuickGuide` (`:109`) y `resetCase` (`:113`) tampoco tienen ningún binding en el template: son duplicados muertos de los métodos equivalentes de los steps. `app.component.spec.ts` los testea, dando cobertura falsa a código sin ruta de ejecución en producción.
- ~45 líneas de CSS (`fab-stack`, `.fab`, `.io-ctrl`, `.io-btn`, `:28-73`) no casan con ningún elemento del template.
- La inyección de `DisplaySettingsService` (`:84`) parece "unused" pero es la que instancia el servicio y aplica `--font-scale` al arrancar (`display-settings.service.ts:26-29`). Si alguien la borra como limpieza, la escala guardada dejará de aplicarse hasta abrir el diálogo de visualización. No hay comentario ni test que proteja esto.

**Comprobación:** buscar `onSave|openQuickGuide|resetCase|fileInput` en el template inline de `app.component.ts` → solo `onLoad` ligado a un input que nadie abre.

### B6 — Doble raíz de aplicación: `app.ts` + `app.config.ts` muertos y providers divergentes (severidad: **media**)

`src/main.ts:11` bootstrapea `AppComponent` con providers inline (`provideAnimations`, `provideRouter`, `provideHttpClient`). Sin embargo conviven:

- `src/app/app.ts` (clase `App`) + `app.html` + `app.css` + `app.spec.ts`: componente raíz alternativo que nunca se monta; sus tests (`app.spec.ts:11-22`) prueban un componente muerto.
- `src/app/app.config.ts` (`appConfig`): no lo importa nadie (solo su propia definición). Declara `provideBrowserGlobalErrorListeners()` y `provideZoneChangeDetection({ eventCoalescing: true })` que el bootstrap real **no** aplica — quien lea `app.config.ts` creerá que hay listener global de errores cuando no lo hay.

**Comprobación:** `grep -rn "appConfig" src/` → solo `app.config.ts`; `grep -rn "from './app'" src/` → solo `app.spec.ts`.

### B7 — Estado muerto en `CaseStoreService` y computeds/effects muertos en los steps (severidad: **media**)

- `results` / `setResults` (`case-store.service.ts:14,78`): ningún componente los lee ni escribe (la UI usa `applicableCriteria` computado localmente). El propio constructor limpia la clave `results` "de versiones anteriores" (`:36`), confirmando que es legado.
- `activeSystem` / `setActiveSystem` (`:15,79`): persistido en localStorage en cada cambio (`:42`) y reseteado (`:104`), pero jamás leído por la UI.
- En ambos steps: `exclusions`/`updateExclusions`/`excludedBy` (`meds-step.component.ts:68,130-135,223-227,244-246`) y `lastCriterionId` + su effect (`meds-step.component.ts:69-70,136-146`; `diagnosis-step.component.ts:48-49,99-109`) no aparecen en ningún template (`grep "excludedBy|exclusions|lastCriterionId" src/app/steps/*/*.html` → vacío). Los effects recalculan `getExcludedMedications` en cada cambio de meds/diagnoses/labs para nada (coste + ruido).
- `criteriaGroups` computado (`meds-step.component.ts:97-99`, `diagnosis-step.component.ts:76-78`) tampoco se usa en template (los templates usan `startGroups`/`stoppGroups`).

**Comprobación:** greps indicados; ninguna otra referencia fuera de los ficheros citados.

### B8 — `DisplaySettingsService` accede a localStorage sin try/catch (severidad: **baja**)

`loadScale()` (`display-settings.service.ts:11`) y `apply()` (`:37`) llaman a `localStorage.getItem/setItem` sin protección. En contextos donde storage lanza (modo privado antiguo, políticas de empresa, iframes con storage bloqueado) el servicio revienta en construcción — y como lo inyecta el shell (B5), tira toda la app. `CaseStoreService` sí protege todos sus accesos (`case-store.service.ts:49-76`); el criterio debería ser uniforme.

### B9 — Sexo `null` se muestra como "Hombre" en el historial (severidad: **baja**)

`historial.component.html:29`: `{{ entry.patientCase.info?.sex === 'F' ? 'Mujer' : 'Hombre' }}`. Con `info` o `sex` a `null` (ambos legales según `types.ts:11`) la tarjeta afirma "Hombre". Debería haber un tercer estado ("—"/"No indicado").

### B10 — Borrar una entrada del historial reutiliza el diálogo "Limpiar todo" con texto engañoso (severidad: **baja**)

`historial.component.ts:35` abre `ConfirmResetDialogComponent`, cuyo título es "Limpiar todo" y cuyo cuerpo dice "Se perderán todos los datos del caso actual (medicaciones, diagnósticos y resultados)" (`confirm-reset-dialog.component.ts:13-19`). Lo que realmente ocurre es borrar **una** entrada guardada, sin tocar el caso actual. El usuario puede cancelar por miedo a perder su caso en curso, o creer que ha limpiado el caso cuando no.

### B11 — Accesibilidad: controles interactivos sin semántica ni teclado (severidad: **baja**, transversal)

- Filas de fármacos/diagnósticos: `<div class="drug-row" (click)="...">` con pseudo-checkbox `<div class="cbx">` sin `<input>`, `role`, `tabindex`, `aria-checked` ni manejo de teclado (`meds-step.component.html:267-271`, `diagnosis-step.component.html:180-187` y análogos). `grep "keydown|tabindex|role=" src/app/steps/*/*.html` → 0 resultados.
- Toggle "Marcar como revisado": `<label>` con `(click)` y `<span class="cbx">` sin input asociado (`meds-step.component.html:131-138`).
- Cabeceras plegables START/STOPP: `<div class="sys-hdr" (click)>` sin `role="button"`/`aria-expanded` (`meds-step.component.html:401,459`).
- `TooltipDirective` solo escucha `mouseenter`/`mouseleave` (`tooltip.directive.ts:15,33`): invisible para teclado (`focus`/`blur`) y sin `role="tooltip"`/`aria-describedby`. Además `top = tr.top - th - 10` (`:41`) puede quedar negativo (elemento pegado al borde superior) y el tooltip se sale del viewport.

### B12 — `$any()` ×9 en el template de meds-step (severidad: **baja**, norma CLAUDE.md "no any")

`meds-step.component.html:148,157,165,175,190,205,220,235,245`: `(input)="...($any($event.target).value)"`. `$any` desactiva el chequeo de `strictTemplates` exactamente igual que `any`. Patrón alternativo ya usado en el mismo proyecto: `onTabSelectChange(event: Event)` con narrowing en el TS (`meds-step.component.ts:231-233`).

### B13 — `URL.revokeObjectURL` síncrono tras `click()` en la exportación JSON (severidad: **baja**)

`case-io.service.ts:55-56`: se revoca la object URL inmediatamente después de `anchor.click()`. En Chromium actual funciona, pero es un patrón frágil (históricamente aborta la descarga en Firefox/Safari en según qué timing). Recomendado: `setTimeout(() => URL.revokeObjectURL(url))` o revocar en `requestIdleCallback`.

### B14 — El campo `version` del export no se interpreta (severidad: **baja**)

`isCaseExport` solo exige `typeof version === 'string'` (`case-io.service.ts:37`); un fichero `"version": "99.0"` (formato futuro incompatible) se importa sin aviso. No hay tabla de versiones ni migración; si el formato cambia alguna vez, los JSON antiguos/nuevos se mezclarán silenciosamente.

### B15 — Huecos y anti-patrones de test frente a CLAUDE.md (severidad: **baja**, proceso)

- `report.service.spec.ts:6,20,26,43,...` testea **métodos privados** vía cast (`(service as unknown as AnyReport)['buildHeader']`), contra "test through public API"; nadie testea `exportCase()` end-to-end (ni siquiera con `createPdf` doblado), así que el `docDefinition` completo (estilos, footer, fileName) no tiene red.
- `as any`: `app.component.spec.ts:18` y `historial.component.spec.ts:64` (`{ afterClosed: () => of(confirmed) } as any`).
- Sin tests: `saveToHistory`/`deleteFromHistory`/persistencia de `history` (el spec de `case-store` solo cubre tabs revisados), `CaseIoService.exportCase()`, `TooltipDirective`, `DisplayOptionsDialogComponent`, `QuickGuideDialogComponent`, `copyCriteria`, y los casos de validación de import descritos en B2.
- `app.component.spec.ts` y `app.spec.ts` dan cobertura a código muerto (B5/B6), enmascarando el problema.

---

## Mejoras propuestas (no bugs), priorizadas

1. **Decidir el destino del historial (ligado a B1):** o se añade el botón "Guardar en historial" + enlace de navegación (la infraestructura store/route/vista ya existe y está testeada), o se elimina la feature completa (ruta, componente, señal `history`, clave localStorage). Es la decisión de mayor impacto de la sección.
2. **Extraer la lógica duplicada meds-step/diagnosis-step:** toolbar completa (guardar/cargar/guía/reset/visualización), `onFileLoad`, `copyCriteria`, `toggleSection`/`isSectionCollapsed`, `onExportPdf`, effect de "tab revisado redundante" y el effect de `lastCriterionId` están copiados casi línea a línea en ambos componentes (p. ej. `meds-step.component.ts:381-450` vs `diagnosis-step.component.ts:285-354`). Un componente de toolbar + un servicio/composable de acciones eliminaría ~150 líneas duplicadas.
3. **Limpieza de código muerto:** `app.ts`/`app.html`/`app.css`/`app.spec.ts`, `app.config.ts` (o convertirlo en la fuente única de providers del bootstrap), CSS del shell, `results`/`activeSystem` del store, `exclusions`/`lastCriterionId`/`criteriaGroups` de los steps (B5–B7).
4. **Accesibilidad incremental (B11):** convertir `drug-row` en `<button>` o `<label><input type="checkbox">` (mantendría el diseño con CSS), añadir `aria-expanded` a las cabeceras plegables y soporte focus al tooltip. Es la mejora de mayor valor para usuarios de teclado/lector.
5. **Endurecer `isPatientCase` (B2) con schema:** el proyecto declara preferencia por "schemas at trust boundaries" (CLAUDE.md); un schema Zod para `CaseExport` sustituiría los guards manuales y cubriría `info`, elementos de arrays y tabs revisados de una vez.
6. **Diálogo de confirmación parametrizable (B10):** aceptar `{ title, message, confirmLabel }` vía `MAT_DIALOG_DATA` y reutilizarlo en reset e historial con textos correctos.
7. **Tipos de dominio como `type` en vez de `interface`:** `types.ts:8-85` usa `interface` para estructuras de datos puras (`PatientInfo`, `Med`, `Crit`, `Labs`, `PatientCase`, `SavedCase`, `CaseExport`); CLAUDE.md pide `type` para datos y reservar `interface` para contratos de comportamiento. Cambio mecánico, baja prioridad.
8. **Feedback de error en exportación PDF:** `onExportPdf` no captura errores (`meds-step.component.ts:419-429`); `ReportService.exportCase` los relanza (`report.service.ts:76-81`) y acaban como unhandled rejection sin snackbar.

---

## Adenda (2026-07-18) — tras la ronda d10-d11-h4-l6-campos-multitab

La ronda correctiva `docs/revision-d10-d11-h4-l6-campos-multitab-resultado.md`
(verificada por el orquestador: diff revisado + suite completa **669 SUCCESS**)
refactorizó `meds-step` e introdujo `src/app/core/clinical-capture.ts` (+ spec).
Impacto sobre los hallazgos:

- **B12 (mayormente resuelto):** los 5 paneles de captura hardcodeados por tab
  fueron sustituidos por un panel genérico data-driven; los `$any()` del
  template de meds-step bajan de **9 a 2** (`meds-step.component.html:147,162`:
  input de TFGe y el input genérico del panel). Quedan esos 2 y los del
  diagnosis-step.
- **B7 (ligera variación + código muerto nuevo):** tras el refactor,
  `medicationById`, `medicationsByClass` y `durationCaptureMeds`
  (`meds-step.component.ts:268-278`) ya no se usan en ningún template — solo
  los referencian los specs (`meds-step.component.spec.ts:177-194`), repitiendo
  el patrón de cobertura a código muerto descrito en B15. Valorar retirarlos o
  reutilizarlos al aplicar la mejora nº 2 (extracción de duplicación).
- **Desplazamiento de líneas:** `meds-step.component.ts` ganó ~9 líneas al
  inicio (import + computed `clinicalCaptureFields`,
  `meds-step.component.ts:123-130`); las referencias `meds-step.component.ts:N`
  de B2–B7/B15 quedan desplazadas aproximadamente +9 a partir de la línea 120.
  El HTML perdió ~80 líneas: las referencias al template a partir de la línea
  150 ya no son exactas.
- El resto de hallazgos B1–B15 **no se ven afectados** (el refactor no tocó
  case-store, case-io, report, historial, shell ni diagnosis-step).
- **Nota positiva:** el panel genérico usa `readonly`/datos inmutables y entró
  con TDD (spec nueva `clinical-capture.spec.ts`), alineado con CLAUDE.md.
