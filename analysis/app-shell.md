# Análisis: app-shell

## Propósito
Este módulo es la capa raíz de la aplicación Angular STOPP/START, un asistente clínico para detectar medicaciones potencialmente inapropiadas (criterios STOPP) y tratamientos indicados omitidos (criterios START) en pacientes polimedicados. Contiene el bootstrapping, la configuración global de rutas, los estilos base, los diálogos transversales y herramientas de desarrollo/auditoría fuera del build.

## Ficheros

### Punto de entrada y bootstrap
- `src/main.ts` — bootstrapea `AppComponent` con `provideAnimations`, `provideRouter` y `provideHttpClient`; es el punto de arranque real de la app.
- `src/index.html` — HTML raíz; carga fuentes Roboto y Material Icons desde Google Fonts, favicon `logoTFG.png`, monta `<app-root>`.

### Componentes raíz
- `src/app/app.component.ts` — componente raíz **activo** (`AppComponent`): orquesta I/O de casos (guardar/cargar JSON vía `CaseIoService`), diálogos de reset (`ConfirmResetDialogComponent`), guía rápida (`QuickGuideDialogComponent`) y navegación global; contiene un `<input type="file">` oculto para importar casos.
- `src/app/app.ts` — componente raíz **stub** (`App`): solo define un `signal` con el título de la app y renderiza `<router-outlet />`; parece un artefacto residual del scaffolding CLI que convive con `app.component.ts` (ver Problemas).
- `src/app/app.html` — template de `App` (stub): una sola línea `<router-outlet />`.
- `src/app/app.css` — hoja de estilos de `App` (stub): vacía (1 línea en blanco).

### Configuración y rutas
- `src/app/app.config.ts` — `ApplicationConfig` para el modo standalone (`App`): registra `provideRouter`, `provideZoneChangeDetection` y `provideBrowserGlobalErrorListeners`; usa el mismo `routes` que `app.routes.ts`. Solo es utilizado si se arranca desde `App` (stub), no desde `AppComponent`.
- `src/app/app.routes.ts` — define las rutas de la aplicación: raíz redirige a `medicaciones`; monta `DiagnosisStepComponent` en `diagnosticos` y `MedsStepComponent` en `medicaciones`; wildcard redirige a `medicaciones`. `historial` está declarado en las constantes pero **no tiene ruta asignada**.
- `src/app/app.routes.constants.ts` — constante `ROUTES` con los tres segmentos de URL: `diagnosticos`, `medicaciones`, `historial`.

### Diálogos transversales
- `src/app/confirm-reset-dialog.component.ts` — diálogo de confirmación de borrado total del caso; devuelve `true`/`false` al cerrarse mediante `[mat-dialog-close]`.
- `src/app/display-options-dialog.component.ts` — diálogo de opciones de visualización; permite elegir entre tres tamaños de fuente (pequeño/mediano/grande) delegando en `DisplaySettingsService`.
- `src/app/quick-guide-dialog.component.ts` — diálogo informativo con el flujo del asistente y resumen teórico de STOPP/START; sin lógica, solo contenido estático.

### Directiva compartida
- `src/app/shared/tooltip.directive.ts` — directiva `[appTooltip]` standalone: crea un `<div class="app-tooltip">` en el `<body>`, lo posiciona con `getBoundingClientRect` y gestiona la flecha apuntando al trigger; implementa `OnDestroy` para limpiar correctamente.

### Estilos globales
- `src/styles.css` — estilos globales: variable CSS `--font-scale`, layout del menú lateral (`.steps`, `.rail`, `.nav-item`, `.step-dot`), clases de formulario/card, estilos del tooltip custom (`.app-tooltip`, `.app-tooltip--visible` con flecha via `::before`/`::after`).
- `src/custom-theme.scss` — tema Material 3: paleta `azure`/`blue`, tipografía Roboto, `density: 0`; solo aplica `color-scheme: light`.

### Tipos TypeScript
- `src/types/json-logic-js.d.ts` — declaración de tipos para `json-logic-js`: expone `apply(rule, data)` y `add_operation`.
- `src/types/pdfmake-browser.d.ts` — declaración de tipos para `pdfmake/build/pdfmake` y `pdfmake/build/vfs_fonts`: define `PdfDocDefinition`, `PdfContent`, `PdfFontSpec` y la interfaz `PdfMakeBrowser` con `createPdf`.

### Scripts de desarrollo/auditoría
- `scripts/audit-criteria.cjs` — script Node.js one-shot que valida la consistencia entre `criteria.json`, `medications.ts` y `diagnoses.ts`: detecta clases de fármacos desconocidas, códigos de diagnóstico inexistentes y criterios que referencian medicamentos por nombre en lugar de por clase.
- `scripts/verify-pdf-e2e.js` — script e2e que genera dos PDFs con pdfmake (con y sin `liga:false`) y compara recuentos de glifos y texto extraído para verificar que las ligaduras tipográficas se desactivan correctamente.

### Tests
- `src/app/app.component.spec.ts` — 7 tests de `AppComponent`: cubre `resetCase` (confirmación, cancelación, undefined), `onSave`, `onLoad` (éxito y error).
- `src/app/app.spec.ts` — 2 tests del stub `App`: comprueba creación e `router-outlet`.
- `src/app/confirm-reset-dialog.component.spec.ts` — 3 tests de `ConfirmResetDialogComponent`: texto de aviso, botón confirmar, botón cancelar.

## Dependencias

### Hacia otros módulos del repo
- `AppComponent` → `CaseStoreService` (`./core/case-store.service`): para `reset()` del caso clínico.
- `AppComponent` → `CaseIoService` (`./core/case-io.service`): para `exportCase()` e `importFile(file)`.
- `AppComponent` → `DisplaySettingsService` (`./core/display-settings.service`): inyectado en `app.component.ts` aunque no se usa directamente desde ahí (sí en `DisplayOptionsDialogComponent`).
- `DisplayOptionsDialogComponent` → `DisplaySettingsService` (`./core/display-settings.service`): lee `fontScale` (signal), `scales` y llama `setFontScale`.
- `app.routes.ts` → `DiagnosisStepComponent` (`./steps/diagnosis-step/diagnosis-step.component`) y `MedsStepComponent` (`./steps/meds-step/meds-step.component`): carga estática (no lazy).
- `scripts/audit-criteria.cjs` → `src/assets/data/criteria.json`, `src/app/core/data/medications.ts`, `src/app/core/data/diagnoses.ts`: lectura directa de ficheros.

### Externas relevantes
- `@angular/core`, `@angular/router`, `@angular/platform-browser` — framework base Angular 17+ (standalone components, signals).
- `@angular/material` (button, icon, dialog, snack-bar, button-toggle) — componentes UI; tema Material 3 vía `custom-theme.scss`.
- `pdfmake/build/pdfmake` + `pdfmake/build/vfs_fonts` — generación de PDFs en el navegador (tipado en `pdfmake-browser.d.ts`, verificado en `verify-pdf-e2e.js`).
- `json-logic-js` — motor de reglas JSON para evaluar criterios STOPP/START (tipado en `json-logic-js.d.ts`).

## Conceptos de negocio

- **STOPP/START**: criterios clínicos estandarizados para detección de prescripciones inapropiadas (STOPP) y omisiones de tratamiento (START) en personas mayores polimedicadas.
- **Caso clínico**: conjunto de datos de un paciente (edad, sexo, diagnósticos, medicaciones activas) que se puede guardar y cargar como fichero JSON.
- **Reset de caso**: borrado completo de todos los datos del caso actual; acción destructiva confirmada por diálogo.
- **Medicaciones**: lista de fármacos activos del paciente, clasificados por clases terapéuticas.
- **Diagnósticos**: patologías y factores del paciente codificados (DIAGNOSIS_MAP).
- **Criterios**: reglas STOPP/START evaluadas mediante json-logic contra las medicaciones y diagnósticos del caso.
- **Exportación PDF**: generación de informe clínico descargable con los criterios aplicables.
- **Escala de fuente**: preferencia de accesibilidad (pequeño/mediano/grande) persistida en localStorage y aplicada como variable CSS `--font-scale`.

## Problemas detectados

- **Duplicación de componente raíz**: existen dos componentes raíz paralelos: `AppComponent` (en `app.component.ts`) y `App` (en `app.ts`). El bootstrap real en `main.ts` usa `AppComponent`, que tiene toda la lógica. `App` es un stub vacío con su propio `app.config.ts` y `app.spec.ts` — es un artefacto del scaffolding de Angular CLI que nunca se eliminó. Genera confusión sobre qué es la raíz real y aumenta la superficie de mantenimiento.

- **Ruta `historial` declarada pero sin componente**: `ROUTES.HISTORIAL = 'historial'` existe en `app.routes.constants.ts` pero no aparece en `app.routes.ts`. Cualquier código que navegue a `/historial` caerá en el wildcard y redirigirá a `medicaciones` silenciosamente.

- **`DisplaySettingsService` inyectado innecesariamente en `AppComponent`**: el constructor de `AppComponent` recibe `DisplaySettingsService` pero no lo usa en ningún método del componente (solo se usa en `DisplayOptionsDialogComponent`). La inyección no hace daño pero es ruido.

- **Carga de rutas estática (no lazy)**: `app.routes.ts` importa `DiagnosisStepComponent` y `MedsStepComponent` directamente, sin `loadComponent`. Para una app de auditoría clínica en uso interno esto es tolerable, pero impide code-splitting.

- **`verify-pdf-e2e.js` usa `PDFParse` con API de instancia incorrecta**: `new PDFParse({ data: ... }).getText()` no es la API pública de `pdf-parse` (que espera `pdfParse(buffer)`). ASUNCIÓN: el script puede estar roto o usando una versión o fork diferente de `pdf-parse`; no se puede confirmar sin ejecutarlo.

- **`app.css` vacío**: el fichero de estilos del stub `App` existe pero no contiene nada útil.

- **Estilos del tooltip acoplados a dos lugares**: la clase `.app-tooltip` y sus pseudo-elementos se definen en `styles.css` (global), pero la lógica de posicionamiento y creación del DOM está en `tooltip.directive.ts`. El contrato visual (nombre de clase, `--arrow-x`) es implícito entre los dos ficheros sin ningún comentario que lo documente.

- **Sin tests para `DisplayOptionsDialogComponent` y `QuickGuideDialogComponent`**: los diálogos `display-options-dialog` y `quick-guide-dialog` no tienen ficheros `.spec.ts`. El primero tiene lógica real (`onScaleChange` + señal reactiva) que queda sin cobertura.

- **Sin tests para `TooltipDirective`**: la directiva tiene lógica de posicionamiento no trivial (clamping, arrow offset) sin ninguna cobertura de tests.

- **`app.config.ts` huérfano**: si `App` (stub) se elimina, `app.config.ts` también deberá eliminarse; de lo contrario queda como configuración muerta.
