# Caso clínico

## Qué hace

Define el modelo de dominio de la aplicación STOPP/START y gestiona el estado reactivo de la sesión activa del clínico, incluyendo la persistencia automática en `localStorage`.

Un "caso clínico" es el agregado evaluable por el motor de criterios: datos del paciente (`PatientInfo`), lista de medicaciones activas (`Med[]`), lista de diagnósticos (`string[]`), parámetros de laboratorio (`Labs`) y metadatos de progreso de revisión (tabs revisados). El store centraliza ese estado y lo serializa/rehidrata automáticamente entre sesiones del navegador.

## Cómo está implementado

### Tipos de dominio — `src/app/core/types.ts`

Declara todas las interfaces del dominio clínico:

- `PatientInfo` — datos demográficos: nombre, edad, sexo (`'F' | 'M'`), MRN, peso, altura, notas.
- `Med` — medicación normalizada: `id` (nombre del fármaco), `drugClasses` (clases farmacológicas), `doseMcgDay` (dosis en microgramos/día), `doseMgDay` (dosis en miligramos/día) y `durationDays` (duración del tratamiento en días).
- `Crit` — criterio STOPP/START evaluado: tipo (`'STOPP'` | `'START'`), sistema orgánico, resumen
  textual, regla JsonLogic, metadato opcional `relevance.medicationClasses` para operadores cuya
  relevancia no puede derivarse de `inDrugClass`, y lista `excludes` de medicaciones/clases que
  descartar cuando el criterio se cumple.
- `Labs` — parámetros bioquímicos y vitales: glucosa, colesterol, triglicéridos, HDL, LDL, creatinina, eGFR, INR, TSH, frecuencia cardíaca, QTc, electrolitos (K⁺, Na⁺, Ca²⁺ corregido), presión arterial sistólica y diastólica.
- `PatientCase` — agregado evaluable: `info`, `diagnoses`, `medications`, `labs`, más los arrays opcionales `reviewedMedTabs` y `reviewedDxTabs` (IDs de tabs revisados).
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

**Signals de estado UI:**
| Signal | Tipo | Clave `localStorage` |
|--------|------|----------------------|
| `activeSystemTab` | `string` | `activeSystemTab` |
| `collapsedSections` | `string[]` | — (no persiste) |
| `reviewedMedTabs` | `Set<string>` | `reviewedMedTabs` |
| `reviewedDxTabs` | `Set<string>` | `reviewedDxTabs` |

**Ciclo de persistencia/rehidratación:**

1. En el `constructor`, cada signal se inicializa leyendo `localStorage` mediante los métodos privados `load<T>(key)` (JSON.parse) y `loadString(key)` (string literal). Los errores de parseo devuelven `null`.
2. A continuación, un `effect()` por signal serializa el valor con `JSON.stringify` cada vez que cambia. Cuando el valor es `null`, elimina la clave. Los errores de escritura (cuota excedida, modo incógnito) se silencian con `try/catch`.
3. Las claves legado `results`, `activeSystem` e `historial` se eliminan en el arranque.
4. `reviewedMedTabs` y `reviewedDxTabs` son `Set<string>` en memoria pero se serializan como arrays al persistir (`[...signal()]`) y se rehidratan con `new Set(array)`.

**API pública relevante:**

- `get patientCase(): PatientCase` — snapshot inmutable del caso actual; lo usan `case-io.service.ts` y `report.service.ts`.
- `loadCase(patientCase)` — reemplaza todo el estado de dominio.
- `reset()` — limpia todas las signals de dominio/UI y elimina sus claves de `localStorage`.
- `toggleMedTabReviewed` / `toggleDxTabReviewed` / `clearMedTabReviewed` / `clearDxTabReviewed` — gestionan el conjunto de tabs revisados en la sesión.

## Decisiones de diseño

- **Signals de Angular en lugar de RxJS**: el estado global se gestiona con `signal()` + `effect()` (Angular 17+), eliminando la complejidad de Observables para un modelo de estado sencillo y síncrono.
- **Persistencia automática con `effect()`**: cada signal tiene su propio `effect` de escritura, lo que garantiza que cualquier mutación, independientemente de quién la origine, se refleje en `localStorage` sin necesidad de llamadas explícitas a "save".
- **Criterios no se cachean en el store**: los steps evaluán con el motor bajo demanda (`applicableCriteria`).
- **Estado UI en el mismo servicio que el dominio**: `activeSystemTab` y `collapsedSections` conviven con los signals clínicos en `CaseStoreService`. Esto simplifica el acceso desde los componentes pero acopla la navegación de la UI al modelo de dominio.

## Invariantes

- `PatientCase.medications` es siempre un array (nunca `undefined`); los componentes pueden iterar sobre él sin comprobar nulidad.
- `PatientCase.diagnoses` es siempre un array (nunca `undefined`).
- Los errores de `localStorage` (lectura o escritura) no propagan excepciones; la app continúa funcionando sin persistencia en ese caso.
- `reviewedMedTabs` y `reviewedDxTabs` son `Set<string>` en memoria; se exponen como arrays en `PatientCase` para ser serializables en JSON.

## Si cambias esto…

- **`types.ts`** — Añadir o renombrar campos de `PatientInfo`, `Med`, `Labs` o `PatientCase` afecta a:
  - `case-store.service.ts` (rehidratación y `patientCase` getter).
  - `case-io.service.ts` (validación del schema de importación).
  - `report.service.ts` (construcción del PDF, que itera sobre `Med` y `Labs` directamente).
  - `criteria-engine.service.ts` (recibe `PatientCase` para la evaluación).
  - Los specs de `case-store.service.spec.ts` y `case-io.service.spec.ts`.
  - Este documento.

- **`case-store.service.ts`** — Modificar claves de `localStorage`, añadir signals o cambiar la lógica de `reset`/`loadCase` afecta a:
  - Todos los componentes que consumen el store (`meds-step`, `diagnosis-step`, `app.component`).
  - `case-io.service.ts` (llama a `loadCase` para importar).
  - `report.service.ts` y `clipboard-text.ts` (consumen `patientCase` getter).
  - `case-store.service.spec.ts` (cubre el ciclo completo de tabs revisados y `localStorage`).
  - Este documento (especialmente la tabla de signals y el ciclo de persistencia).

- **Añadir un nuevo tipo de señal de "progreso"** (p.ej. `reviewedLabTabs`): replicar el patrón `Set<string>` → persistir como array → rehidratar con `new Set()`; añadir la variante `toggle/clear` y serializar en `patientCase`.

## Asunciones

- `CaseStoreService.persist` silencia todos los errores de `localStorage` (cuota excedida, modo incógnito); no hay mecanismo de notificación al usuario si la persistencia falla reiteradamente.
- El proyecto usa Angular ≥ 17.1, donde los signals propagan cambios con `ChangeDetectionStrategy.OnPush` automáticamente.
- `collapsedSections` no persiste en `localStorage` (no tiene `effect` asociado); esto parece intencional (estado efímero de UI), pero no hay comentario en el código que lo confirme.
