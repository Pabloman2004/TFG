# Motor de criterios

## Qué hace

El motor de criterios es el núcleo clínico de la aplicación. Su responsabilidad
es tomar un `PatientCase` (datos del paciente: diagnósticos, medicaciones activas
y analítica) y el catálogo de criterios STOPP/START (`criteria.json`), y
determinar:

1. **Qué criterios se cumplen** (`evaluate()`): filtra los criterios del
   catálogo y devuelve solo los que la lógica declarativa
   del criterio confirma para ese paciente.
2. **Qué medicamentos están contraindicados** (`getExcludedMedications()`):
   para cada criterio con campo `excludes`, simula proactivamente añadir cada
   medicamento excluido al contexto del paciente y evalúa si el criterio
   dispararía; si es así, el medicamento queda bloqueado antes de prescribirse.
3. **Índice de relevancia por tab** (signal `relevance`): tras cargar el
   catálogo, construye un índice que mapea cada tab de la UI con las clases
   farmacológicas y diagnósticos clínicamente pertinentes en ese tab, para que
   la UI pueda resaltar secciones no revisadas.

La evaluación se hace mediante **json-logic-js** con operadores personalizados
registrados en el constructor del servicio.

---

## Cómo está implementado

### Ficheros clave

| Fichero | Rol |
|---|---|
| `src/app/core/services/criteria-engine.service.ts` | Servicio Angular singleton: carga `criteria.json`, normaliza datos, evalúa criterios, registra operadores custom |
| `src/app/core/data/system-relevance.ts` | Construye el índice `Relevance`; define `SYSTEM_TO_TABS` y `buildRelevance` |
| `src/app/core/services/criteria-test-helpers.ts` | Librería compartida de utilidades de test: `ALL_CRITERIA`, `crit()`, `setupEngine()`, factories de `PatientCase`/`Med` |
| `src/types/json-logic-js.d.ts` | Declaración de tipos ambient para `json-logic-js` (`apply`, `add_operation`) |
| `scripts/audit-criteria.cjs` | Script Node.js one-shot de auditoría de consistencia entre `criteria.json`, `medications.ts` y `diagnoses.ts` |
| `src/app/core/data/criteria-data-integrity.spec.ts` | Guard de suite: excludes↔catálogo, clases con miembros, whitelists dx/clases y política HTA (A12/A20) |
| `src/assets/data/criteria.json` | Catálogo de 215 criterios (excluido del patrón @linked: JSON no admite comentarios) |

### Flujo principal

```
AppComponent / MedsStepComponent / DiagnosisStepComponent
  └─► CriteriaEngineService.loadCriteria()
        │  GET assets/data/criteria.json?v=<timestamp>   (HTTP, promesa cacheada)
        │  → buildRelevance(crits, allTabIds)             (actualiza signal relevance)
        └─► evaluate(patient, criteria)
              │  normalizeCase(patient)       ← diagnoses / med.id / drugClasses a minúsculas
              └─► jsonLogic.apply(crit.logic, patient)    (con operadores custom;
                                                           literales del JSON tal cual)

        └─► getExcludedMedications(patient, criteria)
              │  Para cada crit con excludes:
              │    Para cada med candidato (por nombre o clase):
              │      probeMed ∈ MEDICATIONS   (catálogo real)
              │      testPatient = patient + [probeMed si no presente]
              └─► jsonLogic.apply(crit.logic, testPatient)  → excluido si true
```

### Estructura de `criteria.json`

Cada entrada del array `criteria` tiene:

```json
{
  "id":      "STOPP-B1-DIGOXINA",
  "type":    "STOPP",
  "system":  "Sistema cardiovascular",
  "summary": "Texto explicativo del criterio...",
  "logic":   { "<operador>": [...] },
  "relevance": {
    "medicationClasses": ["DIGOXINA"]
  },
  "excludes": {
    "medications": ["Digoxina"],
    "drugClasses": ["DIGOXINA"]
  }
}
```

- `type`: `"STOPP"` (prescripción inapropiada) o `"START"` (omisión indicada).
- `system`: uno de los 13 sistemas fisiológicos (ver `SYSTEM_TO_TABS`).
- `logic`: árbol json-logic ejecutable, puede usar operadores estándar y los
  personalizados registrados en `registerCustomOperators()`.
- `relevance.medicationClasses` (opcional): escape hatch para clases que aún
  no pueda inferir `extractReferences`. Los operadores custom del motor ya
  aportan su clase; no sustituye la lógica ni se deriva de `excludes`.
- `excludes` (opcional): lista de nombres de medicamento y/o clases
  farmacológicas que ese criterio contraindica cuando se cumple.
  Debe usar el mismo alcance farmacológico que la lógica: por ejemplo,
  STOPP-I8 evalúa y excluye la clase agregada `ANTIBIOTICO`, no solo
  `ANTIBIOTICO_URINARIO`.

Los 13 sistemas del catálogo son:

> Indicación de la medicación · Sistema cardiovascular ·
> Anticoagulantes/Antiagregantes · Sistema nervioso central · Sistema renal ·
> Sistema gastrointestinal · Sistema respiratorio · Sistema musculoesquelético ·
> Sistema urogenital · Sistema endocrino · Riesgo de caídas · Analgésicos ·
> Carga antimuscarínica/anticolinérgica

### Operadores personalizados (`registerCustomOperators`)

Todos se registran en `json-logic-js` a nivel global en el constructor de
`CriteriaEngineService`. Son idempotentes: registrar el mismo nombre varias
veces no rompe el comportamiento.

| Operador | Semántica |
|---|---|
| `inDrugClass` | `(drugClass, medications[])` → ¿algún med tiene esa clase? |
| `egfrBelow` | `(threshold, patient)` → ¿TFGe < threshold? Unifica analítica numérica con diagnósticos textuales (`enfermedad_renal_grave` ≡ TFGe < 30, `insuficiencia_renal_terminal` ≡ TFGe < 15) |
| `multipleNSAIDs` | ¿2+ AINEs presentes? |
| `multipleLoopDiuretics` | ¿2+ diuréticos de asa? |
| `multipleThiazideDiuretics` | ¿2+ tiazidas? |
| `multipleIECA` | ¿2+ IECAs? |
| `multipleARAII` | ¿2+ ARA-II? |
| `multipleAldosteroneAntagonists` | ¿2+ antagonistas de aldosterona? |
| `multipleDiureticosAhorradoresPotasio` | ¿2+ diuréticos ahorradores de potasio? |
| `multipleISRS` | ¿2+ ISRS? |
| `multipleANTIAGREGANTES` | ¿2+ antiagregantes? |
| `multipleANTICOLINERGICOS` | ¿2+ anticolinérgicos? |

Los operadores `multiple*` se construyen con `makeMultipleClassOp(drugClass, threshold=1)`.

### Normalización case-insensitive

Solo se normaliza el **caso del paciente** (`normalizeCase`) antes de evaluar:
- `patient.diagnoses[]`
- `med.id` y `med.drugClasses[]`

Los árboles json-logic de `criteria.json` **no se reescriben**: no existe
`normalizeCriterion` / `normalizeLogic`. Los literales de diagnóstico y clase
en la lógica deben escribirse ya en minúscula (p. ej. `"parkinson"`, no
`"Parkinson"`). La tolerancia a mayúsculas de los operadores custom compara
contra el paciente ya normalizado; un literal en mayúsculas en el JSON no
coincidirá y el criterio no disparará.

### `buildRelevance` y `SYSTEM_TO_TABS`

`SYSTEM_TO_TABS` (en `system-relevance.ts`) mapea cada nombre de sistema del
catálogo a uno o más tabs de la UI:

- Sistemas acotados (p. ej. `"Sistema cardiovascular"` → `['cardiovascular']`)
  propagan referencias solo a esos tabs.
- Sistemas transversales (`"Analgésicos"`, `"Riesgo de caídas"`,
  `"Carga antimuscarínica/anticolinérgica"`, `"Indicación de la medicación"`)
  usan el marcador `TRANSVERSAL = '*'` y se expanden a todos los tabs conocidos.

`buildRelevance(criteria, allTabIds)` recorre cada criterio, extrae mediante
`extractReferences` las clases farmacológicas (`inDrugClass` y el mapa
operador→clase de los `multiple*`), códigos de diagnóstico (`in [code, {var:"diagnoses"}]`) y los sustitutos diagnósticos de
`egfrBelow` (umbrales ≥30 → `enfermedad_renal_grave`; ≥15 →
`insuficiencia_renal_terminal`), une opcionalmente las clases declaradas en
`relevance.medicationClasses` (escape hatch; ya no necesario para E1/F2/F4/L6),
y acumula el resultado en los mapas `classesByTab` / `dxsByTab` (con la
expansión transversal incluida para clases y, para diagnósticos, acotada al tab
de origen cuando el sistema mapea a varios tabs y el diagnóstico pertenece a
uno de ellos). `excludes` no se consulta para construir el índice.

La captura de analítica **no** pasa por el índice de relevancia: los criterios
START (p. ej. B1: PAS/PAD, o los START renales con TFGe) se disparan por la
**ausencia** de una clase de medicación, así que ninguna selección "activa" el
campo y no puede condicionarse. Por eso `labCaptureFields` (`core/lab-capture.ts`)
ofrece un **panel fijo** con todos los campos que algún criterio puede leer,
siempre visible en la pestaña «Otros» del paso de diagnósticos. El invariante lo
verifica `lab-capture.spec.ts`: todo lab leído por un criterio real tiene ficha de
presentación (`LAB_SPECS`), de modo que ningún criterio queda inalcanzable por
falta de campo en la interfaz.

Además acumula `specificClassesByTab` y `specificDxsByTab`: referencias de
criterios cuyo `system` mapea **específicamente** a un tab (los transversales NO
se vuelcan aquí). `computeMedGroupBuckets` usa `specificClassesByTab` tanto para
el afloramiento de grupos **unitarios** como para el bucket «Relevantes de otros
sistemas» de multi-fármaco; `computeDxGroupBuckets` usa `specificDxsByTab` para
el mismo bloque en diagnósticos. Los sistemas transversales siguen disparando
criterios en el motor (`evaluate`), pero ya no generan casillas foráneas en tabs
ajenos: su papel residual es documentar que no aportan relevancia de visibilidad.

El signal `CriteriaEngineService.relevance` se actualiza una sola vez, tras
la primera carga del catálogo.

### Helpers de test compartidos (`criteria-test-helpers.ts`)

- `ALL_CRITERIA`: importa `criteria.json` en tiempo de compilación (no vía HTTP).
- `crit(id)`: lookup con fallo explícito si el criterio no existe.
- `setupEngine()`: configura `TestBed` con `provideHttpClient` y retorna el
  servicio inyectado.
- `makeCase`, `makeMed`, `makeLabs`, `withAge`: factories con valores por
  defecto seguros.
- ~35 factories con nombre concreto: `aine()`, `digoxina()`, `anticoagAvk()`,
  `betabloq()`, `benzo()`, `isrs()`, etc. Los tests de sección (`criteria-a.spec.ts`
  … `criteria-e.spec.ts`) los importan directamente.

### Script de auditoría (`scripts/audit-criteria.cjs`)

Script Node.js one-shot (`node scripts/audit-criteria.cjs`). Lee `criteria.json`,
`medications.ts` y `diagnoses.ts` directamente del sistema de ficheros y emite
cinco secciones:

1. Recuento de criterios por sistema.
2. Resumen por criterio (clases, diagnósticos, refs a meds por nombre).
3. Inconsistencias: criterios sin `system`, referencias a medicamentos por
   nombre (en lugar de por clase), clases desconocidas, diagnósticos desconocidos.
4. Cobertura: clases/diagnósticos declarados pero no usados.
5. Clases y diagnósticos por sistema (vista previa de relevancia).

---

## Decisiones de diseño

- **Política de variantes HTA**: la familia mutex
  `{hta, hta_no_complicada, hipertension_moderada, hipertension_grave}` permite
  marcar una sola variante en la UI. Los **criterios generales de HTA** aceptan
  las 4 variantes; **B5**, específico de HTA no complicada, acepta solo `hta` y
  `hta_no_complicada`. Los criterios acotados a gravedad (p. ej. solo
  `hipertension_grave`) quedan fuera de esa regla. Lo refuerza
  `criteria-data-integrity.spec.ts` (A20).
- **Guard catálogo↔criterios**: `criteria-data-integrity.spec.ts` exige que
  `excludes.medications` existan en `MEDICATIONS`, que las clases usadas tengan
  miembros, y que códigos/clases sin criterio estén en listas blancas comentadas
  (informativos / decorativos).
- **json-logic para las reglas**: permite expresar cada criterio clínico como
  dato puro (JSON), sin código compilado por criterio. El árbol es serializable,
  auditable con herramientas externas y reemplazable sin recompilar la app.
- **Operadores custom en lugar de lógica embebida**: `inDrugClass`, `egfrBelow` y
  los `multiple*` encapsulan semántica clínica que json-logic estándar no puede
  expresar de forma compacta, manteniendo el JSON de criterios legible.
- **Sin operadores de dosis ni duración**: los antiguos `digoxinaDosisAlta`,
  `medicationClassDurationAbove` y `medicationClassDoseMgAbove` se retiraron
  (2026-07-28). Los umbrales de dosis/duración viven ahora en el `summary` del
  criterio como juicio clínico: el aviso se notifica por defecto al seleccionar el
  fármaco y el médico decide si aplica. Los campos `doseMgDay` / `doseMcgDay` /
  `durationDays` siguen siendo opcionales en `Med` solo por retrocompatibilidad
  de casos exportados; ninguna lógica los lee.
- **Excepción por id de fármaco (STOPP-D12)**: cuando STOPP v3 exime fármacos
  concretos dentro de una clase (quetiapina/clozapina en neurolépticos), la
  lógica combina `inDrugClass(NEUROLEPTICO)` —para que `extractReferences` siga
  indexando la clase— con `some` de json-logic sobre `medications` que exige un
  neuroléptico cuyo `id` no sea `quetiapina` ni `clozapina` (tras
  `normalizeCase`). Así quetiapina/clozapina solas no disparan, pero sí lo hace
  cualquier otro neuroléptico o la combinación con uno no exento. Los
  `excludes.medications` listan el resto de neurolépticos del catálogo y omiten
  a propósito las dos excepciones (no greyan).
- **Normalización en el servicio, no en los datos**: los criterios y el caso
  del paciente se normalizan en tiempo de evaluación; el catálogo y el estado
  de sesión se almacenan con capitalización original.
- **Exclusión proactiva por simulación**: en lugar de mantener un listado estático
  de contraindicaciones, `getExcludedMedications` reutiliza el propio motor de
  evaluación para calcularlas dinámicamente; esto garantiza coherencia con la
  lógica de los criterios sin duplicar reglas.
- **Signal `relevance` en lugar de observable**: al ser un valor derivado
  calculado una vez y luego solo leído, un signal de Angular es suficiente y
  evita la complejidad de un observable.
- **`criteria-test-helpers.ts` como librería de test compartida**: centraliza
  las factories de `PatientCase`/`Med` para que todos los specs de sección usen
  las mismas definiciones de clases farmacológicas, evitando inconsistencias
  cuando cambia el catálogo.
- **`criteria.json` cargado vía HTTP** (no importado en compilación como en los
  tests): permite servir el fichero estático desde el servidor sin aumentar el
  bundle de la aplicación.

---

## Invariantes

- Todo paciente evaluado pasa por `normalizeCase` antes de
  `jsonLogic.apply`. Los literales de la lógica del criterio se usan tal cual
  están en `criteria.json` (deben ir en minúscula).
- `loadCriteria()` es idempotente: la segunda llamada devuelve la misma promesa
  cacheada, y `_relevance` se actualiza exactamente una vez.
- `getExcludedMedications` solo excluye medicamentos que existen en `MEDICATIONS`
  (el catálogo real); los nombres no encontrados en el catálogo se saltan
  silenciosamente.
- Los operadores custom se registran en el constructor, antes de cualquier
  llamada a `evaluate` o `getExcludedMedications`.
- `extractReferences` reconoce clases en `inDrugClass`, el mapa operador→clase de
  los `multiple*`, diagnósticos en `in [string, {var:"diagnoses"}]` y sustitutos
  de `egfrBelow`; otras formas de referenciar datos en la lógica no se indexan en
  `Relevance`.

---

## Si cambias esto…

- **Añadir un nuevo operador custom**: implementarlo en `registerCustomOperators`
  de `criteria-engine.service.ts`, añadir el caso en `extractReferences`
  (`system-relevance.ts`) si el operador referencia clases o diagnósticos, y
  actualizar `scripts/audit-criteria.cjs` si el operador puede aparecer en los
  árboles de criterios.
- **Cambiar la estructura de un criterio en `criteria.json`**: actualizar el
  tipo `Crit` en `src/app/core/types.ts` (propietario: `docs/caso-clinico.md`),
  `extractReferences` y el script de auditoría. Los códigos de diagnóstico y
  clase en `logic` van siempre en minúscula.
- **Cambiar la correspondencia sistema → tabs**: editar `SYSTEM_TO_TABS` en
  `system-relevance.ts` y verificar que los tabs destino existen en
  `DRUG_CATEGORIES` / `DIAGNOSIS_TABS`.
- **Ampliar `criteria-test-helpers.ts`** (nuevas factories de medicamento):
  usar `drugClasses` consistentes con `MEDICATIONS` en `medications.ts`
  (propietario: `docs/catalogo-clinico.md`); correr `audit-criteria.cjs` para
  verificar consistencia.
- **Añadir/quitar fármacos, clases o códigos de diagnóstico** en catálogo o
  `criteria.json`: mantener verde `criteria-data-integrity.spec.ts` (actualizar
  listas blancas solo si el omitido es deliberado e informativo/decorativo).
- **Cualquier cambio en el motor**: actualizar los tests de criterios
  (`criteria-engine.service.spec.ts`, `criteria-a.spec.ts` …
  `criteria-e.spec.ts`) y este documento.

---

## Asunciones

- Las secciones STOPP A–H tienen specs explícitos de comportamiento. Las
  secciones posteriores y todos los criterios START aún no tienen la misma
  cobertura exhaustiva por sección.
- `egfrBelow` con umbrales distintos de 15 y 30 (p. ej. 45, 60) depende
  únicamente del valor numérico de `labs.egfr_ml_min_173`; no hay diagnóstico
  textual equivalente para esos rangos intermedios. Si los datos analíticos no
  se introducen, esos criterios no dispararán.
- `criteriaCache` no invalida en caso de error HTTP: si `loadCriteria()` falla
  la primera vez, las llamadas siguientes recibirán el rechazo cacheado sin
  reintentar. No existe manejo de error explícito.
- El cache-bust `?v=Date.now()` impide que el navegador cachee `criteria.json`
  entre recargas; no hay mecanismo de versión basado en hash de build.
- Los operadores custom se registran en el estado global de `json-logic-js`
  (no en una instancia aislada). En tests, el registro ocurre varias veces pero
  es idempotente en la versión actual de la librería.
- `criteria.json` no tiene campo `version` ni `$schema`; criterios mal formados
  solo se detectarían en runtime o mediante `audit-criteria.cjs`.
