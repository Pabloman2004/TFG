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
| `src/assets/data/criteria.json` | Catálogo de 216 criterios (excluido del patrón @linked: JSON no admite comentarios) |

### Flujo principal

```
AppComponent / MedsStepComponent / DiagnosisStepComponent
  └─► CriteriaEngineService.loadCriteria()
        │  GET assets/data/criteria.json?v=<timestamp>   (HTTP, promesa cacheada)
        │  → buildRelevance(crits, allTabIds)             (actualiza signal relevance)
        └─► evaluate(patient, criteria)
              │  normalizeCase(patient)       ← todo a minúsculas
              │  normalizeCriterion(crit)     ← drug_class / diagnosis a minúsculas
              └─► jsonLogic.apply(crit.logic, patient)    (con operadores custom)

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
- `relevance.medicationClasses` (opcional): clases farmacológicas que deben
  participar en la visibilidad cuando la semántica está encapsulada en un
  operador especial y no puede extraerse de un `inDrugClass`. No sustituye la
  lógica ni se deriva de `excludes`.
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
| `digoxinaDosisAlta` | `(medications[])` → ¿hay Digoxina con dosis ≥ 125 mcg/día y duración > 90 días? |
| `medicationClassDurationAbove` | `(drugClass, days, medications[])` → ¿algún fármaco de la clase supera esa duración? |
| `medicationClassDoseMgAbove` | `(drugClass, doseMg, medications[])` → ¿algún fármaco de la clase supera esa dosis diaria en mg? |
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

Antes de cualquier evaluación se normalizan a minúsculas:
- `patient.diagnoses[]`
- `med.id` y `med.drugClasses[]`
- Los campos `drug_class` y `diagnosis` dentro de los árboles json-logic de
  los criterios (recorrido recursivo de `normalizeLogic`)

Esto evita falsos negativos por discrepancias de capitalización entre el
catálogo y los datos introducidos por el usuario.

### `buildRelevance` y `SYSTEM_TO_TABS`

`SYSTEM_TO_TABS` (en `system-relevance.ts`) mapea cada nombre de sistema del
catálogo a uno o más tabs de la UI:

- Sistemas acotados (p. ej. `"Sistema cardiovascular"` → `['cardiovascular']`)
  propagan referencias solo a esos tabs.
- Sistemas transversales (`"Analgésicos"`, `"Riesgo de caídas"`,
  `"Carga antimuscarínica/anticolinérgica"`, `"Indicación de la medicación"`)
  usan el marcador `TRANSVERSAL = '*'` y se expanden a todos los tabs conocidos.

`buildRelevance(criteria, allTabIds)` recorre cada criterio, extrae mediante
`extractReferences` las clases farmacológicas (`inDrugClass`), códigos de
diagnóstico (`in [code, {var:"diagnoses"}]`) y los sustitutos diagnósticos de
`egfrBelow` (umbrales ≥30 → `enfermedad_renal_grave`; ≥15 →
`insuficiencia_renal_terminal`), une las clases declaradas en
`relevance.medicationClasses`, y acumula el resultado en los mapas
`classesByTab` / `dxsByTab` (con la expansión transversal incluida para clases
y, para diagnósticos, acotada al tab de origen cuando el sistema mapea a varios
tabs y el diagnóstico pertenece a uno de ellos). E1, F2 y F4 usan el metadato
explícito para Digoxina, IBP y hierro oral respectivamente. `excludes` no se
consulta para construir el índice.

Además acumula `specificClassesByTab` y `specificDxsByTab`: referencias de
criterios cuyo `system` mapea **específicamente** a un tab (los transversales NO
se vuelcan aquí). `computeMedGroupBuckets` usa `specificClassesByTab` para el
afloramiento de grupos **unitarios**; `computeDxGroupBuckets` usa
`specificDxsByTab` para el bloque «Relevantes de otros sistemas» de diagnósticos.
El bucket foráneo de grupos multi-fármaco sigue usando `classesByTab` completo.

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

- **json-logic para las reglas**: permite expresar cada criterio clínico como
  dato puro (JSON), sin código compilado por criterio. El árbol es serializable,
  auditable con herramientas externas y reemplazable sin recompilar la app.
- **Operadores custom en lugar de lógica embebida**: `inDrugClass`, `egfrBelow`,
  `digoxinaDosisAlta`, los operadores de dosis/duración y los `multiple*` encapsulan semántica clínica que json-logic
  estándar no puede expresar de forma compacta, manteniendo el JSON de criterios
  legible.
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

- Todo criterio evaluado pasa por `normalizeCase` + `normalizeCriterion` antes
  de aplicar `jsonLogic.apply`. Nunca se evalúa con datos sin normalizar.
- `loadCriteria()` es idempotente: la segunda llamada devuelve la misma promesa
  cacheada, y `_relevance` se actualiza exactamente una vez.
- `getExcludedMedications` solo excluye medicamentos que existen en `MEDICATIONS`
  (el catálogo real); los nombres no encontrados en el catálogo se saltan
  silenciosamente.
- Los operadores custom se registran en el constructor, antes de cualquier
  llamada a `evaluate` o `getExcludedMedications`.
- `extractReferences` solo reconoce `inDrugClass` y el patrón
  `in [string, {var:"diagnoses"}]`; otras formas de referenciar datos en la
  lógica no se indexan en `Relevance`.

---

## Si cambias esto…

- **Añadir un nuevo operador custom**: implementarlo en `registerCustomOperators`
  de `criteria-engine.service.ts`, añadir el caso en `extractReferences`
  (`system-relevance.ts`) si el operador referencia clases o diagnósticos, y
  actualizar `scripts/audit-criteria.cjs` si el operador puede aparecer en los
  árboles de criterios.
- **Cambiar la estructura de un criterio en `criteria.json`**: actualizar el
  tipo `Crit` en `src/app/core/types.ts` (propietario: `docs/caso-clinico.md`),
  el walk de `normalizeLogic`, `extractReferences` y el script de auditoría.
- **Cambiar la correspondencia sistema → tabs**: editar `SYSTEM_TO_TABS` en
  `system-relevance.ts` y verificar que los tabs destino existen en
  `DRUG_CATEGORIES` / `DIAGNOSIS_TABS`.
- **Ampliar `criteria-test-helpers.ts`** (nuevas factories de medicamento):
  usar `drugClasses` consistentes con `MEDICATIONS` en `medications.ts`
  (propietario: `docs/catalogo-clinico.md`); correr `audit-criteria.cjs` para
  verificar consistencia.
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
