# Caso clínico

## Qué hace

Define el modelo de dominio de la aplicación STOPP/START y gestiona el estado reactivo de la sesión activa del clínico, incluyendo la persistencia automática en `localStorage` y el historial de casos guardados.

Un "caso clínico" es el agregado evaluable por el motor de criterios: datos del paciente (`PatientInfo`), lista de medicaciones activas (`Med[]`), lista de diagnósticos (`string[]`), parámetros de laboratorio (`Labs`) y metadatos de progreso de revisión (tabs revisados). El store centraliza ese estado y lo serializa/rehidrata automáticamente entre sesiones del navegador.

## Cómo está implementado

### Tipos de dominio — `src/app/core/types.ts`

Declara todas las interfaces del dominio clínico:

- `PatientInfo` — datos demográficos: nombre, edad, sexo (`'F' | 'M'`), MRN, peso, altura, notas.
- `Med` — medicación normalizada: `id` (nombre del fármaco), `drugClasses` (clases farmacológicas), `doseMcgDay` (dosis en microgramos/día), `durationDays` (duración del tratamiento en días).
- `Crit` — criterio STOPP/START evaluado: tipo (`'STOPP'` | `'START'`), sistema orgánico, resumen textual, regla JsonLogic y lista `excludes` de medicaciones/clases que descartar cuando el criterio se cumple.
- `Labs` — parámetros bioquímicos y vitales: glucosa, colesterol, triglicéridos, HDL, LDL, creatinina, eGFR, INR, TSH, frecuencia cardíaca, QTc, electrolitos (K⁺, Na⁺, Ca²⁺ corregido), presión arterial sistólica y diastólica.
- `PatientCase` — agregado evaluable: `info`, `diagnoses`, `medications`, `labs`, más los arrays opcionales `reviewedMedTabs` y `reviewedDxTabs` (IDs de tabs revisados).
- `SavedCase` — entrada del historial local: UUID generado con `crypto.randomUUID()`, timestamp ISO y el `PatientCase` completo.
- `CaseExport` — formato de intercambio versionado (`version: string`, `exportedAt`, `patientCase`) usado por `case-io.service.ts` para exportar/importar a JSON.
- `JsonLogicRule` — alias de `Record<string, unknown>` que tipifica las reglas JsonLogic almacenadas en `criteria.json`.

### Store de sesión — `src/app/core/case-store.service.ts`

Servicio Angular singleton (`providedIn: 'root'`) basado exclusivamente en signals de Angular (sin RxJS). Contiene:

**Signals de dominio clínico:**
| Signal | Tipo | Clave `localStorage` |
|--------|------|----------------------|
| `patient` | `PatientInfo \| null` | `patient` |
| `diagnoses` | `string[]` | `diagnoses` |
| `meds` | `Med[]` | `meds` |
| `labs` | `Labs \| null` | `labs` |
| `results` | `Crit[]` | — (no persiste) |

**Signals de estado UI:**
| Signal | Tipo | Clave `localStorage` |
|--------|------|----------------------|
| `activeSystem` | `string` | `activeSystem` |
| `activeSystemTab` | `string` | `activeSystemTab` |
| `collapsedSections` | `string[]` | — (no persiste) |
| `reviewedMedTabs` | `Set<string>` | `reviewedMedTabs` |
| `reviewedDxTabs` | `Set<string>` | `reviewedDxTabs` |

**Historial:**
| Signal | Tipo | Clave `localStorage` |
|--------|------|----------------------|
| `history` | `SavedCase[]` | `historial` |

**Ciclo de persistencia/rehidratación:**

1. En el `constructor`, cada signal se inicializa leyendo `localStorage` mediante los métodos privados `load<T>(key)` (JSON.parse) y `loadString(key)` (string literal). Los errores de parseo devuelven `null`.
2. A continuación, un `effect()` por signal serializa el valor con `JSON.stringify` cada vez que cambia. Cuando el valor es `null`, elimina la clave. Los errores de escritura (cuota excedida, modo incógnito) se silencian con `try/catch`.
3. `results` no persiste entre sesiones: el constructor llama `this.persist('results', null)` explícitamente para limpiar cualquier valor cacheado de versiones anteriores.
4. `reviewedMedTabs` y `reviewedDxTabs` son `Set<string>` en memoria pero se serializan como arrays al persistir (`[...signal()]`) y se rehidratan con `new Set(array)`.

**API pública relevante:**

- `get patientCase(): PatientCase` — snapshot inmutable del caso actual; lo usan `saveToHistory()`, `case-io.service.ts` y `report.service.ts`.
- `loadCase(patientCase)` — reemplaza todo el estado de dominio (sin tocar el historial); limpia `results` y reinicia `activeSystem`.
- `loadFromHistory(entry)` — delega en `loadCase`; el componente historial navega tras llamar a este método.
- `saveToHistory()` — crea un `SavedCase` con UUID e ISO timestamp y lo antepone al historial.
- `deleteFromHistory(id)` — filtra por UUID.
- `reset()` — limpia todas las signals de dominio/UI (no el historial) y elimina sus claves de `localStorage`.
- `toggleMedTabReviewed` / `toggleDxTabReviewed` / `clearMedTabReviewed` / `clearDxTabReviewed` — gestionan el conjunto de tabs revisados en la sesión.

## Decisiones de diseño

- **Signals de Angular en lugar de RxJS**: el estado global se gestiona con `signal()` + `effect()` (Angular 17+), eliminando la complejidad de Observables para un modelo de estado sencillo y síncrono.
- **Persistencia automática con `effect()`**: cada signal tiene su propio `effect` de escritura, lo que garantiza que cualquier mutación, independientemente de quién la origine, se refleje en `localStorage` sin necesidad de llamadas explícitas a "save".
- **El historial no se limpia en `reset()`**: `reset()` solo borra el caso activo. El historial (`SavedCase[]`) sobrevive al reset intencionalmente para que el clínico pueda recuperar evaluaciones previas.
- **`results` no se persiste**: los criterios evaluados (`Crit[]`) se recalculan al ejecutar el motor; persistirlos introduciría riesgo de incoherencia entre la sesión guardada y la versión actual de `criteria.json`.
- **`SavedCase` incrusta el `PatientCase` completo**: no hay referencia por ID a una base de datos externa; el caso entero (incluyendo tabs revisados) se serializa en el array `historial` de `localStorage`. Esto hace la importación/exportación trivial pero incrementa el tamaño del almacenamiento con cada entrada guardada.
- **Estado UI en el mismo servicio que el dominio**: `activeSystem`, `activeSystemTab` y `collapsedSections` conviven con los signals clínicos en `CaseStoreService`. Esto simplifica el acceso desde los componentes pero acopla la navegación de la UI al modelo de dominio.

## Invariantes

- `PatientCase.medications` es siempre un array (nunca `undefined`); los componentes pueden iterar sobre él sin comprobar nulidad.
- `PatientCase.diagnoses` es siempre un array (nunca `undefined`).
- El `id` de un `SavedCase` es único (generado con `crypto.randomUUID()`); `deleteFromHistory` filtra por ese campo.
- Al llamar a `loadCase`, `results` se vacía (`[]`) para forzar una nueva evaluación por el motor de criterios.
- Los errores de `localStorage` (lectura o escritura) no propagan excepciones; la app continúa funcionando sin persistencia en ese caso.
- `reviewedMedTabs` y `reviewedDxTabs` son `Set<string>` en memoria; se exponen como arrays en `PatientCase` para ser serializables en JSON.

## Si cambias esto…

- **`types.ts`** — Añadir o renombrar campos de `PatientInfo`, `Med`, `Labs` o `PatientCase` afecta a:
  - `case-store.service.ts` (rehidratación y `patientCase` getter).
  - `case-io.service.ts` (validación `isCaseExport`/`isPatientCase`; actualmente solo comprueba que `diagnoses` y `medications` sean arrays — ampliar la validación si añades campos obligatorios).
  - `report.service.ts` (construcción del PDF, que itera sobre `Med` y `Labs` directamente).
  - `criteria-engine.service.ts` (recibe `PatientCase` para la evaluación).
  - `historial.component.ts` / `historial.component.html` (muestra campos de `PatientInfo` y recuentos de `medications`/`diagnoses`).
  - Los specs de `case-store.service.spec.ts` y `case-io.service.spec.ts`.
  - Este documento.

- **`case-store.service.ts`** — Modificar claves de `localStorage`, añadir signals o cambiar la lógica de `reset`/`loadCase` afecta a:
  - Todos los componentes que consumen el store (`meds-step`, `diagnosis-step`, `historial`, `app.component`).
  - `case-io.service.ts` (llama a `loadCase` para importar).
  - `report.service.ts` y `clipboard-text.ts` (consumen `patientCase` getter).
  - `case-store.service.spec.ts` (cubre el ciclo completo de tabs revisados y `localStorage`).
  - Este documento (especialmente la tabla de signals y el ciclo de persistencia).

- **Añadir un nuevo tipo de señal de "progreso"** (p.ej. `reviewedLabTabs`): replicar el patrón `Set<string>` → persistir como array → rehidratar con `new Set()`; añadir la variante `toggle/clear` y serializar en `patientCase`.

## Asunciones

- `CaseStoreService.persist` silencia todos los errores de `localStorage` (cuota excedida, modo incógnito); no hay mecanismo de notificación al usuario si la persistencia falla reiteradamente.
- El proyecto usa Angular ≥ 17.1, donde los signals propagan cambios con `ChangeDetectionStrategy.OnPush` automáticamente.
- La validación de importación en `case-io.service.ts` es superficial (solo comprueba que `diagnoses` y `medications` sean arrays y que `version` sea string); un JSON con datos internos corruptos (p.ej. `Med` sin `id`) pasaría la validación y podría causar errores silenciosos en el motor de criterios.
- `collapsedSections` no persiste en `localStorage` (no tiene `effect` asociado); esto parece intencional (estado efímero de UI), pero no hay comentario en el código que lo confirme.
- El tamaño máximo del historial no está limitado; en escenarios de uso intensivo, el array `historial` podría crecer hasta alcanzar la cuota de `localStorage` del navegador (~5 MB).
