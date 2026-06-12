# Catálogo Clínico

## Qué hace

Este módulo es el **conocimiento de dominio clínico estático** de la aplicación. Define el universo
completo de diagnósticos y medicamentos que un clínico puede registrar, sus agrupaciones
taxonómicas para la interfaz (tabs, grupos, subgrupos), y las reglas de visibilidad condicional de
diagnósticos cardiovasculares en función de los fármacos activos del paciente.

El módulo existe para separar el conocimiento clínico (qué diagnósticos/fármacos existen, cómo se
organizan, qué dependencias tienen) del código de evaluación de criterios STOPP/START y de la
lógica de presentación de los componentes de paso.

No contiene lógica de evaluación de criterios (eso es `docs/motor-criterios.md`), ni estado
reactivo de sesión (eso es `docs/caso-clinico.md`). Es puro dato + constructores derivados.

---

## Cómo está implementado

### Ficheros clave y flujo de dependencias

```
diagnoses.ts
  └─ DIAGNOSIS_GROUPS          (label → sistema orgánico)
  └─ DIAGNOSIS_MAP             (label → clave snake_case interna)
  └─ DIAGNOSIS_SUBGROUPS       (label → subgrupo UI, solo Cardiovascular)
  └─ DIAGNOSIS_REVERSE_MAP     (derivado de DIAGNOSIS_MAP, clave → label)
  └─ normalizeDiagnosis()      (label → clave; fallback si no está en el mapa)
  └─ resolveDiagnosisLabel()   (clave → label legible; soporte "grupo__sufijo")
        ↓ importado por
diagnoses-taxonomy.ts
  └─ buildTabs()               (construye DIAGNOSIS_TABS en tiempo de carga)
  └─ DIAGNOSIS_TABS            (array de DiagnosisTab ordenado por TAB_ORDER)
  └─ DIAGNOSIS_CATEGORIES      (aplanado de todos los grupos de todos los tabs)

medications.ts
  └─ MEDICATIONS               (~140 fármacos, cada uno con id + drugClasses[])
  └─ MED_NAMES                 (array de nombres para autocompletado)
        ↓ importado por
medications-taxonomy.ts
  └─ byClass()                 (helper interno: filtra MEDICATIONS por drugClass)
  └─ RAW_DRUG_CATEGORIES       (9 categorías clínicas con sus grupos, sin ordenar)
  └─ DRUG_CATEGORIES           (RAW_DRUG_CATEGORIES ordenado alfabéticamente)
  └─ resolveMedicationLabel()  ("otro__<groupId>" → "Otro (label del grupo)")

cardiovascular-dx-dependencies.ts
  └─ CARDIOVASCULAR_DX_DEPS    (12 diagnósticos cardiovasculares con sus triggers)
  └─ isDiagnosisEnabled()      (label + meds[] → boolean)
```

### Taxonomía de diagnósticos (`diagnoses.ts` + `diagnoses-taxonomy.ts`)

`DIAGNOSIS_GROUPS` mapea cada label de diagnóstico a su sistema orgánico (p.ej. `"Bradicardia" →
"Cardiovascular"`). `DIAGNOSIS_MAP` mapea el mismo label a su clave interna snake_case (p.ej.
`"Bradicardia" → "bradicardia"`), que es la representación usada en `criteria.json` y en el store
de sesión.

`DIAGNOSIS_SUBGROUPS` asigna subgrupos opcionales dentro de un sistema; actualmente solo existe
para el sistema `Cardiovascular` (5 subgrupos: Arritmias y conducción, Enfermedad vascular,
Estenosis y valvulopatía, Hipertensión, Hipotensión y síncope, Insuficiencia cardíaca).

`diagnoses-taxonomy.ts` construye en tiempo de módulo el array `DIAGNOSIS_TABS` llamando a
`buildTabs()`. El orden de tabs lo fija `TAB_ORDER` (12 sistemas con tabs propias). Los sistemas
declarados en `OTROS_SYSTEMS` (Oncológico, Hepático, etc.) se agregan bajo una pestaña especial
"Otros". Cualquier sistema que no esté en ninguna de las dos listas obtiene su propio tab al final.

La función interna `slug()` normaliza nombres de sistema a IDs seguros para la UI (NFD, minúsculas,
solo `[a-z0-9_]`); es distinta de `normalizeDiagnosis()` y solo se usa internamente.

### Catálogo de fármacos (`medications.ts` + `medications-taxonomy.ts`)

`MEDICATIONS` es un array plano de `Med` con `id` (nombre comercial/DCI) y `drugClasses[]`
(clases farmacológicas). Un mismo fármaco puede pertenecer a varias clases (p.ej. Amiodarona:
`ANTIARITMICO`, `ANTIARITMICO_CLASE_III`, `PROLONGADOR_QTC`, `INHIBIDOR_GLUCOPROTEINA_P`).

`medications-taxonomy.ts` define `RAW_DRUG_CATEGORIES` con 9 categorías clínicas (~50 grupos) y
exporta `DRUG_CATEGORIES` (ordenado alfabéticamente dentro de cada categoría con `Intl.Collator`).
Los grupos usan `byClass(dc)` para derivar su lista de fármacos desde `MEDICATIONS`, garantizando
que el catálogo y la taxonomía estén siempre en sincronía para las clases declaradas.

El campo `additionalCategories?: string[]` en `DrugGroup` anota en qué otras categorías podría
mostrarse un grupo (p.ej. ISRS en `cardiovascular`), pero **el código de construcción de
`DRUG_CATEGORIES` no lo procesa**: quedan como metadatos. La duplicación real en la UI se
implementa duplicando físicamente el objeto de grupo en la categoría destino (ver Decisiones de
diseño).

### Dependencias cardiovasculares (`cardiovascular-dx-dependencies.ts`)

`CARDIOVASCULAR_DX_DEPS` es un mapa de 12 diagnósticos cardiovasculares, cada uno con un objeto
`DxTrigger` que declara qué `classes` (clases farmacológicas) o `ids` (fármacos concretos) deben
estar presentes para que el diagnóstico quede habilitado en la UI.

`isDiagnosisEnabled(label, meds)` evalúa este mapa: si el diagnóstico no está en el mapa devuelve
`true` siempre; si está, devuelve `true` si algún fármaco activo del paciente pertenece a alguna
de las clases declaradas (o coincide por id). Esta función es consumida por
`diagnosis-step.component.ts` para habilitar/deshabilitar checkboxes de diagnósticos.

---

## Decisiones de diseño

- **Separación catálogo / taxonomía**: `diagnoses.ts` y `medications.ts` son catálogos planos sin
  referencias a la UI; las estructuras de tabs y grupos viven en `*-taxonomy.ts`. Esto permite
  que el motor de criterios consuma los catálogos sin importar nada de la presentación.

- **Construcción en tiempo de módulo**: `DIAGNOSIS_TABS` y `DRUG_CATEGORIES` se construyen una
  sola vez al importar el módulo (no son funciones que se llamen en cada render). Esto es posible
  porque el catálogo es estático; el coste de construcción se paga una vez.

- **Duplicación de grupos vs `additionalCategories`**: en `medications-taxonomy.ts` hay dos
  estrategias conviviendo. Para grupos que deben aparecer en varias categorías, algunos se duplican
  físicamente como objetos idénticos (p.ej. `diur_asa` en `cardiovascular` y `renal`); otros
  declaran `additionalCategories` pero no se duplican (p.ej. `isrs` en `snc`). No hay una
  estrategia uniforme; el campo `additionalCategories` actúa solo como documentación de intención.

- **`DIAGNOSIS_SUBGROUPS` solo para Cardiovascular**: el resto de sistemas no tienen subgrupos.
  El código de `buildGroupsForSystem` soporta subgrupos para cualquier sistema, pero el dato solo
  cubre Cardiovascular. Esto parece una decisión pragmática (Cardiovascular es el sistema con más
  diagnósticos y mayor heterogeneidad).

- **Dependencias cardiovasculares como dato, no como lógica dispersa**: la regla de
  habilitación/deshabilitación de diagnósticos cardiovasculares podría estar embebida en el
  componente, pero se externaliza a `cardiovascular-dx-dependencies.ts`. Esto permite añadir nuevas
  dependencias sin tocar el componente y testearlas de forma aislada.

- **`byClass()` como helper interno**: en lugar de filtrar `MEDICATIONS` en cada componente,
  `medications-taxonomy.ts` centraliza la derivación de listas de fármacos por clase. Garantiza
  que si se añade un fármaco al catálogo, aparece automáticamente en todos los grupos que declaren
  su clase.

---

## Invariantes

- Todo diagnóstico que aparece en `criteria.json` (evaluado por el motor de criterios) debe tener
  una entrada en `DIAGNOSIS_MAP`; de lo contrario, `normalizeDiagnosis()` generará una clave por
  fallback que puede no coincidir con la que usa el criterio.
- Todo fármaco de `MEDICATIONS` que sea relevante para un criterio STOPP/START debe tener asignada
  la clase farmacológica correcta en `drugClasses`; el motor de criterios opera por clase.
- `DIAGNOSIS_GROUPS` y `DIAGNOSIS_MAP` deben cubrir los mismos labels: si un diagnóstico está en
  uno y no en el otro, la UI lo mostrará pero el motor no podrá evaluarlo (o viceversa).
- `isDiagnosisEnabled()` solo evalúa diagnósticos del mapa `CARDIOVASCULAR_DX_DEPS`; para
  cualquier otro diagnóstico siempre devuelve `true`. No debe usarse para validar si el
  diagnóstico existe en el catálogo.
- `DRUG_CATEGORIES` deriva sus listas de fármacos dinámicamente desde `MEDICATIONS` via
  `byClass()`; la única excepción es el grupo `atb_grales` (antibióticos generales), cuya lista de
  fármacos está hardcodeada directamente.

---

## Familias de variantes excluyentes (P15)

### Qué son

Algunos diagnósticos del catálogo forman **familias de variantes mutuamente excluyentes**: dentro
de una familia, seleccionar una variante desactiva automáticamente el resto (comportamiento
radio-button). Esta capa es puramente declarativa y se apoya sobre el modelo plano existente
(`DIAGNOSIS_MAP`); el motor de criterios no cambia.

Implementado en dos ficheros complementarios:

| Fichero | Rol |
|---|---|
| `src/app/core/data/diagnosis-variants.ts` | Modelo de datos, lógica `applyMutex`, guard de integridad |
| `src/app/core/data/diagnosis-variant-view.ts` | Lógica de presentación: `partitionGroupDiagnoses` |

### Modelo (`diagnosis-variants.ts`)

**`DiagnosisVariantFamily`**: interfaz con `id` (identificador estable de familia, no es código de
diagnóstico), `rootLabel` (encabezado del árbol / etiqueta de la raíz genérica), `rootSelectable`
(¿la raíz genérica es ella misma una opción seleccionable del radio?), y `variants[]` (variantes en
orden clínico, no alfabético).

**`DIAGNOSIS_VARIANT_FAMILIES`**: array de familias activas. En la iteración actual (D15.1/D15.2)
solo contiene la familia `hta`:
- `rootLabel: 'HTA'`, `rootSelectable: true` → "HTA (sin especificar)" es una opción válida.
- Variantes: `['HTA no complicada', 'HTA moderada', 'HTA grave']`.

Otras familias candidatas (EPOC, Dolor, Bloqueo AV, Osteopenia/Osteoporosis) están comentadas
en el fichero pendientes de **validación clínica con Raquel** — no activar sin confirmar.

**`MUTEX_SIBLINGS`**: índice derivado `Record<string, string[]>` que mapea cada código interno
de miembro a sus hermanos. Se construye una sola vez en tiempo de módulo. Permite exclusividad
en O(1) durante el toggle de diagnósticos.

**`applyMutex(selected, chosenCode)`**: función pura que implementa el toggle exclusivo:
- Toggle-off (ya seleccionado): solo retira la elegida. No arrastra hermanos que pudieran convivir
  por estado heredado de un JSON antiguo (D15.5: se respeta hasta que el usuario seleccione).
- Selección: colapsa la familia retirando todos los hermanos y añadiendo `chosenCode`.
- Diagnósticos sin familia: toggle simple sin efecto mutex.

**`familyMemberLabels(family)`**: devuelve `[rootLabel, ...variants]` si `rootSelectable`, o solo
`[...variants]` en caso contrario.

**Guard de integridad**: al cargar el módulo se verifica que cada label declarado en
`DIAGNOSIS_VARIANT_FAMILIES` existe en `DIAGNOSIS_MAP`. Si falta (typo, rename), lanza un `Error`
en tiempo de carga, no en tiempo de ejecución tardío.

### Vista (`diagnosis-variant-view.ts`)

**`partitionGroupDiagnoses(diagnoses)`**: dado el array de labels del grupo, devuelve
`GroupDiagnosisPartition`:
- `families`: array de `VariantFamilyView` (una por familia cuyo `rootLabel` o alguna `variant`
  está presente en el grupo). Cada vista incluye `showRoot` (raíz presente y seleccionable),
  `rootDisplayLabel` (`"HTA (sin especificar)"`), y `variants` filtradas a las presentes.
- `plain`: diagnósticos del grupo que no pertenecen a ninguna familia activa.

El resultado se usa por `DiagnosisStepComponent` para renderizar dentro de cada grupo un árbol
de familia con radio-behavior antes de los diagnósticos planos.

### Decisiones aplicadas

| Decisión | Qué establece |
|---|---|
| D15.1 | Solo la familia HTA se activa en la primera iteración. |
| D15.2 | La raíz HTA es `rootSelectable: true` → "HTA sin especificar" es una opción válida del radio. |
| D15.3 | Toggle-off no arrastra hermanos (respeta estado heredado de JSON antiguo). |
| D15.4 | `MUTEX_SIBLINGS` indexa por código interno, no por label — mismo espacio que persiste/exporta el store. |
| D15.5 | El guard de integridad lanza en tiempo de carga, no silencia errores de typo. |
| D15.6 | No se renombran códigos internos del catálogo; la familia es metadato declarativo sobre el modelo plano. |

### Si cambias las familias de variantes…

| Cambio | También hay que tocar |
|---|---|
| Activar una familia comentada | Confirmar con Raquel primero; luego descomentar, verificar que todos los labels existen en `DIAGNOSIS_MAP`, y actualizar este doc. |
| Añadir/renombrar un label de variante | `DIAGNOSIS_MAP` también debe tenerlo (la guard lanzará en caso contrario). |
| Cambiar `rootSelectable` de una familia | Verificar `partitionGroupDiagnoses` y la plantilla de `diagnosis-step.component.html`. |
| Cambiar `applyMutex` | Revisar `group-checked.ts`, `diagnosis-step.component.ts` y specs de integración. |

---

## Si cambias esto…

| Cambio | También hay que tocar |
|---|---|
| Añadir/renombrar un diagnóstico | `DIAGNOSIS_GROUPS`, `DIAGNOSIS_MAP`, y opcionalmente `DIAGNOSIS_SUBGROUPS` (si es Cardiovascular). Si el diagnóstico aparece en `criteria.json`, la clave debe coincidir. Actualizar este doc. |
| Añadir un nuevo fármaco | `MEDICATIONS` (con sus `drugClasses`). Verificar que las clases declaradas ya existen en `medications-taxonomy.ts`; si no, añadir un nuevo grupo o categoría allí también. |
| Añadir/cambiar un grupo en `DRUG_CATEGORIES` | Comprobar si el grupo debe aparecer en varias categorías y decidir la estrategia (duplicado físico o `additionalCategories`). Si se usa la segunda estrategia, actualizar el consumidor si lo hay. |
| Añadir una dependencia cardiovascular nueva | `CARDIOVASCULAR_DX_DEPS` + spec `cardiovascular-dx-dependencies.spec.ts`. Verificar que la clase o id declarado existe en `MEDICATIONS`. |
| Cambiar el orden de tabs o añadir un sistema nuevo al orden prioritario | `TAB_ORDER` en `diagnoses-taxonomy.ts`. |
| Mover un sistema de `OTROS_SYSTEMS` a tab propio (o viceversa) | `OTROS_SYSTEMS` y `OTROS_GROUP_ORDER` en `diagnoses-taxonomy.ts`. |
| Cambiar la función `normalizeDiagnosis` | Verificar que todos los diagnósticos de `criteria.json` siguen resolviendo a la misma clave. Ejecutar `scripts/audit-criteria.cjs`. |
| Cambios que afectan a la UI de selección | Verificar en `meds-step.component.ts` / `diagnosis-step.component.ts` (ver `docs/flujo-pasos.md`). |
| Cambios que afectan al motor de criterios | Ver `docs/motor-criterios.md` y `src/app/core/services/criteria-engine.service.ts`. |

Tests relacionados:
- `src/app/core/data/diagnoses.spec.ts` — `resolveDiagnosisLabel` (no cubre `normalizeDiagnosis`).
- `src/app/core/data/medications-taxonomy.spec.ts` — `resolveMedicationLabel`.
- `src/app/core/data/cardiovascular-dx-dependencies.spec.ts` — `isDiagnosisEnabled` e integridad del mapa.
- No existen specs para `diagnoses-taxonomy.ts` ni para `medications.ts`.

---

## Asunciones

- Se asume que `additionalCategories` en `DrugGroup` está pensado para que algún componente
  consumidor lo use para duplicar la visualización de un grupo en varias pestañas. El código de
  construcción de `DRUG_CATEGORIES` no lo procesa, así que actualmente solo es documentación de
  intención.
- No se ha confirmado si la ausencia de `DIAGNOSIS_SUBGROUPS` fuera de Cardiovascular es una
  limitación pendiente o una decisión de diseño definitiva.
- El script `scripts/audit-criteria.cjs` se asume que valida la consistencia entre los catálogos
  de este módulo y `criteria.json`; no se ha analizado en detalle en este documento.
- `criteria.json` se carga desde `criteria-engine.service.ts`, fuera de este módulo; las claves
  de diagnóstico y las clases farmacológicas declaradas aquí deben coincidir con las que usa ese
  fichero.
