> **Snapshot histórico** (análisis de código ~2026-06-12). No es fuente de verdad del comportamiento actual; ver los docs Linked Chunks en `docs/` y `docs/_map.md`. Conservado como antecedente de `docs/proceso/REVIEW.md`.

# Análisis: core

## Propósito
Este módulo es el núcleo de la aplicación STOPP/START: define todos los tipos de dominio clínico (paciente, medicación, diagnóstico, criterios, laboratorio), gestiona el estado reactivo de la sesión actual con persistencia en `localStorage`, y provee las utilidades transversales de exportación/importación de casos, generación de informes PDF, y presentación de criterios para portapapeles. Existe porque separa la lógica de negocio y el estado global de los componentes de presentación.

## Ficheros

- `src/app/core/types.ts` — Declara todos los tipos e interfaces del dominio: `Sex`, `PatientInfo`, `Med`, `Crit`, `Labs`, `PatientCase`, `SavedCase`, `CaseExport` y `JsonLogicRule`.
- `src/app/core/case-store.service.ts` — Servicio singleton Angular con señales (`signal`) que contiene el estado completo de la sesión (paciente, diagnósticos, medicaciones, labs, resultados, historial, tabs revisados) y lo persiste/rehidrata automáticamente de `localStorage` mediante `effect()`.
- `src/app/core/case-io.service.ts` — Servicio que orquesta la exportación del caso activo a un archivo JSON descargable y la importación validada de ese mismo formato (versión `1.0`), delegando en `CaseStoreService` para la carga.
- `src/app/core/report.service.ts` — Servicio que genera y descarga un PDF del informe STOPP/START usando `pdfmake`; construye cabecera con logo, tabla de diagnósticos/medicaciones y tablas de criterios STOPP y START con filas alternas y pie de página.
- `src/app/core/clipboard-text.ts` — Función pura `buildCriteriaText(criteria)` que formatea la lista de criterios activos como texto plano (agrupado por sistema) para copiar al portapapeles.
- `src/app/core/criteria-groups.ts` — Funciones puras `groupBySystem(criteria)` y `critCode(id)`: la primera agrupa criterios `Crit[]` en `CritGroup[]` preservando el orden de aparición; la segunda extrae el código de sección (`B1`, `H3`, etc.) del ID de un criterio.
- `src/app/core/display-settings.service.ts` — Servicio singleton que gestiona la escala de fuente de la UI (valores: `1`, `1.15`, `1.3`), la persiste en `localStorage` con clave `font-scale` y la aplica como variable CSS `--font-scale` en `document.documentElement`.
- `src/app/core/group-checked.ts` — Funciones puras `isMedGroupChecked(group, meds)` e `isDxGroupChecked(group, diagnoses)` que determinan si un grupo de medicación o diagnóstico tiene algún elemento seleccionado, incluyendo lógica para la opción "Otro" y fármacos custom por clase.

### Ficheros de test (solo `core/`)
- `case-io.service.spec.ts` — Cubre importación válida e inválida (JSON malformado, estructura incorrecta, tipos erróneos, campos opcionales de tabs revisados). Usa `jasmine.SpyObj<CaseStoreService>`.
- `case-store.service.spec.ts` — Cubre el ciclo completo de `reviewedMedTabs`/`reviewedDxTabs`: toggle, clear, reset, serialización en `patientCase`, carga desde `loadCase`, y rehidratación desde `localStorage`.
- `clipboard-text.spec.ts` — Cubre el formateo de texto plano: lista vacía, encabezado de sistema, resumen, tipo STOPP/START, código de sección, agrupación y sistemas múltiples.
- `criteria-groups.spec.ts` — Cubre `groupBySystem` (vacío, orden, agrupación, contador) y `critCode` (IDs con y sin guiones).
- `display-settings.service.spec.ts` — Cubre defaults, restauración desde `localStorage`, valores inválidos, actualización de señal, persistencia y aplicación de la CSS custom property.
- `group-checked.spec.ts` — Cubre `isMedGroupChecked` (vacío, fármaco conocido, "Otro", clase custom, otras clases, inmutabilidad) e `isDxGroupChecked` (vacío, diagnóstico normalizado, "Otro", código custom, códigos ajenos).

## Dependencias

### Hacia otros módulos del repo
- `core/data/medications-taxonomy` — `DrugGroup`, `resolveMedicationLabel`: usados en `group-checked.ts` y `report.service.ts` para obtener la etiqueta legible de medicaciones.
- `core/data/diagnoses-taxonomy` — `DiagnosisGroup`: usado en `group-checked.ts` para la estructura de grupos de diagnóstico.
- `core/data/diagnoses` — `normalizeDiagnosis`, `DIAGNOSIS_REVERSE_MAP`, `resolveDiagnosisLabel`: usados en `group-checked.ts` y `report.service.ts` para normalizar y resolver etiquetas de diagnósticos.
- `core/services/criteria-engine.service` (subcarpeta `services/`, analizada por otro agente): consume los `Crit[]` que el engine produce y deposita en `CaseStoreService.results`.

### Externas relevantes
- `@angular/core` (`Injectable`, `signal`, `effect`) — arquitectura reactiva sin RxJS para el estado global.
- `pdfmake` (`pdfmake/build/pdfmake`, `pdfmake/build/vfs_fonts`) — generación del PDF del informe clínico. Es una dependencia de diseño fuerte: el formato del informe está totalmente acoplado a la API de `pdfmake`.

## Conceptos de negocio

- **Paciente** (`PatientInfo`): nombre, edad, sexo, MRN, peso, altura, notas.
- **Medicación** (`Med`): fármaco normalizado con clases farmacológicas, dosis en mcg/día y duración del tratamiento.
- **Criterio STOPP/START** (`Crit`): criterio clínico con tipo (`STOPP` prescripción inapropiada / `START` prescripción recomendada), sistema orgánico, resumen textual, regla JsonLogic y exclusiones de medicación.
- **Laboratorio** (`Labs`): parámetros bioquímicos y vitales usados por las reglas (glucosa, creatinina, eGFR, INR, TSH, FC, QTc, electrolitos, presión arterial).
- **Caso clínico** (`PatientCase`): agregado evaluable por el motor de criterios.
- **Historial** (`SavedCase`): casos guardados localmente con UUID e ISO timestamp.
- **Exportación/Importación de caso** (`CaseExport`): formato versionado (`1.0`) para intercambio de casos entre sesiones o usuarios.
- **Tabs revisados**: seguimiento de qué secciones de medicación/diagnóstico ha revisado el clínico dentro de la sesión.
- **Escala de fuente** (accesibilidad): ajuste de tamaño de UI en tres niveles.
- **Informe PDF**: documento clínico descargable con criterios aplicables, lista de diagnósticos y medicaciones.

## Problemas detectados

- **`report.service.ts` sin tests**: es el fichero más complejo del módulo (280 líneas, múltiples métodos privados de construcción de PDF) y no tiene ningún spec. La lógica de `buildCriteriaContent`, `buildTwoColumnSection` y `buildHeader` no está cubierta; un error en la generación del PDF solo se detectaría en runtime.
- **Validación de importación frágil en `case-io.service.ts`**: `isCaseExport` y `isPatientCase` solo comprueban que `diagnoses` y `medications` sean arrays y que `version` sea string. No validan tipos internos de `Med`, `PatientInfo` ni `Labs`. Un JSON con datos corruptos pasaría la validación y podría causar errores silenciosos más adelante en el motor de criterios.
- **`CaseStoreService` acopla estado UI con estado de dominio**: `activeSystem`, `activeSystemTab` y `collapsedSections` son señales de navegación de la UI que conviven en el mismo servicio con el estado clínico (`patient`, `diagnoses`, `meds`, `labs`). Esto hace el servicio más difícil de testear aisladamente y podría dificultar una futura extracción del store de dominio.
- **`critCode(id)` asume el formato `TYPE-CODE-REST`**: la función hace `id.split('-')[1] ?? ''`; si el ID no sigue ese convenio (p. ej. un mock mal formado), devuelve cadena vacía sin advertencia. Los tests lo cubren para el caso sin guiones, pero no para IDs con un solo guion.
- **`loadLogoBase64()` en `report.service.ts` hace `fetch('assets/logoTFG.png')`**: la ruta del logo está hardcodeada como string literal. Si el asset se renombra o mueve, el PDF se generará sin logo sin ningún error visible (el método devuelve `null` silenciosamente).
- **`DisplaySettingsService` llama `localStorage` directamente en `loadScale()`** (función de módulo, fuera de la clase): esto ejecuta `localStorage.getItem` en tiempo de carga del módulo, lo que puede fallar en entornos SSR o en tests que no mockeen `localStorage` antes del import.
- ASUNCIÓN: `report.service.ts` usa el tipo `PdfDocDefinition` sin importarlo explícitamente en el código leído — se asume que existe una declaración de tipo global o ambient para `pdfmake` en el proyecto.
- ASUNCIÓN: `CaseStoreService.persist` silencia todos los errores de `localStorage` (cuota excedida, modo incógnito); no hay mecanismo de notificación al usuario si la persistencia falla reiteradamente.
