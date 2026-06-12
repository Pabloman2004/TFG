# Análisis: steps

## Propósito
Este módulo contiene los dos pasos principales del flujo de evaluación STOPP/START: `meds-step` para la selección de medicamentos y `diagnosis-step` para la selección de diagnósticos. Ambos presentan al clínico paneles de selección por sistemas (tabs) con visualización en tiempo real de los criterios STOPP/START activados según la combinación actual de medicamentos y diagnósticos del paciente.

## Ficheros

- `src/app/steps/meds-step/meds-step.component.ts` — lógica del paso de medicamentos: selección/deselección de fármacos por categoría terapéutica, cálculo de criterios aplicables, gestión de exclusiones, exportación de PDF y guardado/carga de caso
- `src/app/steps/meds-step/meds-step.component.html` — plantilla del paso de medicamentos: header con navegación, toolbar, panel de columnas de fármacos (bucket propio + bucket "relevantes de otros sistemas"), y columna derecha con cajas START/STOPP
- `src/app/steps/meds-step/meds-step.component.css` — estilos del paso de medicamentos (layout grid de dos columnas, tabs, tarjetas de criterios, responsivo)
- `src/app/steps/diagnosis-step/diagnosis-step.component.ts` — lógica del paso de diagnósticos: selección por sistema/grupo, integración con `CriteriaEngineService`, dependencias entre diagnósticos y medicamentos (cardiovascular), marcado de tabs como "revisados", diagnósticos personalizados ("Otro")
- `src/app/steps/diagnosis-step/diagnosis-step.component.html` — plantilla del paso de diagnósticos: misma estructura que meds-step pero con listas de diagnósticos en lugar de fármacos, incluyendo zona de "relevantes de otros sistemas"
- `src/app/steps/diagnosis-step/diagnosis-step.component.css` — estilos del paso de diagnósticos; prácticamente idéntico al CSS de meds-step con diferencias menores en el layout de columnas de diagnósticos (`.cols-flex--cols` usa grid auto-fill para el tab "otros")

## Dependencias

### Hacia otros módulos del repo
- `../../core/case-store.service` (`CaseStoreService`) — fuente de verdad reactiva: señales `meds()`, `diagnoses()`, `labs()`, `patient()`, `activeSystemTab()`, `collapsedSections()`, métodos de revisado de tabs (`isDxTabReviewed`, `toggleDxTabReviewed`, `isMedTabReviewed`, `toggleMedTabReviewed`)
- `../../core/services/criteria-engine.service` (`CriteriaEngineService`) — carga asíncrona de criterios STOPP/START (`loadCriteria()`), evaluación (`evaluate()`), relevancia cruzada entre tabs (`relevance()`), exclusiones de medicamentos (`getExcludedMedications()`)
- `../../core/report.service` (`ReportService`) — generación y exportación de PDF con los resultados del caso
- `../../core/case-io.service` (`CaseIoService`) — exportación/importación de caso en JSON
- `../../core/data/medications` (`MEDICATIONS`) — catálogo de medicamentos con sus clases farmacológicas
- `../../core/data/medications-taxonomy` (`DRUG_CATEGORIES`, `DrugCategory`, `DrugGroup`) — taxonomía de fármacos por sistemas para meds-step
- `../../core/data/diagnoses` (`normalizeDiagnosis`, `DIAGNOSIS_REVERSE_MAP`) — normalización de códigos de diagnóstico
- `../../core/data/diagnoses-taxonomy` (`DIAGNOSIS_TABS`, `DiagnosisTab`, `DiagnosisGroup`) — taxonomía de diagnósticos por sistemas para diagnosis-step
- `../../core/data/cardiovascular-dx-dependencies` (`CARDIOVASCULAR_DX_DEPS`, `isDiagnosisEnabled`) — dependencias que deshabilitan ciertos diagnósticos cardiovasculares según medicación activa
- `../../app.routes.constants` (`ROUTES`) — constantes de rutas para navegación entre pasos
- `../../core/clipboard-text` (`buildCriteriaText`) — construcción del texto para copiar criterios al portapapeles
- `../../core/criteria-groups` (`groupBySystem`, `critCode`, `CritGroup`) — agrupación de criterios por sistema orgánico y formateo del código
- `../../core/group-checked` (`isDxGroupChecked`, `isMedGroupChecked`) — helpers para determinar si un grupo tiene selección
- `../../shared/tooltip.directive` (`TooltipDirective`) — directiva de tooltip usada solo en meds-step (para nombres completos de grupos y tabs)
- `../../quick-guide-dialog.component`, `../../confirm-reset-dialog.component`, `../../display-options-dialog.component` — diálogos modales compartidos

### Externas relevantes
- `@angular/core` — signals (`signal`, `computed`, `effect`), `ChangeDetectionStrategy.OnPush`, `inject`, `ViewChild`
- `@angular/router` — navegación entre los dos pasos
- `@angular/material` — `MatSnackBar` (notificaciones), `MatDialog` (modales)
- `Intl.Collator('es')` — ordenación alfabética en español para diagnósticos y grupos foráneos

## Conceptos de negocio

- **Criterios STOPP** — criterios de medicamentos potencialmente inapropiados que deberían pararse (Screening Tool of Older Person's Prescriptions)
- **Criterios START** — medicamentos que deberían iniciarse y que el paciente no toma (Screening Tool to Alert doctors to Right Treatment)
- **Selección de medicamentos** — elección de fármacos activos del paciente, organizados por categoría terapéutica (cardiovascular, neurológico, etc.) con clases farmacológicas (`drugClass`)
- **Selección de diagnósticos** — elección de diagnósticos activos del paciente, organizados por sistema orgánico en tabs
- **Diagnósticos/medicamentos personalizados ("Otro")** — mecanismo para añadir ítems no presentes en el catálogo; codificados como `<group.id>__<nombre>` (diagnósticos) o `otro__<group.id>` (medicamentos)
- **Bucket "relevantes de otros sistemas"** — sección secundaria dentro de cada tab que muestra fármacos/diagnósticos de otras pestañas que son relevantes para criterios que aplican al tab actual; calculado mediante `criteriaEngine.relevance()`
- **Tab "revisado"** — marcador explícito que indica que el clínico ha revisado un tab aunque no haya seleccionado nada en él; se limpia automáticamente si hay selección en ese tab
- **Exclusiones de medicamentos** — criterios que contraindican explícitamente ciertos medicamentos (`getExcludedMedications`); visible en meds-step mediante `excludedBy(name)`
- **Dependencias cardiovasculares** — ciertos diagnósticos cardiovasculares están deshabilitados si no se han seleccionado los medicamentos correspondientes (`isDiagnosisEnabled`)
- **Exportación PDF** — generación de informe clínico con paciente, medicamentos, diagnósticos y criterios activados
- **Guardado/carga de caso** — persistencia del estado del caso en JSON local mediante `CaseIoService`

## Problemas detectados

- **Duplicación severa entre los dos componentes**: `MedsStepComponent` y `DiagnosisStepComponent` replican casi toda la infraestructura (misma estructura de efectos, mismas señales `criteria`/`lastCriterionId`/`copied`, mismos métodos `saveCase`, `openFilePicker`, `onFileLoad`, `openQuickGuide`, `openDisplayOptions`, `resetCase`, `onExportPdf`, `copyCriteria`, `toggleSection`, `isSectionCollapsed`). Los CSS son prácticamente idénticos (~800 líneas cada uno). Sería candidato a refactorizarse en un componente base o un servicio de UI compartido.

- **Lógica de `groupBuckets` y `groupsVisibleInTab` duplicada dentro del mismo componente**: En `DiagnosisStepComponent`, `groupBuckets` (computed) y `dxGroupsVisibleInTab` (método privado) calculan esencialmente lo mismo —los grupos propios más los foráneos relevantes— con código casi idéntico. Esto crea un riesgo de inconsistencia si se modifica uno y no el otro. Lo mismo ocurre en `MedsStepComponent` con `groupBuckets` y `groupsVisibleInTab`.

- **`lastCriterionId` declarada y calculada pero no usada en el template**: Ambos componentes mantienen el signal `lastCriterionId` y un efecto que lo actualiza, pero el HTML de ninguno de los dos lo referencia. ASUNCIÓN: puede ser una funcionalidad de scroll-to-new-criterion que fue eliminada o está pendiente.

- **Falta de tests**: No se observa ningún fichero `.spec.ts` en la carpeta `steps/`. Dada la complejidad de la lógica (cálculo de buckets foráneos, efectos reactivos en cadena, limpieza de tabs revisados), esta zona necesitaría tests unitarios.

- **Effect con `allowSignalWrites: true` en cadena**: En `DiagnosisStepComponent` hay tres efectos con `allowSignalWrites: true` que modifican `store.diagnoses()` y `store.isDxTabReviewed`. Escrituras de señales dentro de efectos pueden provocar ciclos reactivos difíciles de depurar si las condiciones de guarda fallan.

- **`MEDICATIONS` importado pero no usado directamente en `DiagnosisStepComponent`**: El import de `MEDICATIONS` aparece en la línea 17 del fichero de diagnosis-step pero ningún método del componente lo referencia; posiblemente es un import residual.

- **El "Otro" de diagnósticos no valida texto vacío**: `toggleOtroDx` simplemente añade el código `<group.id>__otro` sin ningún prompt al usuario para introducir el texto concreto. La UI muestra un botón "Otro" que al pulsarlo activa el diagnóstico, pero el texto "Otro" como diagnóstico puede resultar ambiguo en el informe PDF exportado.

- **Ancho fijo de la columna derecha de resultados**: El CSS de ambos pasos fija la columna derecha a `590px` (`grid-template-columns: minmax(0, 1fr) 590px`). En pantallas de ~800px de ancho esto hace que la columna izquierda sea muy estrecha antes de que se active el breakpoint de 1024px.
