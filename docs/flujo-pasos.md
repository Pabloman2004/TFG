# Flujo de pasos

## Qué hace

La aplicación STOPP/START guía al clínico en dos pasos secuenciales:

1. **Paso 1 — Medicamentos** (`/medicaciones`, `MedsStepComponent`): el clínico selecciona los fármacos activos del paciente organizados por categoría terapéutica (tabs: cardiovascular, neurológico, etc.). En tiempo real se evalúan los criterios STOPP/START y se muestran en una columna derecha agrupados por sistema orgánico.

   Cada tab muestra campos clínicos contextuales cuando hay medicamentos
   seleccionados **visibles en ese tab** (propios o foráneos): dosis/duración
   según la clase del fármaco (Digoxina, IBP, hierro, benzos/Z, corticoides,
   paracetamol, AAS…). El tab Renal además captura TFGe. Los cambios
   actualizan inmutablemente `Med[]` o `Labs` y se persisten junto con el caso.

2. **Paso 2 — Diagnósticos** (`/diagnosticos`, `DiagnosisStepComponent`): el clínico selecciona los diagnósticos activos organizados por sistema orgánico. La columna derecha sigue mostrando los criterios activados actualizados.

En ambos pasos:
- Cada tab puede marcarse como "revisado" explícitamente si no tiene selección, para dejar constancia de que el clínico lo revisó y no aplica nada.
- Dentro de cada tab aparece un "bucket" secundario con ítems de otros sistemas que son relevantes para los criterios del tab activo (calculado por `CriteriaEngineService.relevance()`).
- Se pueden añadir ítems personalizados ("Otro") que no están en el catálogo.
- Los criterios activos pueden exportarse como PDF, copiarse al portapapeles o guardarse en JSON.

## Cómo está implementado

### Ficheros clave

| Fichero | Rol |
|---|---|
| `src/app/steps/meds-step/meds-step.component.ts` | Lógica del paso de medicamentos |
| `src/app/steps/meds-step/meds-step.component.html` | Plantilla del paso de medicamentos |
| `src/app/steps/diagnosis-step/diagnosis-step.component.ts` | Lógica del paso de diagnósticos |
| `src/app/steps/diagnosis-step/diagnosis-step.component.html` | Plantilla del paso de diagnósticos |
| `src/app/core/group-checked.ts` | Helpers puros `isMedGroupChecked` / `isDxGroupChecked` |
| `src/app/core/criteria-groups.ts` | Helpers puros `groupBySystem` / `critCode` |
| `src/app/core/group-visibility.ts` | Lógica unificada de visibilidad de buckets (T8) |
| `src/app/core/clinical-capture.ts` | Campos de dosis/duración visibles por tab y clase de fármaco |

### Flujo reactivo (ambos componentes)

```
ngOnInit()
  └─ criteriaEngine.loadCriteria()   → criteria (signal)
       │
       ▼
applicableCriteria (computed)
  ← store.meds() + store.diagnoses() + store.labs()
  ← criteriaEngine.evaluate(patientCase, criteria)
       │
       ├─► stoppCriteria / startCriteria (computed)
       └─► stoppGroups / startGroups  via groupBySystem()  → plantilla
```

Los efectos registrados en el constructor con `allowSignalWrites: true` hacen:
- **Efecto de `lastCriterionId`**: detecta criterios nuevos comparando el conjunto actual con el anterior y actualiza la señal (el ID no se usa en plantilla actualmente — ver Asunciones).
- **Efecto de limpieza de tabs revisados**: si un tab tiene selección, el flag "revisado explícito" se elimina automáticamente para evitar inconsistencias en el JSON exportado.
- **Efecto de dependencias cardiovasculares** (solo `DiagnosisStepComponent`): cuando cambia `meds()`, filtra los diagnósticos activos y elimina los que ya no están habilitados según `isDiagnosisEnabled`.

### `group-visibility.ts`: lógica unificada de buckets (T8)

`src/app/core/group-visibility.ts` centraliza el cálculo de qué grupos son visibles en cada tab,
extraído en el incremento T8 para eliminar la duplicación entre `MedsStepComponent` y
`DiagnosisStepComponent`.

Exporta cuatro funciones puras y sus tipos asociados:

- **`computeMedGroupBuckets(tabId, categories, relevance, otrosTabId, medications)`**: calcula
  `MedGroupBuckets` (`{ ownAll, foreignRelevant }`). Recibe el catálogo para comparar todas las
  `drugClasses` de cada medicamento con las clases relevantes del tab:
  - Los **multi-fármaco** (`drugs.length > 1`) usan `relevance.classesByTab` (relevancia completa,
    transversal incluida): siempre en `ownAll` de su tab; como foráneos solo con los medicamentos
    cuya intersección de clases sea no vacía.
  - Los **unitarios** (`drugs.length === 1`) solo afloran por relevancia **específica**
    (`relevance.specificClassesByTab`): como foráneos aparecen únicamente en el tab cuyo criterio
    referencia alguna de sus clases; si afloran en cualquier tab específico, permanecen visibles
    también en su categoría principal. La relevancia transversal no basta para hacerlos aflorar
    (p. ej. Paracetamol vía "Analgésicos" permanece en Otros).
  - La coincidencia se calcula por medicamento, no por `DrugGroup.drugClass`. Esto permite que un
    AOD aflore por `INHIBIDOR_FACTOR_XA`, aunque el grupo visual se denomine
    `ANTICOAGULANTE_DIRECTO`, y que grupos sin `drugClass` afloren por sus miembros.
  - Dentro de un tab los medicamentos foráneos se deduplican por ID, priorizando el grupo cuya
    `drugClass` coincide directamente con la clase relevante antes de recurrir a la coincidencia
    multiclase. El mismo ID puede aparecer en tabs distintos y conserva una única selección
    compartida en el store.
  - El tab especial `otrosTabId` agrega los fármacos de grupos unitarios, **excepto** los que
    afloran por relevancia específica en algún tab de sistema (para no duplicarlos), usando
    también todas las clases del medicamento.
  - `ownAll` se ordena con `Intl.Collator('es')`; los foráneos no se repiten si la `drugClass` ya
    está en `ownAll`.
- **`medGroupsVisibleInTab(tabId, categories, relevance, otrosTabId, medications)`**: alias plano
  de lo anterior; devuelve `[...ownAll, ...foreignRelevant]`.
- **`computeDxGroupBuckets(tab, allTabs, relevance)`**: calcula `DxGroupBuckets`
  (`{ ownGroups, foreignRelevant }`). Los grupos foráneos se construyen agrupando diagnósticos de
  otros tabs que aparecen en `relevance.dxsByTab.get(tab.id)`; cada grupo foráneo lleva
  `originTabId`/`originTabLabel` para que la plantilla los distinga visualmente.
- **`dxGroupsVisibleInTab(tab, allTabs, relevance)`**: alias plano del anterior.

Todos los cálculos usan `Intl.Collator('es', { sensitivity: 'base' })` para ordenación correcta
de caracteres españoles (`ñ`, vocales acentuadas).

### Los dos buckets: `groupBuckets` y `groupsVisibleInTab`

Cada componente calcula dos representaciones similares del contenido visible de un tab:

- **`groupBuckets` (computed)**: devuelve `{ ownAll, foreignRelevant }` (meds) o `{ ownGroups, foreignRelevant }` (dx). Es el que usa la plantilla para renderizar la columna izquierda.
- **`groupsVisibleInTab(tabId)` / `dxGroupsVisibleInTab(tab)` (métodos privados)**: calculan lo mismo pero devuelven una lista plana. Los usan internamente `tabHasSelection`, `tabSelectionCount` y `isReviewedDisabled`.

Ambos consultan `criteriaEngine.relevance()` para saber qué clases/diagnósticos foráneos deben aparecer en el tab activo.

### Helpers de grupos

**`src/app/core/group-checked.ts`**:
- `isMedGroupChecked(group, meds)`: devuelve `true` si algún fármaco conocido del grupo está en `meds`, o si está el genérico `otro__<group.id>`, o si hay un fármaco custom con la misma `drugClass`.
- `isDxGroupChecked(group, diagnoses)`: devuelve `true` si algún diagnóstico normalizado del grupo está seleccionado, o si está el genérico `<group.id>__otro`, o si hay algún código custom con prefijo `<group.id>__` que no sea del catálogo global.

**`src/app/core/criteria-groups.ts`**:
- `groupBySystem(criteria)`: agrupa `Crit[]` en `CritGroup[]` preservando el orden de primera aparición de cada sistema.
- `critCode(id)`: extrae el código de sección del ID (ej.: `"STOPP-B1-..."` → `"B1"`).

### Ítems personalizados ("Otro")

- **Medicamentos**: `toggleOtro(group)` añade un `Med` con `id = "otro__<group.id>"` y `drugClasses = [group.drugClass]` si existe. `showOtroFor(group)` solo muestra el botón si la clase del grupo aparece en algún criterio activo.
- **Diagnósticos**: `toggleOtroDx(group)` añade el código `"<group.id>__otro"` sin ningún texto adicional. `customDxFor(group)` devuelve códigos con prefijo `<group.id>__` que no están en el catálogo global (diagnósticos completamente personalizados).

### Tab "revisado"

El marcador de tab revisado se gestiona en `CaseStoreService` (`reviewedMedTabs` / `reviewedDxTabs`). Los componentes exponen:
- `isReviewedDisabled(tabId)`: `true` si el tab tiene selección (no se puede marcar manualmente).
- `isTabExplicitlyReviewed(tabId)`: `true` si está marcado como revisado Y no tiene selección.
- `toggleReviewed(tabId)`: activa/desactiva el flag si no está deshabilitado.
- El efecto de limpieza automática en el constructor elimina el flag si se añade una selección al tab.

## Decisiones de diseño

- **`ChangeDetectionStrategy.OnPush` + signals**: toda la reactividad pasa por signals y computed, sin RxJS. El motor de criterios se invoca solo cuando cambia `meds`, `diagnoses` o `labs`.
- **Bucket de "relevantes de otros sistemas"**: evita que el clínico tenga que navegar a otro tab
  para seleccionar un fármaco/diagnóstico relevante. Para medicamentos, el índice de clases se
  cruza con todas las clases de cada entrada de `MEDICATIONS` y el grupo foráneo se filtra al
  subconjunto coincidente; la taxonomía decide la presentación, no la relevancia clínica.
- **`Intl.Collator('es')`**: la ordenación de grupos foráneos y fármacos del tab "Otros" usa el cotejador en español para ordenación correcta de caracteres como `ñ` y vocales acentuadas.
- **Tab "Otros" de medicamentos**: agrega los fármacos de grupos con un único medicamento (`drugs.length === 1`) de todas las categorías, salvo los unitarios cuya `drugClass` es **específicamente** relevante en algún tab de sistema (esos afloran en su tab y se excluyen de "Otros" para no duplicar; la relevancia transversal/comodín no cuenta para esto); es un tab de miscelánea para fármacos poco frecuentes y no referenciados por criterios específicos.
- **Duplicación deliberada de los dos componentes**: `MedsStepComponent` y `DiagnosisStepComponent` replican casi toda la infraestructura. No se ha extraído a un componente base. Ver "Si cambias esto…" y "Problemas detectados" en `analysis/steps.md`.

## Invariantes

- `criteria` (signal) se carga en `ngOnInit()` mediante `criteriaEngine.loadCriteria()`. Hasta que completa, `applicableCriteria()` devuelve `[]` (guarda `if (!crits.length) return []`).
- Un tab con selección nunca puede estar marcado como "revisado explícito" al mismo tiempo: el efecto de limpieza lo garantiza.
- Los diagnósticos cardiovasculares dependientes se eliminan automáticamente del store si se retira el medicamento del que dependen (`isDiagnosisEnabled` en el efecto de `DiagnosisStepComponent`).
- `isMedGroupChecked` / `isDxGroupChecked` son funciones puras sin efectos secundarios: solo leen sus parámetros.
- `groupBySystem` preserva el orden de primera aparición de cada sistema orgánico en la lista de criterios.
- El botón "Otro" de medicamentos (`showOtroFor`) solo aparece si la clase del grupo tiene al menos un criterio activo que la referencia (`inDrugClass`).

## Si cambias esto…

- **Añadir un nuevo tab de sistema** (en `DRUG_CATEGORIES` o `DIAGNOSIS_TABS`): ambos componentes calculan sus listas de tabs dinámicamente; no requieren cambios en el componente, pero sí en `docs/catalogo-clinico.md` y en `system-relevance.ts` (ver `docs/motor-criterios.md`).
- **Cambiar la lógica de buckets foráneos** (`groupBuckets` o `groupsVisibleInTab`): hay **dos implementaciones paralelas** en cada componente que deben mantenerse en sintonía, más el método privado `dxGroupsVisibleInTab` en `DiagnosisStepComponent`. Actualiza ambas y este documento.
- **Cambiar `isMedGroupChecked` o `isDxGroupChecked`** (`src/app/core/group-checked.ts`): revisar los tests `core/group-checked.spec.ts`, y verificar que `tabHasSelection`, `groupHasAnySelection` y la clase CSS `drug-col-sel` siguen funcionando correctamente. Actualiza este documento.
- **Cambiar `groupBySystem` o `critCode`** (`src/app/core/criteria-groups.ts`): revisar `core/criteria-groups.spec.ts`, y verificar la columna derecha de ambos pasos y `buildCriteriaText` (`docs/informes-y-exportacion.md`). Actualiza este documento.
- **Cambiar el formato de códigos de ítems "Otro"** (`otro__<group.id>` / `<group.id>__otro`): afecta a `group-checked.ts`, al informe PDF (`report.service.ts`), a la exportación JSON (`CaseExport`), y a los tests de `group-checked.spec.ts` y `case-io.service.spec.ts`. Ver `docs/informes-y-exportacion.md` y `docs/caso-clinico.md`.
- **Cambiar la estructura de `CaseStoreService`** (signals de tabs revisados, `collapsedSections`, `activeSystemTab`): ambos componentes dependen de estas señales para tabs, buckets y secciones colapsadas. Ver `docs/caso-clinico.md`.
- **Añadir o modificar efectos con `allowSignalWrites`**: riesgo de ciclos reactivos. Comprobar que todas las ramas del efecto tienen condiciones de guarda que eviten escrituras redundantes.
- Al modificar cualquiera de los ficheros enlazados, actualiza este documento (`docs/flujo-pasos.md`).

## Asunciones

- `lastCriterionId` se calcula en un efecto con `allowSignalWrites: true` en ambos componentes, pero no se referencia en ninguna plantilla. Se asume que es una funcionalidad de scroll-to-new-criterion pendiente de implementar o retirada, no un bug de compilación.
- `MEDICATIONS` está importado en `DiagnosisStepComponent` (línea 17) pero ningún método del componente lo usa directamente. Se asume que es un import residual de una refactorización anterior.
- La señal `criteria` en ambos componentes es local (no viene del store). Se asume que esto es deliberado para evitar compartir el array de criterios cargados entre los dos pasos, aunque en la práctica `loadCriteria()` devuelve el mismo JSON ambas veces.
- El tab "Otros" de `DiagnosisStepComponent` delega directamente en `tab.groups` sin transformación adicional, mientras que en `MedsStepComponent` el tab "Otros" se construye dinámicamente agrupando fármacos de `drugs.length === 1` (excluyendo los unitarios que afloran por relevancia). El conteo y la selección del tab "Otros" en `MedsStepComponent` derivan de `groupsVisibleInTab('otros')` (fuente única de verdad), no de un recálculo manual de `drugs.length === 1`. Esta asimetría parece intencional por diferencia en la naturaleza de los catálogos.
- Los diagnósticos foráneos en el bucket de `DiagnosisStepComponent` no tienen habilitado el botón "Otro" ni los diagnósticos custom (la plantilla no los muestra para grupos `drug-col--foreign`). Se asume que es una decisión deliberada de UX.
