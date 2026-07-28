# Mapa de documentación (patrón Linked Chunks)

Este fichero es la fuente de verdad del patrón: qué documentos existen, qué
ficheros de código deben llevar un comentario `@linked` apuntando a cada doc,
y qué ficheros quedan excluidos del patrón y por qué.

**Convención de parseo** (para `scripts/check-links.sh`):
- Cada documento tiene una sección `## Doc: docs/<concepto>.md`.
- Dentro, la subsección `### Ficheros que enlazan` lista en bullets con
  backticks las rutas (relativas a la raíz del repo, con `/`) que DEBEN
  contener una línea `@linked docs/<concepto>.md` en su cabecera.
- La sección `## Excluidos` lista ficheros que NO deben llevar `@linked`.
- Un fichero pertenece a exactamente UN documento (propiedad única) para
  evitar conflictos de escritura; las relaciones cruzadas se expresan en el
  grafo y dentro de los propios docs.

---

## Doc: docs/caso-clinico.md

**Concepto**: el modelo de dominio del caso clínico (paciente, medicaciones,
diagnósticos, analítica) y el estado reactivo de sesión con persistencia en
`localStorage` (incluye los tabs revisados).

**Debe cubrir**: tipos de dominio (`PatientInfo`, `Med`, `Crit`, `Labs`,
`PatientCase`, `CaseExport`), el store de signals, el ciclo
persistencia/rehidratación, y el acoplamiento actual estado UI / estado dominio.

### Ficheros que enlazan
- `src/app/core/types.ts`
- `src/app/core/case-store.service.ts`

---

## Doc: docs/catalogo-clinico.md

**Concepto**: el catálogo estático de conocimiento clínico — diagnósticos,
medicamentos, sus taxonomías de UI (tabs/grupos/subgrupos), las dependencias
de diagnósticos cardiovasculares respecto a la medicación activa, y las
familias de variantes de diagnóstico mutuamente excluyentes (P15).

**Debe cubrir**: mapas de diagnósticos y su normalización (snake_case,
`grupo__sufijo`), catálogo de fármacos y clases farmacológicas, construcción
de `DIAGNOSIS_TABS` / `DRUG_CATEGORIES`, duplicación física de grupos cuando
hace falta, `isDiagnosisEnabled`, y la sección P15 de variantes
(`DIAGNOSIS_VARIANT_FAMILIES`, `applyMutex`, `partitionGroupDiagnoses`).

### Ficheros que enlazan
- `src/app/core/data/diagnoses.ts`
- `src/app/core/data/diagnoses-taxonomy.ts`
- `src/app/core/data/medications.ts`
- `src/app/core/data/medications-taxonomy.ts`
- `src/app/core/data/dx-dependencies.ts`
- `src/app/core/data/diagnosis-variants.ts`
- `src/app/core/data/diagnosis-variant-view.ts`

---

## Doc: docs/motor-criterios.md

**Concepto**: el motor de evaluación STOPP/START — carga de `criteria.json`,
evaluación json-logic con operadores personalizados, exclusión proactiva de
medicamentos, y el índice de relevancia por tab que alimenta la UI.

**Debe cubrir**: flujo `loadCriteria()` → `evaluate()` →
`getExcludedMedications()`, operadores custom (`inDrugClass`, `egfrBelow`,
`digoxinaDosisAlta`, `multipleNSAIDs`…), normalización case-insensitive,
estructura de `criteria.json` (215 criterios, 13 sistemas; ver Excluidos),
`buildRelevance` / `SYSTEM_TO_TABS`, los helpers de test compartidos y el
script de auditoría de consistencia del catálogo.

### Ficheros que enlazan
- `src/app/core/services/criteria-engine.service.ts`
- `src/app/core/services/criteria-test-helpers.ts`
- `src/app/core/data/system-relevance.ts`
- `src/types/json-logic-js.d.ts`
- `scripts/audit-criteria.cjs`

---

## Doc: docs/flujo-pasos.md

**Concepto**: el flujo de trabajo del clínico en los dos pasos de la
aplicación (selección de medicación y de diagnósticos): tabs por sistema,
bucket de "relevantes de otros sistemas", tabs revisados, ítems
personalizados "Otro", y la presentación agrupada de criterios activos.

**Debe cubrir**: estructura común de ambos componentes (y su duplicación),
efectos reactivos con `allowSignalWrites`, `groupBuckets` vs
`groupsVisibleInTab`, la lógica unificada de visibilidad en `group-visibility.ts`,
visibilidad de medicamentos por grupos del tab en `clinical-capture.ts`
(`medsVisibleInTabGroups`; sin captura UI de dosis/duración — los umbrales
viven en el `summary` del criterio),
resaltado de procedencia al marcar un fármaco foráneo en `foreign-provenance.ts`,
panel fijo de analíticas/constantes en `lab-capture.ts` (todos los campos, siempre; pestaña «Otros» de diagnósticos),
helpers `isMedGroupChecked`/`isDxGroupChecked`, agrupación `groupBySystem`/`critCode`.

### Ficheros que enlazan
- `src/app/steps/meds-step/meds-step.component.ts`
- `src/app/steps/meds-step/meds-step.component.html`
- `src/app/steps/diagnosis-step/diagnosis-step.component.ts`
- `src/app/steps/diagnosis-step/diagnosis-step.component.html`
- `src/app/core/group-checked.ts`
- `src/app/core/criteria-groups.ts`
- `src/app/core/group-visibility.ts`
- `src/app/core/clinical-capture.ts`
- `src/app/core/foreign-provenance.ts`
- `src/app/core/lab-capture.ts`

---

## Doc: docs/informes-y-exportacion.md

**Concepto**: las salidas del caso clínico — informe PDF (pdfmake),
exportación/importación de caso en JSON versionado (`1.0`), y texto plano de
criterios para portapapeles.

**Debe cubrir**: construcción del PDF (cabecera con logo, tablas STOPP/START),
formato `CaseExport` y su validación (actualmente superficial),
`buildCriteriaText`, el tipado ambiente de pdfmake y el script e2e de
verificación de ligaduras.

### Ficheros que enlazan
- `src/app/core/report.service.ts`
- `src/app/core/case-io.service.ts`
- `src/app/core/case-export.schema.ts`
- `src/app/core/clipboard-text.ts`
- `src/types/pdfmake-browser.d.ts`
- `scripts/verify-pdf-e2e.js`

---

## Doc: docs/navegacion-y-shell.md

**Concepto**: el arranque de la aplicación y su esqueleto de navegación —
bootstrap, rutas, componente raíz con las acciones globales (guardar/cargar
caso, reset confirmado, guía rápida).

**Debe cubrir**: `main.ts` → `AppComponent` con `appConfig`, tabla de rutas y
sus constantes (`medicaciones`, `diagnosticos`, wildcard), y los diálogos
transversales de confirmación y guía.

### Ficheros que enlazan
- `src/main.ts`
- `src/app/app.component.ts`
- `src/app/app.routes.ts`
- `src/app/app.routes.constants.ts`
- `src/app/confirm-reset-dialog.component.ts`
- `src/app/quick-guide-dialog.component.ts`

---

## Doc: docs/accesibilidad-ui.md

**Concepto**: las utilidades transversales de UI y accesibilidad — escala de
fuente persistida (tres niveles, variable CSS `--font-scale`) y el tooltip
custom, cuyo contrato visual se reparte entre la directiva y los estilos
globales.

**Debe cubrir**: `DisplaySettingsService` + diálogo de opciones de
visualización, `TooltipDirective` y su contrato implícito con `.app-tooltip`
en `styles.css`.

### Ficheros que enlazan
- `src/app/core/display-settings.service.ts`
- `src/app/display-options-dialog.component.ts`
- `src/app/shared/tooltip.directive.ts`
- `src/styles.css`

---

## Grafo de relaciones (doc ↔ código ↔ doc)

```
caso-clinico ──tipos──────────────► motor-criterios, flujo-pasos,
  (types.ts, case-store)             informes-y-exportacion
catalogo-clinico ──catálogos──────► motor-criterios (MEDICATIONS, taxonomías),
  (data/* + diagnosis-variants*)     flujo-pasos (tabs, isDiagnosisEnabled,
                                     variantes excluyentes P15)
motor-criterios ──Crit[], relevance, exclusiones──► flujo-pasos
  (engine, system-relevance)         ▲ consume criteria.json (excluido)
flujo-pasos ──acciones de usuario──► informes-y-exportacion (PDF, JSON, copy)
  (steps + group-visibility)
navegacion-y-shell ──monta─────────► flujo-pasos (rutas diagnosticos/
                                     medicaciones) y diálogos
accesibilidad-ui ──transversal─────► usado por flujo-pasos y navegacion-y-shell
```

---

## Excluidos

Ficheros que NO llevan `@linked`, con motivo:

- `src/assets/data/criteria.json` — JSON no admite comentarios; está
  documentado en `docs/motor-criterios.md` y auditado por
  `scripts/audit-criteria.cjs`.
- `src/app/**/*.spec.ts` (todos los specs) — tests: se actualizan junto al
  fichero que prueban; los docs los citan en "Si cambias esto…".
- `src/app/app.config.ts` — fuente única de providers del bootstrap; se
  importa desde `main.ts` (sin `@linked` propio).
- `src/app/steps/meds-step/meds-step.component.css`,
  `src/app/steps/diagnosis-step/diagnosis-step.component.css` — estilos de
  presentación sin lógica de negocio.
- `src/index.html` — HTML raíz trivial (fuentes, favicon, `<app-root>`).
- `src/custom-theme.scss` — tema Material 3 generado, sin lógica.
- `src/assets/logoTFG.png` — binario.
- `public/favicon.ico` — binario.
- Subcarpetas fuera del patrón Linked Chunks (sin `@linked` desde código;
  `check-links.sh` solo audita `docs/*.md` de primer nivel):
  - `docs/clinico/` — referencia clínica (`STOPP_START_CRITERIOS_CONTEXTO.md`)
    y dudas para la tutora (`dudas-raquel-pendientes.md`).
  - `docs/arquitectura/` — diagramas UML.
  - `docs/propuestas/` — propuestas y planes de mejora (P14, P15, dosis/duración,
    visibilidad multiclase).
  - `docs/revisiones/` — manifiestos e informes de rondas cerradas.
  - `docs/historico/analysis/` — snapshots de análisis previos a los docs @linked.
  - `docs/proceso/` — operación viva del loop Ralph (`RALPH.md`, `REVIEW.md`,
    `VERIFICATION.md`, `progreso-ronda.md`).
