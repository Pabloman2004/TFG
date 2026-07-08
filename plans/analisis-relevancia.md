# Análisis: relevancia de medicamentos por sistema

> **Modo:** solo lectura / plan-only. Sin cambios de código.  
> **Fecha:** 2026-06-26  
> **Caso testigo:** Digoxina (clase `DIGOXINA`) no visible en tab cardiovascular pese a criterios B1, B4, B21.

---

## Resumen ejecutivo

Hoy existen **tres capas independientes** que interactúan:

1. **Taxonomía manual** (`medications-taxonomy.ts`): decide en qué tab vive cada grupo como “propio”.
2. **Índice de relevancia** (`buildRelevance`): **sí se deriva de `criteria.json`**, pero solo produce `clasesByTab` / `dxsByTab`; no mueve grupos de tab.
3. **Filtro de visibilidad** (`computeMedGroupBuckets`): oculta grupos unitarios (`drugs.length === 1`) en tabs normales y los concentra en **Otros**.

El bug de Digoxina **no es** que falte relevancia cardiovascular (la clase `DIGOXINA` **sí** está en `relevance.classesByTab.get('cardiovascular')`). Es que el grupo `digoxina` tiene un solo fármaco y el filtro `drugs.length > 1` lo excluye de `ownAll`; además el bucket foráneo exige `drugs.length > 1`, así que tampoco entra ahí.

---

## Parte A — Mecanismo de relevancia ACTUAL

### A.1 `SYSTEM_TO_TABS` y `buildRelevance`: ¿declarado o derivado?

**Respuesta:** híbrido en dos niveles distintos.

| Pieza | ¿Manual o derivado? | Fichero:línea |
|---|---|---|
| Mapa sistema → tab(s) UI | **Manual** (tabla fija) | `system-relevance.ts:22-36` (`SYSTEM_TO_TABS`) |
| Qué clases/dxs son relevantes por tab | **Derivado** de `criteria.json` | `system-relevance.ts:101-125` (`buildRelevance`) |
| Dónde vive cada grupo en la UI | **Manual** (taxonomía) | `medications-taxonomy.ts:28-178` (`RAW_DRUG_CATEGORIES`) |

#### Flujo actual

```
criteria.json
  └─► CriteriaEngineService.loadCriteria()          criteria-engine.service.ts:44-53
        └─► buildRelevance(crits, getAllTabIds())   criteria-engine.service.ts:51
              ├─ resolveTabsForSystem(c.system)     system-relevance.ts:45-46, 108-109
              ├─ extractReferences(c.logic)         system-relevance.ts:78-82, 112
              └─ acumula en classesByTab / dxsByTab system-relevance.ts:118-121
                    └─► signal relevance()          criteria-engine.service.ts:24-27

MedsStepComponent.groupBuckets                      meds-step.component.ts:93-99
  └─► computeMedGroupBuckets(tab, categories, relevance, 'otros')
        group-visibility.ts:24-68
```

#### `SYSTEM_TO_TABS` (manual)

```22:36:src/app/core/data/system-relevance.ts
export const SYSTEM_TO_TABS: Record<string, readonly TabId[]> = {
  'Sistema cardiovascular':                ['cardiovascular'],
  'Sistema nervioso central':              ['snc', 'neurologico', 'psiquiatrico'],
  // ...
  'Analgésicos':                           [TRANSVERSAL],
  'Riesgo de caídas':                      [TRANSVERSAL],
  'Carga antimuscarínica/anticolinérgica': [TRANSVERSAL],
  'Indicación de la medicación':           [TRANSVERSAL],
};
```

- Sistemas acotados: el criterio propaga sus referencias **solo** a los tabs listados.
- Sistemas con `TRANSVERSAL = '*'`: se expanden a **todos** los tabs conocidos (`allTabIds`), pasados desde `getAllTabIds()` (`criteria-engine.service.ts:35-38`, `system-relevance.ts:115-116`).

#### `buildRelevance` (derivado)

Para cada criterio:

1. Resuelve tabs destino vía `c.system` → `SYSTEM_TO_TABS`.
2. Extrae clases (`inDrugClass`) y diagnósticos (`in [code, {var:'diagnoses'}]`) de `c.logic` con `extractReferences` (`system-relevance.ts:53-76`).
3. Añade cada referencia a los sets del tab correspondiente.

**Ejemplo real — BETABLOQUEANTE en cardiovascular:**

- Criterio `STOPP-B3-…` con `"system": "Sistema cardiovascular"` y `{ inDrugClass: ["BETABLOQUEANTE", …] }`.
- `buildRelevance` añade `BETABLOQUEANTE` a `classesByTab.get('cardiovascular')`.
- Test que lo fija: `system-relevance.spec.ts:98-106`.

**Ejemplo real — AINE en todos los tabs de meds:**

- Criterio del sistema `"Analgésicos"` (transversal).
- Con `allTabIds` de `loadCriteria`, la clase `AINE` se replica en cardiovascular, snc, renal, etc.
- Test: `system-relevance.spec.ts:120-134`.

**Importante:** `extractReferences` **no distingue negación**. Si una clase aparece dentro de `{ "!": { inDrugClass: [...] } }`, **también cuenta** como relevante. Test explícito: `system-relevance.spec.ts:70-81` (espera `IBP` dentro de un `!`).

Los campos `excludes` del criterio **no participan** en `buildRelevance`; solo afectan a `getExcludedMedications` (`criteria-engine.service.ts:116-162`).

#### Campo `additionalCategories` (manual, pero **no cableado**)

En `medications-taxonomy.ts` hay grupos con `additionalCategories: ['cardiovascular']` (p. ej. ISRS, AINE, estatinas — líneas 63-173). **Ningún consumidor** (`group-visibility.ts`, `meds-step.component.ts`) lee este campo. La única búsqueda en `src/` devuelve solo la definición del tipo y los datos en taxonomía.

Hoy la aparición cross-tab se debe **exclusivamente** a `relevance.classesByTab`, no a `additionalCategories`.

---

### A.2 ¿Qué coloca hoy en el tab cardiovascular?

Hay que separar **dónde vive el grupo** (taxonomía) de **qué se muestra** (visibilidad + relevancia).

#### Grupos propios (`ownAll`) en cardiovascular

`computeMedGroupBuckets` toma la categoría `cardiovascular` y filtra `g.drugs.length > 1` (`group-visibility.ts:45-48`).

Grupos en taxonomía cardiovascular (`medications-taxonomy.ts:30-47`) y visibilidad por conteo de fármacos en `medications.ts`:

| Grupo | Clase | Fármacos en catálogo | ¿Visible en tab cardio hoy? |
|---|---|---|---|
| Betabloqueantes | BETABLOQUEANTE | >1 | Sí (`ownAll`) |
| IECA | IECA | 2 | Sí |
| ARA-II | ARA2 | 3 | Sí |
| Diurét. de asa | DIURETICO_ASA | 2 | Sí |
| Diurét. tiazídicos | DIURETICO_TIAZIDICO | 3 | Sí |
| Antag. aldosterona | ANTAGONISTA_ALDOSTERONA | 2 | Sí |
| Antag. calcio DHP | CALCIOANTAGONISTA_DHP | >1 | Sí |
| Antag. calcio no DHP | CALCIOANTAGONISTA_NO_DHP | 2 | Sí |
| Antiarrítmicos | ANTIARITMICO | >1 | Sí |
| Nitratos | NITRATO | 3 | Sí |
| Antihipertens. central | ANTIHIPERTENSIVO_CENTRAL | >1 | Sí |
| iSGLT2 | ISGLT2 | >1 | Sí |
| **Digoxina** | **DIGOXINA** | **1** | **No** → va a Otros |
| **Sacubitrilo/Valsartán** | **SACUBITRILO_VALSARTAN** | **1** | **No** → va a Otros |

#### Clases “relevantes” para cardiovascular (índice derivado)

Tras simular `buildRelevance` sobre el `criteria.json` actual (232 criterios, 13 sistemas):

- **40 clases** en `classesByTab.get('cardiovascular')`.
- **`DIGOXINA` está incluida** (4 criterios cardiovasculares positivos + apariciones en criterios transversales no añaden más hits de clase en cardio, pero la clase ya está por los propios criterios B).

Clases referenciadas por criterios con `"system": "Sistema cardiovascular"` (18 clases):

`AINE`, `ANTAGONISTA_ALDOSTERONA`, `ANTIARITMICO`, `ANTIHIPERTENSIVO_CENTRAL`, `ARA2`, `BETABLOQUEANTE`, `CALCIOANTAGONISTA_NO_DHP`, `CORTICOIDE_SISTEMICO`, `DIGOXINA`, `DIURETICO_AHORRADOR_POTASIO`, `DIURETICO_ASA`, `DIURETICO_TIAZIDICO`, `ESTATINA`, `IECA`, `INHIBIDOR_PDE5`, `NEUROLEPTICO`, `NITRATO`, `PROLONGADOR_QTC`.

Las otras ~22 clases del índice cardiovascular llegan por **sistemas transversales** (`Analgésicos`, `Indicación de la medicación`, `Riesgo de caídas`, etc.) expandidos a todos los tabs.

#### Colocaciones manuales que no se deducirían solo de “tab primario por criterio”

1. **`additionalCategories: ['cardiovascular']`** en 14 grupos cuyo tab primario es otro (ISRS, tricíclicos, neurolépticos, AINE, estatinas, quinolonas, macrólidos, etc.). **Hoy no tienen efecto** en visibilidad; el efecto cross-tab real viene del índice `relevance`.
2. **Duplicación física de grupos** entre tabs (p. ej. `DIURETICO_ASA`, `IECA`, `ARA2`, `ISGLT2` existen tanto en `cardiovascular` como en `renal` — `medications-taxonomy.ts:36-37, 90-94`). La taxonomía los coloca a mano en ambos; `buildRelevance` no decide el tab primario.
3. **Tab primario vs relevancia:** ESTATINA vive en taxonomía bajo `endocrino` con `additionalCategories: ['cardiovascular']` (`medications-taxonomy.ts:130`), pero los criterios cardiovasculares la marcan relevante en cardiovascular vía `buildRelevance`.

---

### A.3 Bucket “Relevantes de otros sistemas”

#### Mecanismo (`group-visibility.ts:50-66`)

Para un tab normal (no `otros`):

1. `relevantClasses = relevance?.classesByTab.get(tabId) ?? ∅`
2. `ownClasses` = clases ya presentes en `ownAll` del tab.
3. Recorre **todas** las demás categorías; para cada grupo `g`:
   - `g.drugs.length > 1` (obligatorio)
   - `g.drugClass` definida
   - `g.drugClass ∈ relevantClasses`
   - `g.drugClass ∉ ownClasses` (evita duplicar lo ya propio)
   - deduplica por clase (`seenForeign`)

4. Enriquece con `originTabId` / `originTabLabel` y ordena alfabéticamente.

#### UI

- Renderizado en `meds-step.component.html:179-191` cuando `groupBuckets().foreignRelevant.length > 0`.
- Misma estructura en diagnósticos: `diagnosis-step.component.html:207-218` (usa `dxsByTab`).

#### Ejemplo

En tab `cardiovascular`, si `relevance` incluye `ISRS` pero el grupo ISRS vive en tab `snc` con ≥2 fármacos, aparece en **Relevantes de otros sistemas** con badge “SNC”.

#### Por qué Digoxina NO entra en este bucket

- `DIGOXINA ∈ relevantClasses` para cardiovascular: **sí**.
- Pero el único grupo `DIGOXINA` tiene `drugs.length === 1` → falla la condición `g.drugs.length > 1` (`group-visibility.ts:58`).
- No hay copia multi-fármaco en otro tab → **no hay vía de entrada** salvo tab **Otros**.

#### Tab Otros (`group-visibility.ts:30-42`)

Agrega **todos** los fármacos de grupos unitarios de **todas** las categorías en un único grupo “Otros medicamentos”. Digoxina solo es seleccionable ahí.

---

## Parte B — Filtro `drugs.length > 1`

### B.1 ¿Por qué existe? Papel de “Otros”

Documentado en `docs/flujo-pasos.md:59-63, 112`:

- **Tabs normales:** muestran solo grupos “multi-fármaco” como columnas propias; evita una UI con decenas de columnas de un solo medicamento.
- **Tab Otros:** miscelánea de fármacos poco frecuentes / grupos unitarios de cualquier sistema.
- **Bucket foráneo:** solo grupos multi-fármaco de otros tabs; coherente con el patrón de columnas.

Asimetría intencional meds vs dxs (`docs/flujo-pasos.md:140`): en diagnósticos, Otros usa grupos estáticos; en medicaciones, Otros se **genera** dinámicamente.

### B.2 ¿Qué se rompería si se eliminara el filtro?

Asumiendo quitar `drugs.length > 1` en `ownAll` (línea 46) y `g.drugs.length <= 1` en foráneos (línea 58), **sin** tocar la lógica de Otros:

#### Grupos unitarios que aflorarían (18 grupos en taxonomía)

| Grupo | Clase | Tab primario taxonomía | ¿Relevante en cardio? |
|---|---|---|---|
| Digoxina | DIGOXINA | cardiovascular | **Sí** |
| Sacubitrilo/Valsartán | SACUBITRILO_VALSARTAN | cardiovascular | Sí |
| Analgésicos simples | ANALGESICO_SIMPLE | osteo | Sí (transversal) |
| Antieméticos | ANTIEMETICO_5HT3 | gastrointestinal | No |
| Agonista β3 | AGONISTA_BETA3 | urologico | No |
| Alfabloq. prostático | ALFABLOQUEANTE_PROSTATICO | urologico | No |
| Anabolizantes óseos | ANABOLIZANTE_OSEO | osteo | No |
| Antibióticos urinarios | ANTIBIOTICO_URINARIO | antibioticos | No |
| Antidemencia | ANTIDEMENCIA | snc | No |
| Antiespasmódicos | ANTIESPASMÓDICO | gastrointestinal | No |
| Biguanidas | BIGUANIDA | endocrino | No |
| Colchicina | COLCHICINA | osteo | No |
| Dopaminérgicos | DOPAMINERGICO | snc | No |
| Estab. del ánimo | ESTABILIZADOR_ANIMO | snc | No (pero sí en índice cardio vía criterios) |
| Hormona tiroidea | HORMONA_TIROIDEA | endocrino | No |
| Metilxantinas | METILXANTINA | respiratorio | No |
| Relaj. musculares | RELAJANTE_MUSCULAR | osteo | No |
| Ácido fólico | ACIDO_FOLICO | endocrino | No |

**En tab cardiovascular concretamente** aflorarían al menos **Digoxina** y **Sacubitrilo/Valsartán** en `ownAll`.

En **otros tabs**, cada grupo unitario aparecería en su tab primario; además, los que sean `foreignRelevant` en tabs donde su clase esté en `relevance` también podrían mostrarse como foráneos (si tuvieran copia multi-tab — hoy no aplica a unitarios).

#### Tab Otros

- **No quedaría vacío** con el código actual: Otros sigue agregando todos los `drugs.length === 1` (`group-visibility.ts:31-32`).
- **Duplicación:** los mismos fármacos aparecerían en su tab “natural” **y** en Otros → UX confusa y riesgo de doble conteo en `tabSelectionCount` / revisión de tabs (`meds-step.component.ts:171-192`).
- Otros perdería su rol de “único lugar” para unitarios unless se acople un cambio en la rama `tabId === otrosTabId`.

### B.3 Tests que asumen el comportamiento actual

| Fichero | Qué fijan |
|---|---|
| `group-visibility.spec.ts:59-65` | Otros contiene Digoxina y Donepezilo (unitarios) |
| `group-visibility.spec.ts:68-74` | Otros vacío si no hay unitarios |
| `group-visibility.spec.ts:77-80` | Tab regular sin relevancia: solo multi-fármaco en `ownAll` (Digoxina ausente en cardio fixture) |
| `group-visibility.spec.ts:83-88` | Foráneos requieren grupo multi-fármaco (`g3` ISRS, 2 drugs) |
| `group-visibility.spec.ts:106-114` | Lista plana = ownAll + foreignRelevant |
| `meds-step.component.ts:145-150, 173-177` | Lógica de selección/revisión de tab Otros basada en `drugs.length === 1` |

No hay spec de componente que nombre Digoxina explícitamente, pero cualquier cambio en visibilidad unitaria obliga a revisar **group-visibility** y la lógica de **Otros** en **meds-step**.

### B.4 Opciones para que Digoxina aparezca en cardiovascular (solo pros/contras)

#### (a) Eliminar el filtro `drugs.length > 1` por completo

| Pros | Contras |
|---|---|
| Cambio mínimo en una función | Duplicación con tab Otros si no se toca también Otros |
| Digoxina y Sac/Vals visibles en cardio de inmediato | Muchos unitarios irrelevantes aflorarían en tabs donde no aportan (ruido) |
| Coherente con “mostrar todo lo del tab taxonomía” | Rompe tests y documentación (`flujo-pasos.md`) |
| | Bucket foráneo podría mostrar unitarios de otros tabs → más ruido cross-tab |

#### (b) Mostrar grupo unitario en un tab solo si su clase es relevante para ese tab

| Pros | Contras |
|---|---|
| Resuelve el caso Digoxina sin abrir la compuerta a todos los unitarios | Requiere cruzar taxonomía + `relevance` (nueva regla) |
| Más alineado con intención clínica del bucket foráneo | Sac/Vals también en cardio; otros unitarios siguen en Otros |
| Menor ruido que (a) | Otros sigue duplicando si no se excluyen unitarios ya mostrados por relevancia |
| | Hay que definir qué pasa si la clase es relevante en **varios** tabs (¿copia en cada uno?) |

#### (c) Otras vías (sin recomendar)

| Opción | Pros | Contras |
|---|---|---|
| **Fusionar** Digoxina con otro grupo (p. ej. antiarrítmicos) | Sin cambio de arquitectura | Clínica/UX dudosa; mezcla clases distintas |
| **Bajar umbral** a `>= 1` solo en cardiovascular | Muy localizado | Inconsistente entre tabs; deuda especial |
| **Mover Digoxina** a grupo multi-fármaco ficticio | Un fármaco “Otro antiarrítmico” | Hack de catálogo |
| **Quitar filtro en foráneos** pero mantener en ownAll | Digoxina podría entrar como foráneo si hubiera copia multi-tab | No aplica: solo hay un grupo unitario en cardio |
| **Implementar `additionalCategories`** | Ya declarado en taxonomía | No resuelve Digoxina (ya está en cardio); solo cross-tab |
| **Nuevo sistema de relevancia (Parte C)** | Asignación automática de tab primario | No arregla visibilidad unitaria por sí solo |

---

## Parte C — Simulación del sistema de relevancia NUEVO

### C.0 Metodología de conteo

**Fuente:** `src/assets/data/criteria.json` (232 criterios, conteo por `system` verificado el 2026-06-26).

**Criterio “la clase aparece” (disparador positivo):**

- `inDrugClass` en ramas **no negadas** del árbol `logic`.
- Operadores `multiple*` y `digoxinaDosisAlta` mapeados a su clase (`criteria-engine.service.ts:245-254`).
- **Excluido:** clases solo dentro de `{ "!": … }`.
- **Excluido:** bloques `excludes` del criterio (no forman parte de `logic`).

**Normalización:**

\[
\text{%(clase, sistema)} = \frac{\#\text{criterios del sistema con clase positiva}}{\#\text{criterios totales del sistema}} \times 100
\]

**Sistema inicial:** sistema con **mayor %**. Empates → varios sistemas iniciales (ninguno detectado en simulación con desempate estricto).

**Otros sistemas:** cualquier sistema con hits > 0 que no sea inicial.

**Mapeo sistema → tab UI:** primera entrada de `SYSTEM_TO_TABS` (sistemas transversales no tienen tab único; se listan por nombre de sistema).

**Diferencia vs sistema actual:** hoy `buildRelevance` marca relevancia **por tab** sin elegir tab primario; la simulación propone **reubicar el tab primario** de cada clase.

### C.1 Conteo de criterios por sistema

| Sistema | Nº criterios |
|---|---|
| Sistema cardiovascular | 45 |
| Sistema nervioso central | 38 |
| Anticoagulantes/Antiagregantes | 26 |
| Sistema gastrointestinal | 19 |
| Sistema musculoesquelético | 17 |
| Riesgo de caídas | 14 |
| Sistema renal | 14 |
| Sistema urogenital | 12 |
| Sistema endocrino | 12 |
| Analgésicos | 9 |
| Indicación de la medicación | 8 |
| Sistema respiratorio | 6 |
| Carga antimuscarínica/anticolinérgica | 2 |

### C.2 Tabla — clases de criterios cardiovasculares (+ claves solicitadas)

| Clase | % por sistema (hits/total) | Sistema inicial (máx %) | Otros sistemas (>0) |
|---|---|---|---|
| **DIGOXINA** | cardio **8,89% (4/45)** · renal 7,14% (1/14) · SNC 5,26% (2/38) | **Sistema cardiovascular** → tab `cardiovascular` | SNC, renal |
| **BETABLOQUEANTE** | cardio **8,89% (4/45)** · endocrino 8,33% (1/12) · SNC 5,26% (2/38) | **Sistema cardiovascular** | SNC, endocrino |
| **IECA** | Indicación **12,5% (1/8)** · cardio 8,89% (4/45) · anticoag 3,85% (1/26) | **Indicación de la medicación** | cardio, anticoag |
| **ARA2** | Indicación **12,5% (1/8)** · cardio 8,89% (4/45) · anticoag 3,85% (1/26) | **Indicación de la medicación** | cardio, anticoag |
| AINE | musculoesq **35,29% (6/17)** · Indicación 12,5% · anticoag 7,69% · renal 7,14% · GI 5,26% · cardio 4,44% | **Sistema musculoesquelético** | Indicación, cardio, anticoag, renal, GI |
| ANTAGONISTA_ALDOSTERONA | Indicación **12,5% (1/8)** · renal 7,14% · cardio 2,22% | **Indicación de la medicación** | cardio, renal |
| ANTIARITMICO | anticoag **3,85% (1/26)** · cardio 2,22% | **Anticoagulantes/Antiagregantes** | cardio |
| ANTIHIPERTENSIVO_CENTRAL | Riesgo caídas **7,14% (1/14)** · cardio 4,44% | **Riesgo de caídas** | cardio |
| CALCIOANTAGONISTA_NO_DHP | cardio **8,89% (4/45)** · anticoag 7,69% · SNC 5,26% · GI 5,26% | **Sistema cardiovascular** | anticoag, SNC, GI |
| CORTICOIDE_SISTEMICO | musculoesq **23,53% (4/17)** · resp 16,67% · cardio 2,22% | **Sistema musculoesquelético** | cardio, resp |
| DIURETICO_AHORRADOR_POTASIO | Indicación **12,5% (1/8)** · cardio 6,67% (3/45) | **Indicación de la medicación** | cardio |
| DIURETICO_ASA | Indicación **12,5% (1/8)** · cardio **11,11% (5/45)** | **Indicación de la medicación** | cardio |
| DIURETICO_TIAZIDICO | Indicación **12,5% (1/8)** · cardio 8,89% | **Indicación de la medicación** | cardio |
| ESTATINA | cardio **2,22% (1/45)** | **Sistema cardiovascular** | — |
| INHIBIDOR_PDE5 | Riesgo caídas **7,14% (1/14)** · cardio 4,44% | **Riesgo de caídas** | cardio |
| NEUROLEPTICO | carga anticolin **50% (1/2)** · SNC 13,16% · Riesgo caídas 7,14% · GI 5,26% · cardio 2,22% | **Carga antimuscarínica/anticolinérgica** | SNC, Riesgo caídas, GI, cardio |
| NITRATO | Riesgo caídas **7,14% (1/14)** · cardio 2,22% | **Riesgo de caídas** | cardio |
| PROLONGADOR_QTC | cardio **2,22% (1/45)** | **Sistema cardiovascular** | — |

#### Detalle criterios DIGOXINA (positivos)

| ID | Sistema | Clase detectada |
|---|---|---|
| STOPP-B1-DIGOXINA | cardiovascular | DIGOXINA |
| STOPP-B4-DIGOXINA-BLOQUEO-CARDIACO | cardiovascular | DIGOXINA |
| STOPP-B4-DIGOXINA-BRADICARDIA | cardiovascular | DIGOXINA |
| STOPP-B21-DIGOXINA-FA | cardiovascular | DIGOXINA |
| STOPP-D18-BETABLOQUEANTE-INTERACCION-FC | SNC | DIGOXINA (co-aparición) |
| STOPP-D18-DIGOXINA-INHIBIDORES-ACETILCOLINESTERASA | SNC | DIGOXINA |
| STOPP-E1-DIGOXINA-RENAL | renal | DIGOXINA (`digoxinaDosisAlta`) |

### C.3 Caso testigo — Digoxina

| Pregunta | Resultado simulación |
|---|---|
| ¿Sistema inicial = cardiovascular? | **Sí** (8,89% > 7,14% renal > 5,26% SNC) |
| ¿Aparecería como “relevante de otro sistema” en SNC/renal? | **Sí**, en esos tabs si la clase tuviera grupo visible |
| ¿Arregla el bug de UI actual? | **No por sí solo** — sigue siendo grupo unitario; hace falta cambio en Parte B |

### C.4 Clases problemáticas

#### Empates de %

Ningún empate exacto en máximo % entre sistemas para las clases analizadas. Casi-empates:

- **BETABLOQUEANTE:** cardio 8,89% vs endocrino 8,33% (gana cardio por poco).

#### Sistemas inesperados como “inicial”

| Clase | Tab taxonomía hoy | Sistema inicial simulado | Observación clínica |
|---|---|---|---|
| IECA, ARA2, DIURETICO_* | cardiovascular | **Indicación de la medicación** | Duplicados terapéuticos (operadores `multiple*`) pesan en sistema transversal pequeño (8 crit.) |
| ANTIARITMICO | cardiovascular | **anticoagulantes** | Solo 1 crit. en cada sitio; % muy bajo |
| NITRATO, INHIBIDOR_PDE5, ANTIHIPERTENSIVO_CENTRAL | cardiovascular | **Riesgo de caídas** | Criterios de caídas/hipotensión desplazan tab primario |
| NEUROLEPTICO, ANTIDEPRESIVO_TRICICLICO | snc | **Carga antimuscarínica** | Sistema con solo **2** criterios → 1 hit = **50%** |
| AINE | osteo (+ additionalCategories cardio) | **osteo** | Coherente con taxonomía primaria, pero cardio pasa a “otro sistema” |
| ESTATINA | endocrino | **cardiovascular** | Inverso: simulación mueve primario a cardio |

#### Clases transversales (`*` en `SYSTEM_TO_TABS`)

**Comportamiento actual:** un criterio `"Analgésicos"` hace que la clase aparezca en **todos** los tabs (`buildRelevance` + `allTabIds`).

**Comportamiento simulado:** `"Analgésicos"` es un **sistema más** en el denominador (9 criterios). No expande a todos los tabs; solo compite por %.

Efectos:

- **Indicación de la medicación** (8 crit.) y **Carga antimuscarínica** (2 crit.) actúan como “imanes” de tab primario por denominadores pequeños.
- Clases muy usadas en criterios transversales (AINE, ISRS, BZD…) **dejan de estar en todos los tabs** y pasan a 1 tab primario + apariciones secundarias.
- **Riesgo de ruptura UX:** hoy el clínico ve AINE como relevante en cardiovascular vía expansión transversal; en el diseño nuevo solo estaría en musculoesquelético como primario (35,29%) y en cardio como secundario (4,44%).

### C.5 Diferencias con el sistema actual

Comparación: **tab primario en taxonomía** (`medications-taxonomy.ts`, primera aparición de `drugClass`) vs **tab del sistema inicial simulado** (mapeo `SYSTEM_TO_TABS`).

**29 clases** cambiarían de tab primario.

#### Movimientos desde cardiovascular (taxonomía → simulación)

| Clase | Hoy (taxonomía) | Simulación (tab primario) | ¿Sospechoso clínicamente? |
|---|---|---|---|
| ANTAGONISTA_ALDOSTERONA | cardiovascular | Indicación medicación | **Sí** — fármaco cardiorrenal, duplicados en Indicación |
| ANTIARITMICO | cardiovascular | anticoagulantes | **Sí** |
| ANTIHIPERTENSIVO_CENTRAL | cardiovascular | Riesgo de caídas | **Dudoso** — también criterios HTA en cardio |
| ARA2 | cardiovascular | Indicación medicación | **Sí** |
| DIURETICO_ASA | cardiovascular | Indicación medicación | **Sí** — aunque 5/45 crit. cardio (11,11%) es alto en absoluto |
| DIURETICO_TIAZIDICO | cardiovascular | Indicación medicación | **Sí** |
| IECA | cardiovascular | Indicación medicación | **Sí** |
| NITRATO | cardiovascular | Riesgo de caídas | **Sí** |
| DIGOXINA | cardiovascular | cardiovascular | **No** — coincide |
| BETABLOQUEANTE | cardiovascular | cardiovascular | **No** |
| ESTATINA | endocrino | cardiovascular | **Dudoso** — hoy en endocrino con cross-tag manual |

#### Otros movimientos notables (fuera de cardio)

| Clase | Hoy | Simulado | ¿Sospechoso? |
|---|---|---|---|
| NEUROLEPTICO | snc | Carga antimuscarínica | **Sí** (denominador 2) |
| ISRS | snc | Indicación medicación | **Sí** |
| BENZODIACEPINA | snc | respiratorio | **Sí** |
| OPIOIDE, GABAPENTINOIDE | snc | Analgésicos | Razonable |
| ISGLT2 | cardiovascular | endocrino | **Dudoso** (crit. cardio de IC/diabetes) |
| INHIBIDOR_PDE5 | urologico | Riesgo de caídas | **Sí** (urología vs hipotensión) |

#### Qué NO cambia el diseño nuevo sin trabajo adicional

- **Visibilidad unitaria** (Digoxina seguiría oculta en cardio con filtro actual).
- **Campo `additionalCategories`** (sigue sin uso).
- **Negación en relevancia actual** vs simulación (actual incluye clases negadas; simulación no).

---

## ASUNCIONES y casos ambiguos

| Tema | Decisión en este análisis | Incertidumbre |
|---|---|---|
| Clases negadas (`!`) | **No cuentan** en simulación (Parte C) | El motor **actual sí las cuenta** (`system-relevance.spec.ts:76-80`) |
| `excludes` | **No cuentan** (no están en `logic`) | Confirmado en código |
| Operadores `multiple*` | Cuentan como disparador de la clase mapeada | Lista tomada de `criteria-engine.service.ts:245-254`; si se añade operador nuevo, hay que mapearlo |
| `digoxinaDosisAlta` | Cuenta como `DIGOXINA` | No usa `inDrugClass` en JSON |
| Empates de % | Listar todos los sistemas empatados | No hubo empates exactos en datos actuales |
| Sistemas transversales → tab | Simulación usa **nombre de sistema**, no expansión a `*` | En implementación real habría que decidir tab(s) para Indicación/Analgésicos/etc. |
| Tab primario “hoy” | Primera categoría en taxonomía donde aparece la clase | Grupos duplicados (IECA en cardio y renal) comparten clase; primario = primera aparición en archivo |
| Conteo de criterios | 232 entradas en `criteria.json` | No verificado contra documentación “225 criterios” de `motor-criterios.md` |
| `additionalCategories` | Tratado como **intención no implementada** | No hay otro consumidor en `src/` |

---

## Referencias de código (índice rápido)

| Concepto | Ubicación |
|---|---|
| Mapa sistema → tabs | `src/app/core/data/system-relevance.ts:22-36` |
| Construcción índice relevancia | `src/app/core/data/system-relevance.ts:101-125` |
| Extracción referencias (sin negación) | `src/app/core/data/system-relevance.ts:53-76` |
| Carga + signal relevance | `src/app/core/services/criteria-engine.service.ts:44-53` |
| Buckets own / foreign / otros | `src/app/core/group-visibility.ts:24-68` |
| UI bucket foráneo | `src/app/steps/meds-step.component.html:179-191` |
| Taxonomía manual + additionalCategories | `src/app/core/data/medications-taxonomy.ts:28-178` |
| Documentación flujo | `docs/flujo-pasos.md:59-65, 110-112` |
