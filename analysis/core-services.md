# Análisis: core-services

## Propósito

Este módulo implementa el motor de evaluación clínica de la aplicación. Su responsabilidad
central es recibir un caso de paciente (`PatientCase`) y un catálogo de criterios
(`Crit[]`), y devolver qué criterios STOPP/START se cumplen, así como qué medicamentos
quedan contraindicados (excluidos) en función de esos criterios. También expone un índice
de relevancia por tab clínico, derivado del catálogo, para que la UI pueda resaltar
secciones que el usuario aún no ha revisado.

## Ficheros

- `src/app/core/services/criteria-engine.service.ts` — Servicio Angular singleton que
  carga `criteria.json` vía HTTP (con caché de promesa y cache-bust por timestamp),
  normaliza mayúsculas/minúsculas en datos de paciente y criterios, evalúa cada criterio
  con `json-logic-js`, resuelve medicamentos excluidos simulando su adición al contexto
  del paciente, y registra operadores json-logic personalizados en el constructor.

- `src/assets/data/criteria.json` — Fichero de datos que define los 225 criterios
  (176 STOPP + 49 START) organizados por sistema fisiológico. Cada entrada contiene:
  `id` (ej. `STOPP-B1-DIGOXINA`), `type` (`STOPP`/`START`), `system` (nombre del
  sistema clínico), `summary` (texto explicativo), `logic` (regla json-logic ejecutable)
  y `excludes` opcional con listas de nombres de medicamentos y/o clases farmacológicas
  que ese criterio prohíbe. Los sistemas representados son: Indicación de la medicación,
  Sistema cardiovascular, Anticoagulantes/Antiagregantes, Sistema nervioso central,
  Sistema renal, Sistema gastrointestinal, Sistema respiratorio, Sistema
  musculoesquelético, Sistema urogenital, Sistema endocrino, Riesgo de caídas, Analgésicos
  y Carga antimuscarínica/anticolinérgica.

- `src/app/core/services/criteria-test-helpers.ts` — Librería de utilidades de test
  compartida. Exporta: `ALL_CRITERIA` (criterios reales importados en tiempo de
  compilación), `crit(id)` (lookup con fallo explícito), `setupEngine()` (configura
  TestBed), y factories de `PatientCase`/`Med`/`Labs` con valores por defecto seguros.
  Incluye ~35 factories con nombre de medicamento concreto (ej. `aine()`, `digoxina()`,
  `anticoagAvk()`).

- `src/app/core/services/criteria-engine.service.spec.ts` — Tests del motor genérico:
  `evaluate()` con casos vacíos, match de diagnóstico/analítica, tolerancia a lógica
  inválida; operadores `inDrugClass`, `digoxinaDosisAlta`, `multipleNSAIDs`;
  `getExcludedMedications()`; signal `relevance` antes y después de `loadCriteria()`.

- `src/app/core/services/criteria-a.spec.ts` — Tests de la sección A (Duplicidades):
  8 criterios cubiertos (duplicidad de AINEs, ISRS, IECA, ARA-II, diuréticos de asa,
  tiazidas, antagonistas de aldosterona y diuréticos ahorradores de potasio).

- `src/app/core/services/criteria-b.spec.ts` — Tests de la sección B (Sistema
  cardiovascular): 22 criterios cubiertos incluyendo Digoxina, Verapamilo/betabloqueantes,
  bradicardia, bloqueo AV, HTA, diuréticos, tiazidas con electrolitos, PDE5 inhibidores,
  estatinas y AINEs en enfermedad vascular.

- `src/app/core/services/criteria-c.spec.ts` — Tests de la sección C
  (Anticoagulantes/Antiagregantes): 14 criterios cubiertos, con cobertura especial de
  `getExcludedMedications()` para C5, C7, C10, C13 y C14 (bloqueos bidireccionales).

- `src/app/core/services/criteria-d.spec.ts` — Tests de la sección D (Sistema nervioso
  central): ~30 criterios cubiertos (ADTs, neurolépticos, benzodiacepinas, hipnóticos-Z,
  anticolinérgicos, IACE, agentes dopaminérgicos, antihistamínicos de 1ª generación).

- `src/app/core/services/criteria-e.spec.ts` — Tests de la sección E (Sistema renal):
  10 criterios cubiertos (digoxina, dabigatrán, factor-Xa, AINEs, colchicina,
  metformina, aldosterona, nitrofurantoína, bifosfonatos, metotrexato con insuficiencia
  renal); suite adicional para el operador `egfrBelow` con sus 4 combinaciones de
  diagnóstico/umbral.

## Dependencias

### Hacia otros módulos del repo

- `src/app/core/types.ts` — Tipos `PatientCase`, `Crit`, `Med`, `Labs`, `PatientInfo`,
  `JsonLogicRule`. El motor los usa para tipado estático de entrada/salida.
- `src/app/core/data/medications.ts` — Array `MEDICATIONS` (catálogo de medicamentos con
  `id` y `drugClasses`). Usado en `getMedicationsByClass()` y en la lógica de probe de
  `getExcludedMedications()`.
- `src/app/core/data/medications-taxonomy.ts` — `DRUG_CATEGORIES` para construir la
  lista de tabs de medicación en `getAllTabIds()`.
- `src/app/core/data/diagnoses-taxonomy.ts` — `DIAGNOSIS_TABS` para construir la lista
  de tabs de diagnóstico en `getAllTabIds()`.
- `src/app/core/data/system-relevance.ts` — `buildRelevance()` y tipo `Relevance`;
  construye el índice `classesByTab`/`dxsByTab` que el servicio expone como signal.

### Externas relevantes

- `json-logic-js` — Motor de evaluación de reglas declarativas. Las reglas de
  `criteria.json` se escriben como árboles json-logic; el servicio extiende el motor
  con operadores personalizados (`inDrugClass`, `digoxinaDosisAlta`, `egfrBelow`,
  `multipleNSAIDs`, etc.).
- `@angular/core` (`Injectable`, `Signal`, `signal`) — Para el ciclo de vida Angular
  y la reactividad del signal `relevance`.
- `@angular/common/http` (`HttpClient`) — Para la carga HTTP de `criteria.json`.
- `rxjs` (`firstValueFrom`) — Para convertir el Observable HTTP en promesa.

## Conceptos de negocio

- **STOPP** (Screening Tool of Older Persons' Prescriptions): criterios que señalan
  medicamentos potencialmente inapropiados en un paciente con determinados diagnósticos
  o analíticas.
- **START** (Screening Tool to Alert doctors to Right Treatment): criterios que señalan
  medicamentos que deberían prescribirse y no están presentes.
- **PatientCase**: unidad de evaluación; contiene `info` (datos demográficos), `diagnoses`
  (lista de códigos de diagnóstico en snake_case), `medications` (lista de Med con
  `id`, `drugClasses` y opcionalmente `doseMcgDay`/`durationDays`), y `labs` (panel
  analítico completo).
- **Criterio / Crit**: regla clínica con lógica ejecutable (json-logic). Tiene tipo
  (`STOPP`/`START`), sistema fisiológico, resumen textual, lógica de activación y lista
  de medicamentos/clases excluidos cuando se cumple.
- **Exclusión de medicamentos**: mecanismo proactivo que simula añadir cada medicamento
  candidato al contexto del paciente y comprueba si algún criterio activo lo señalaría
  como inapropiado, permitiendo bloquear su prescripción antes de que ocurra.
- **Relevancia por tab**: índice derivado del catálogo que asocia cada tab clínico con
  las clases farmacológicas y diagnósticos que los criterios de ese sistema referencian;
  usado por la UI para priorizar secciones de revisión.
- **Normalización case-insensitive**: diagnósticos, `id` de medicamento y `drugClasses`
  se convierten a minúsculas antes de la evaluación para evitar falsos negativos por
  discrepancias de capitalización.
- **egfrBelow**: operador personalizado que unifica la fuente de función renal (analítica
  numérica + diagnósticos textuales `enfermedad_renal_grave`/`insuficiencia_renal_terminal`)
  con semántica de umbral configurable.
- **digoxinaDosisAlta**: operador que evalúa dosis ≥ 125 mcg/día Y duración > 90 días,
  modelando el criterio clínico de uso crónico a dosis alta.

## Problemas detectados

- **Cache-bust incondicionado en producción**: `loadCriteria()` añade `?v=Date.now()` en
  cada arranque de la aplicación, lo que impide que el navegador cachee `criteria.json`
  entre recargas. Podría sustituirse por un hash del fichero generado en build time o
  por un version fijo.

- **`criteriaCache` no invalida en error**: si la primera llamada HTTP falla, la promesa
  rechazada queda en caché y todas las llamadas posteriores a `loadCriteria()` recibirán
  el mismo rechazo sin reintentar. No hay manejo de error ni reset del caché en el
  camino de fallo.

- **`registerCustomOperators()` modifica estado global de `json-logic-js`**: los
  operadores se registran en el objeto global del módulo, no en una instancia aislada.
  En tests, esto significa que los operadores se registran múltiples veces (una por cada
  `setupEngine()` / `beforeEach`). No rompe el comportamiento (registrar el mismo nombre
  es idempotente en json-logic-js), pero es frágil si en el futuro se necesitara
  instanciar el motor en varios contextos con operadores distintos.

- **Secciones sin tests de `getExcludedMedications()`**: los ficheros de sección A, B y
  parte de D no prueban el comportamiento de exclusión, que sí está cubierto en C y
  puntualmente en D. La lógica de exclusión es la más compleja del servicio (simulación
  de probe con y sin el medicamento ya presente) y su cobertura es asimétrica.

- **`criteria-e.spec.ts` define factories locales** (`colchicina`, `metformina`, etc.)
  en lugar de añadirlas a `criteria-test-helpers.ts`. Esto crea una pequeña duplicación
  de patrón y podría llevar a inconsistencias si los `drugClasses` de esos medicamentos
  cambian en el catálogo real.

- **`criteria.json` no tiene versión ni esquema explícito**: el fichero no incluye un
  campo `version` ni un `$schema`. Cambios en la estructura del objeto `Crit` (ej.
  añadir campos obligatorios) no detectarían criterios mal formados hasta runtime.

- **ASUNCIÓN**: no se ha verificado si existen secciones F, G u otras de los criterios
  STOPP/START estándar que no estén implementadas en `criteria.json`. Los spec cubren
  secciones A–E de STOPP; no se encontraron spec para secciones F en adelante ni para
  criterios START más allá de lo registrado en el JSON.
