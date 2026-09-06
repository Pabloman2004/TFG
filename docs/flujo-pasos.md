# Flujo de pasos

## Qué hace

La aplicación STOPP/START guía al clínico en dos pasos secuenciales:

1. **Paso 1 — Medicamentos** (`/medicaciones`, `MedsStepComponent`): el clínico selecciona los fármacos activos del paciente organizados por categoría terapéutica (tabs: cardiovascular, neurológico, etc.). En tiempo real se evalúan los criterios STOPP/START y se muestran en una columna derecha agrupados por sistema orgánico.

   Los umbrales de dosis/duración de ciertos criterios (p. ej. AAS > 100 mg/día,
   benzodiacepina > 4 semanas) viven en el texto del aviso (`summary`) como juicio
   clínico: el criterio se notifica al seleccionar el fármaco (y el diagnóstico
   cuando aplica), sin pedir esos datos al usuario. La captura de
   **analíticas/constantes** se centraliza en el paso de Diagnósticos (ver paso 2).
   Los campos opcionales `doseMgDay` / `doseMcgDay` / `durationDays` pueden seguir
   presentes en casos JSON antiguos y se cargan sin error, pero ya no se editan en la UI.

2. **Paso 2 — Diagnósticos** (`/diagnosticos`, `DiagnosisStepComponent`): el clínico selecciona los diagnósticos activos organizados por sistema orgánico. La columna derecha sigue mostrando los criterios activados actualizados.

   La pestaña «Otros» incluye además un **panel fijo de analítica/constantes**
   (TFGe, PAS/PAD, frecuencia, QTc, iones, calcio corregido, TSH) siempre visible,
   con todos los campos que algún criterio puede leer. Es fijo a propósito: los
   criterios START (p. ej. B1, que sugiere antihipertensivo si PAS/PAD elevada y el
   paciente **no** toma ninguno) dependen de constantes de cribado que ninguna
   selección "activa", así que no pueden condicionarse a un medicamento o
   diagnóstico. La presentación la aporta `core/lab-capture.ts` y los cambios
   actualizan inmutablemente `Labs`, compartido con el paso de Medicamentos.

En ambos pasos:
- Los tabs se muestran en **raíl lateral vertical** (por defecto) o en **barra horizontal**
  superior, según la preferencia `tabsOrientation` de `DisplaySettingsService` (ver
  `accesibilidad-ui`). Es el mismo marcado en ambos casos: los componentes exponen
  `tabsVertical()` y la plantilla aplica `.card-body--vertical`. El raíl vertical cabe
  entero sin scroll horizontal, que era el problema de la barra superior con 11–13 tabs.
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
| `src/app/core/clinical-capture.ts` | Helper de visibilidad de medicamentos por grupos del tab (`medsVisibleInTabGroups`) |
| `src/app/core/lab-capture.ts` | Presentación del panel fijo de analítica/constantes (todos los campos, siempre; pestaña «Otros» de diagnósticos) |
| `src/app/core/new-criteria.ts` | Detección del último lote de criterios añadidos, expansión de secciones y autoscroll |

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
- **Efecto de último lote añadido** (`new-criteria.ts`): compara los ids aplicables actuales con los anteriores. El primer snapshot con catálogo cargado no resalta (carga inicial o caso persistido). A partir de ahí, **todos** los criterios que aparecen en la misma evaluación —no solo el último id— quedan con `crit-card--new` (verde más intenso en START, rojo más intenso en STOPP) hasta que entre un lote más reciente. Si la sección estaba colapsada, se expande; después hay autoscroll al último START y al último STOPP del lote (`scrollIntoView` con `block: nearest`).
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
  - Tanto **multi-fármaco** como **unitarios** usan solo relevancia **específica**
    (`relevance.specificClassesByTab`) para el bucket «Relevantes de otros sistemas»: un fármaco
    foráneo solo aparece si algún criterio cuyo `system` mapea específicamente a ese tab cita
    alguna de sus clases. La relevancia transversal (Analgésicos, Caídas, Anticolinérgicos,
    Indicación) **no** aporta casillas foráneas.
  - Los **unitarios** (`drugs.length === 1`) además solo afloran fuera de «Otros» por esa misma
    relevancia específica: si afloran en cualquier tab específico, permanecen visibles también
    en su categoría principal. La relevancia transversal no basta (p. ej. Paracetamol vía
    "Analgésicos" permanece en Otros).
  - La coincidencia se calcula por medicamento, no por `DrugGroup.drugClass`. Esto permite que un
    AOD aflore por `INHIBIDOR_FACTOR_XA`, aunque el grupo visual se denomine
    `ANTICOAGULANTE_DIRECTO`, y que grupos sin `drugClass` afloren por sus miembros.
  - Dentro de un tab los medicamentos foráneos se deduplican por ID, priorizando el grupo cuya
    `drugClass` coincide directamente con la clase relevante antes de recurrir a la coincidencia
    multiclase. El mismo ID puede aparecer en tabs distintos y conserva una única selección
    compartida en el store.
  - Al **marcar** un fármaco del bucket «Relevantes de otros sistemas»,
    `resolveForeignHighlight` (`foreign-provenance.ts`) resalta durante 8 s. La cascada es
    **aditiva**, no excluyente: resalta los grupos propios co-partícipes del tab **y** la
    tarjeta del criterio si ya está disparado; si ningún criterio se ha disparado todavía,
    añade además un snackbar (`panelClass: snack-relacion`, estilado en `styles.css`) con el
    criterio y lo que falta por marcar. Desmarcar no resalta; marcar un fármaco de `ownAll`
    tampoco.
  - Una casilla foránea puede estar implicada en **varios criterios** (20 de las 135 casillas
    de diagnóstico lo están): el aviso los nombra todos, una línea por criterio, ordenados
    del más cercano a dispararse al más lejano. Los criterios que comparten código corto
    (STOPP-B14 tiene dos variantes) se agrupan y se conserva la vía más corta.
  - Cada requisito pendiente lleva **dónde encontrarlo** (`paso 1 · Cardiovascular`), porque
    116 de esas 135 casillas exigen algo del otro paso o de otra pestaña. La ubicación se
    omite cuando el requisito ya está en el paso y la pestaña actuales, y lista hasta dos
    pestañas cuando la clase vive en varias (`SNC o Osteo/Músculo-esq.`).
  - El chip de enlace es **bidireccional**: apunta tanto a grupos propios como a los del bucket
    «Relevantes de otros sistemas». Marcar Furosemida (propia de Cardiovascular) señala los AINE
    y los corticoides, que son foráneos, porque B19 los empareja. Antes solo se veía el sentido
    foráneo → propio, así que marcar un fármaco propio no producía ninguna señal en su pestaña.
    Total de enlaces: 62 → 146.
  - **START ya cubierto por el propio fármaco.** Un START se modela como «cumple la indicación
    Y NO toma ya el fármaco», así que la clase recomendada aparece solo negada. Si el usuario
    acaba de marcar ese fármaco, el criterio no puede dispararse y pedirle los diagnósticos
    pendientes sería mandarle a marcar cosas inertes. En vez de `requiere: …` el aviso explica
    qué recomendaba el criterio y por qué ya no aplica:
    `START B2 recomienda iniciar estatina; ya no puede saltar porque el paciente toma Estatinas`.
    La descripción sale de la primera frase del `summary` sin el prefijo «Considerar» (los 52
    START lo llevan), recortada por palabra a 70 caracteres. Esos criterios se ordenan al final
    por ser informativos, no accionables. Afectaba a 29 de las 235 casillas foráneas de medicación (estatinas →
    START-B2, hierro IV → START-B11, alfabloqueantes → START-B1). **Solo aplica a
    medicamentos**: marcar un diagnóstico nunca suprime un START, lo habilita.
  - **El aviso se calla cuando no aporta nada**: si *todos* los requisitos pendientes viven en
    la pantalla actual, el resaltado del grupo y el chip de enlace ya los están señalando, y el
    snackbar solo repetiría en texto lo que el usuario tiene delante (marcar amilorida ilumina
    IECA / ARA-II / antag. aldosterona y encima decía «requiere: Antag. aldosterona»). Afecta a
    19 de las 235 casillas foráneas de medicación (8%). La condición se evalúa sobre los
    criterios ya deduplicados por código, no sobre todos los que citan al fármaco: sildenafilo
    toca dos variantes de B14 y solo se muestra la más corta, así que es esa la que decide.
    Un requisito de **ubicación desconocida** no cuenta como visible — sale sin paréntesis
    igual, pero al usuario no le consta en ningún sitio y ahí el aviso sí hace falta.
    Invariante cubierto por test: una casilla silenciada siempre tiene grupos resaltados.
  - Solo se resaltan **co-requisitos**, nunca **alternativas**. Si el criterio pide
    `A y (B o C)` y el usuario marca `C`, se resalta `A` — no `B`, cuya selección no acercaría
    el criterio a dispararse. Lo resuelven `classAlternativesByCriterion` /
    `dxAlternativesByCriterion`, que `buildRelevance` calcula a partir de las ramas de cada
    nodo `or`. El mensaje de «requiere» colapsa cada racimo de alternativas en una entrada
    («Insuficiencia cardíaca u otras 4 variantes») y nombra las clases con etiqueta legible
    vía `drugClassLabel`.
  - `foreignLinksByOwnGroup` / `foreignLinksByOwnDx` calculan un enlace **persistente**:
    mientras el fármaco (o diagnóstico) foráneo siga marcado, el grupo propio relacionado
    muestra un `app-link-badge` (botón de color fijo) con el número de casillas foráneas
    que apuntan a él. Al pulsarlo, un popover HTML lista esas asociaciones agrupadas
    en medicamentos y diagnósticos. Es lo que permite ver que dos selecciones distintas
    convergen en el mismo grupo, algo que el pulso transitorio por sí solo no comunica.
  - `relatedSelectionLinks` extiende ese enlace **a través de pasos y pestañas**, en sentido
    inverso: dado un elemento de la pestaña actual, devuelve qué elementos **ya marcados**
    (de cualquier paso) la literatura asocia con él. Es lo que hace que, tras un aviso del tipo «requiere:
    Intervalo QTc prolongado (diagnóstico · paso 2 · Cardiovascular)», al llegar a ese
    diagnóstico se vea un chip 🔗 con los fármacos asociados. Se apoya en los índices
    inversos globales `criteriaByRequiredClass` / `criteriaByDx` de `Relevance` y respeta la
    misma regla de alternativas. Ambos componentes combinan los dos mapas con
    `mergeLinkMaps`. En el paso 1 los objetivos incluyen la clase del grupo **y** las de sus
    miembros, para que un diagnóstico pueda apuntar a grupos que contienen fármacos
    relevantes aunque el grupo no lleve esa clase (QTc → Antiarrítmicos, Antianginosos).
  - El tab especial `otrosTabId` agrega los fármacos de grupos unitarios, **excepto** los que
    afloran por relevancia específica en algún tab de sistema (para no duplicarlos), usando
    también todas las clases del medicamento.
  - `ownAll` se ordena con `Intl.Collator('es')`; los foráneos no se repiten si la `drugClass` ya
    está en `ownAll`.
- **`medGroupsVisibleInTab(tabId, categories, relevance, otrosTabId, medications)`**: alias plano
  de lo anterior; devuelve `[...ownAll, ...foreignRelevant]`.
- **`computeDxGroupBuckets(tab, allTabs, relevance)`**: calcula `DxGroupBuckets`
  (`{ ownGroups, foreignRelevant }`). Los grupos foráneos se construyen agrupando diagnósticos de
  otros tabs que aparecen en `relevance.specificDxsByTab.get(tab.id)` (sin expansión transversal);
  cada grupo foráneo lleva `originTabId`/`originTabLabel` para que la plantilla los distinga.
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
- **Duplicación deliberada de los dos componentes**: `MedsStepComponent` y `DiagnosisStepComponent` replican casi toda la infraestructura. No se ha extraído a un componente base. Ver "Si cambias esto…" y "Problemas detectados" en `docs/historico/analysis/steps.md`.

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
- **Cambiar el resaltado del último lote** (`src/app/core/new-criteria.ts`): revisar `core/new-criteria.spec.ts` y los specs de ambos pasos que cubren `crit-card--new` y el autoscroll. El resaltado azul `crit-card--highlight` es el de procedencia foránea (`foreign-provenance.ts`), no este.
- **Cambiar el formato de códigos de ítems "Otro"** (`otro__<group.id>` / `<group.id>__otro`): afecta a `group-checked.ts`, al informe PDF (`report.service.ts`), a la exportación JSON (`CaseExport`), y a los tests de `group-checked.spec.ts` y `case-io.service.spec.ts`. Ver `docs/informes-y-exportacion.md` y `docs/caso-clinico.md`.
- **Cambiar la estructura de `CaseStoreService`** (signals de tabs revisados, `collapsedSections`, `activeSystemTab`): ambos componentes dependen de estas señales para tabs, buckets y secciones colapsadas. Ver `docs/caso-clinico.md`.
- **Añadir o modificar efectos con `allowSignalWrites`**: riesgo de ciclos reactivos. Comprobar que todas las ramas del efecto tienen condiciones de guarda que eviten escrituras redundantes.
- Al modificar cualquiera de los ficheros enlazados, actualiza este documento (`docs/flujo-pasos.md`).

## Asunciones

- `MEDICATIONS` está importado en `DiagnosisStepComponent` (línea 17) pero ningún método del componente lo usa directamente. Se asume que es un import residual de una refactorización anterior.
- La señal `criteria` en ambos componentes es local (no viene del store). Se asume que esto es deliberado para evitar compartir el array de criterios cargados entre los dos pasos, aunque en la práctica `loadCriteria()` devuelve el mismo JSON ambas veces.
- El tab "Otros" de `DiagnosisStepComponent` delega directamente en `tab.groups` sin transformación adicional, mientras que en `MedsStepComponent` el tab "Otros" se construye dinámicamente agrupando fármacos de `drugs.length === 1` (excluyendo los unitarios que afloran por relevancia). El conteo y la selección del tab "Otros" en `MedsStepComponent` derivan de `groupsVisibleInTab('otros')` (fuente única de verdad), no de un recálculo manual de `drugs.length === 1`. Esta asimetría parece intencional por diferencia en la naturaleza de los catálogos.
- Los diagnósticos foráneos en el bucket de `DiagnosisStepComponent` no tienen habilitado el botón "Otro" ni los diagnósticos custom (la plantilla no los muestra para grupos `drug-col--foreign`). Se asume que es una decisión deliberada de UX.
