# Análisis de arquitectura y salud del proyecto

> Fecha: 2026-07-08 · Solo lectura, sin cambios de código.
> Todo lo verificado lleva fichero:línea. Lo no confirmado va marcado como **ASUNCIÓN**.
> Los datos cuantitativos provienen de scripts de solo lectura ejecutados sobre
> `criteria.json`, `medications.ts` y `medications-taxonomy.ts` (réplica exacta de
> `buildRelevance` + `computeMedGroupBuckets`).

---

# PARTE 1 — Criterios y ubicación de medicaciones

## 1a. Cómo están cableados los criterios

### Estructura de un criterio (`src/assets/data/criteria.json`)

```json
{
  "id": "STOPP-B1-DIGOXINA",
  "type": "STOPP",
  "system": "Sistema cardiovascular",
  "summary": "Evitar digoxina en pacientes con...",
  "logic": { "and": [ {"inDrugClass":["DIGOXINA",{"var":"medications"}]},
                      {"in":["ic_funcion_sistolica_conservada",{"var":"diagnoses"}]} ] },
  "excludes": { "medications": ["Digoxina"], "drugClasses": ["DIGOXINA"] }
}
```

Datos medidos (script sobre el JSON real):

- **222 criterios**: 173 STOPP, 49 START. Sin campo `version` en el fichero.
- **13 valores de `system`** (los 13 tienen entrada en `SYSTEM_TO_TABS`, verificado).
- **0 IDs duplicados** hoy — pero nada lo valida en carga ni en test (ver riesgos).
- **50 criterios sin `excludes`**, 0 sin `logic`.
- Operadores usados en las `logic`: los estándar de json-logic (`and`, `or`, `!`,
  `in`, `<`, `>=`, `==`, `!=`, `var`) + **12 custom**: `inDrugClass`,
  `digoxinaDosisAlta`, `egfrBelow` y 10 `multiple*`.
- Rutas `var` usadas: `medications`, `diagnoses`, `info.age`, `info.sex` y 9 campos
  de `labs.*` — el contrato implícito con `PatientCase` (`src/app/core/types.ts:62`).

El tipo `Crit` está en `src/app/core/types.ts:26-36`. `logic` es
`Record<string, unknown>` (`JsonLogicRule`, `types.ts:6`): **no hay ningún esquema**
que valide la forma del JSON.

### Carga y evaluación (`src/app/core/services/criteria-engine.service.ts`)

- **Carga** (`loadCriteria`, líneas 44-60): `HttpClient.get<CriteriaFile>` con
  cache-buster `?v=${Date.now()}` (línea 46) — anula la caché HTTP en cada arranque,
  también en producción. El resultado se castea al tipo sin validación runtime.
  Tras cargar, dispara los dos índices derivados: `buildRelevance` (línea 51) y
  `buildDxDependencies` (línea 52). Si falla, resetea la promesa cacheada; el error
  se propaga al llamador (no hay UI de error verificada aquí).
- **Evaluación** (`evaluate`, líneas 102-111): normaliza el caso a minúsculas
  (`normalizeCase`, 65-80), **clona en profundidad cada criterio con
  `JSON.parse(JSON.stringify(...))` en cada evaluación** (`normalizeCriterion`,
  82-86) y evalúa con `jsonLogic.apply` dentro de try/catch: **un criterio con
  lógica rota devuelve `false` en silencio** con un `console.error` (líneas
  178-186). En la UI `applicableCriteria` es un `computed` que reevalúa los 222
  criterios ante cualquier cambio de meds/dx/labs
  (`meds-step.component.ts:61-68`).
- **Operadores custom** (`registerCustomOperators`, líneas 191-255): registrados en
  el **constructor** del servicio vía `jsonLogic.add_operation` — registro global
  del módulo `json-logic-js`, no del inyector.
  - `inDrugClass` (206): la primitiva principal; es la ÚNICA vía por la que
    `extractReferences` "ve" clases (ver 1b).
  - `digoxinaDosisAlta` (213-220): hardcodea clase `digoxina`, umbral 125 µg/día y
    90 días sobre `Med.doseMcgDay`/`durationDays`.
  - `egfrBelow` (228-243): unifica analítica y diagnóstico, hardcodeando los
    códigos `enfermedad_renal_grave` y `insuficiencia_renal_terminal` y sus
    equivalencias numéricas (<30, <15) **en código**, no en datos.
  - 10 `multiple*` (245-254): una operación por clase con la clase **hardcodeada en
    minúsculas** (`aine`, `isrs`, `antiagregante`...). Añadir una duplicidad nueva
    exige tocar el engine y registrar el operador; no es data-driven.

### Riesgos concretos de este diseño (para cuando cambie el PDF oficial)

1. **Sin validación del JSON en la frontera de confianza.**
   `http.get<CriteriaFile>` (`criteria-engine.service.ts:48`) castea sin schema.
   Un typo estructural (p. ej. `"logics"` en vez de `"logic"`) hace que el criterio
   nunca dispare, sin error visible. Contradice el principio "schema-first at trust
   boundaries" del propio CLAUDE.md. No hay chequeo de IDs duplicados: hoy hay 0,
   pero un duplicado pasaría silenciosamente (el panel mostraría dos entradas y
   `lastCriterionId`/`Set` de `meds-step.component.ts:117-125` los colapsaría).

2. **Un `system` desconocido se descarta en silencio.**
   `resolveTabsForSystem` devuelve `[]` y `buildRelevance` hace `continue`
   (`system-relevance.ts:52-53,117-118`). Si el STOPP/START v4 renombra o añade una
   sección ("Sistema hepático", un typo "Sistema Cardiovascular"), sus criterios
   evalúan y se muestran en el panel (agrupados por el string tal cual,
   `criteria-groups.ts:7-18`) pero **desaparecen de toda la relevancia de tabs**
   sin ningún aviso. `SYSTEM_TO_TABS` es un mapa manual sin test de exhaustividad
   contra los `system` reales del JSON (el spec `system-relevance.spec.ts` existe,
   pero no valida esa exhaustividad — verificado que los 13 actuales sí casan).

3. **Los operadores custom sortean la extracción de referencias.**
   `extractReferences` solo reconoce los patrones `inDrugClass` y
   `in [..., {"var":"diagnoses"}]` (`system-relevance.ts:60-83`). Consecuencias
   medidas:
   - Los 8 criterios `STOPP-A3-*-DUPLICIDAD` (solo `multiple*`) y los que usan
     `multipleANTICOLINERGICOS`/`digoxinaDosisAlta` sin `inDrugClass` acompañante
     aportan **cero** a la relevancia (en `buildRelevance` entra por
     `refs.classes.size === 0` → `continue`, línea 121).
   - Lo mismo aplica a `buildDxDependencies` (`dx-dependencies.ts:21-43`), que ya
     necesitó un fichero de **overrides manuales**
     (`dx-dependencies-overrides.ts`, 13 entradas) para compensar exactamente esto
     (sus comentarios lo documentan: "venían solo de excludes", líneas 80, 87).
   - Un criterio futuro escrito con un operador nuevo repite el problema sin que
     nada lo detecte.

4. **`summary` es texto libre sin vínculo con la `logic`.** Nada impide que el
   texto diga "dos AINEs" y la lógica compruebe otra cosa. Además hay **triple
   redundancia** por criterio: la `logic`, el `summary` y el bloque `excludes`
   (que duplica fármacos por nombre Y por clase, p. ej. `criteria.json:9`).
   `getExcludedMedications` busca cada nombre de `excludes.medications` en
   `MEDICATIONS` por `id` y **omite en silencio los que no matchean**
   (`criteria-engine.service.ts:133-134`). Al actualizar criterios hay que
   mantener las tres representaciones a mano.

5. **Los códigos de diagnóstico en las `logic` son strings por convención.**
   El paciente se normaliza a minúsculas (`normalizeCase`, línea 69) pero el lado
   del criterio NO: `normalizeLogic` (líneas 88-97) solo baja a minúsculas los
   valores de claves `drug_class` y `diagnosis`, que aparecen **0 veces** en
   criteria.json (verificado por grep) — **es código muerto**. Que
   `"in":["ic_nyha_3_4",...]` funcione depende de que el autor del JSON escriba el
   slug ya en minúsculas. Un `"Fibrilacion_Auricular"` no matchearía nunca y nada
   lo avisaría.

6. **El formato del ID es un contrato implícito.** `critCode` hace
   `id.split('-')[1]` (`criteria-groups.ts:20-22`) para pintar el badge "B1".
   Un ID que no siga `TIPO-CODIGO-RESTO` rompe el rotulado sin error.

7. **Coste de clonado por evaluación.** `normalizeCriterion` hace deep-clone de
   los 222 criterios en cada reevaluación (cada click de checkbox), y
   `getExcludedMedications` reevalúa cada criterio con probe por cada medicación
   excluida (O(criterios × fármacos excluidos)). Con el volumen actual es
   irrelevante; **ASUNCIÓN**: podría notarse si el catálogo crece un orden de
   magnitud (no medido).

## 1b. Por qué una medicación es "principal" en un sistema y no en otro

### Las tres capas, con su fuente de verdad

| Capa | Fichero | ¿Manual o derivada? |
|---|---|---|
| **Relevancia** (qué clases importan por tab) | `src/app/core/data/system-relevance.ts` | **Híbrida**: los sets de clases se DERIVAN de criteria.json; el enrutado system→tabs es un mapa MANUAL (`SYSTEM_TO_TABS`, líneas 22-36) |
| **Ubicación** (dónde "vive" cada grupo) | `src/app/core/data/medications-taxonomy.ts` (`RAW_DRUG_CATEGORIES`, líneas 28-178) | **Manual** al 100 % en la estructura (10 categorías, 87 grupos); la MEMBRESÍA de cada grupo sí se deriva de `medications.ts` vía `byClass()` (líneas 23-26) |
| **Visibilidad** (qué se muestra en cada tab) | `src/app/core/group-visibility.ts` (`computeMedGroupBuckets`, líneas 42-94) | **Derivada** en runtime de las dos anteriores |

**Capa 1 — Relevancia.** `buildRelevance` (`system-relevance.ts:108-139`) recorre
criteria.json y, por cada criterio, extrae clases (`inDrugClass`) y códigos dx
(`in` sobre `diagnoses`) y los apunta a los tabs que dicta `SYSTEM_TO_TABS`.
Produce dos mapas: `classesByTab` (incluye la expansión de los 4 sistemas
transversales `*` a TODOS los tabs — Analgésicos, Riesgo de caídas,
Anticolinérgicos, Indicación) y `specificClassesByTab` (solo asignación no
transversal). Lo único manual aquí es `SYSTEM_TO_TABS`; nótese que mezcla tabs de
medicaciones (`snc`, `osteo`, `anticoagulantes`) y de diagnósticos (`neurologico`,
`reumatologico`, `hematologico`) en un mismo espacio de claves — los consumidores
filtran por los tabs que conocen.

**Capa 2 — Ubicación.** `RAW_DRUG_CATEGORIES` declara a mano cada categoría (tab),
cada grupo con su `label`/`fullName`, y el `drugClass` que lo puebla. Los tabs de
la UI de medicaciones son exactamente estas categorías + un tab sintético "Otros"
(`meds-step.component.ts:40-43`). Dos detalles importantes:

- **`additionalCategories` es una capa manual MUERTA.** Se declara en la interfaz
  (`medications-taxonomy.ts:13`) y se rellena en 17 grupos (grep: todas las
  ocurrencias están en el propio fichero), pero **ningún código la consume** — ni
  `group-visibility.ts` ni los componentes. Es el vestigio del mecanismo manual de
  "mostrar también en cardiovascular" que la relevancia derivada sustituyó
  (commits `fea4420`/`42533e1`). Hoy solo confunde: sugiere que editarla cambia
  algo, y no cambia nada.
- Un mismo grupo puede estar declarado dos veces como "propio" en dos categorías
  (p. ej. `diur_asa` en `cardiovascular:36` y `renal:90`; `isglt2` en tres:
  líneas 46, 94, 134; `corticoide_sist` en `respiratorio:119` y `endocrino:132`).
  La duplicación es a mano, no un mecanismo.

**Capa 3 — Visibilidad.** `computeMedGroupBuckets` decide por tab:

- **Propios** (`ownAll`, línea 71): los grupos de la categoría del tab con **más de
  1 fármaco siempre**, y los **unitarios solo si** su clase está en
  `specificClassesByTab` del tab. Es decir: *un grupo unitario puede estar oculto
  en su propio tab* si ningún criterio de ese sistema lo cita.
- **Foráneos** (`foreignRelevant`, líneas 79-91): grupos de otras categorías cuya
  clase es relevante aquí — los multi-fármaco entran con la relevancia completa
  (transversal incluida, `fullClasses`, línea 83), los unitarios solo con la
  específica.
- **Tab "Otros"** (líneas 48-63): recoge los fármacos de grupos unitarios que no
  afloran por relevancia específica **en ningún tab**.

### Comportamiento emergente medido (réplica exacta del algoritmo, datos reales)

- **7 fármacos viven hoy solo en "Otros"** porque su grupo es unitario y su clase
  no es específicamente relevante en ningún tab: Memantina (`ANTIDEMENCIA`), Litio
  (`ESTABILIZADOR_ANIMO`), Ondansetrón (`ANTIEMETICO_5HT3`), Hioscina
  (`ANTIESPASMÓDICO`), Tizanidina (`RELAJANTE_MUSCULAR`), Paracetamol
  (`ANALGESICO_SIMPLE`), Nitrofurantoína (`ANTIBIOTICO_URINARIO`). Varios de estos
  grupos tienen `additionalCategories: ['cardiovascular']` que no hace nada, y
  varios de sus fármacos SÍ disparan criterios vía otra clase (Litio y Ondansetrón
  son `PROLONGADOR_QTC` en `medications.ts`) — el usuario debe encontrarlos en
  "Otros".
- **3 grupos están ocultos en su tab "propio" pero afloran como foráneos en otro**:
  Colchicina (declarada en `osteo:158`, visible solo en `renal`), Biguanidas
  (declarada en `endocrino:128`, visible solo en `renal`), Ácido fólico
  (declarado en `endocrino:133`, visible solo en `osteo`). La "ubicación" declarada
  y la ubicación efectiva ya divergen hoy.
- **La expansión transversal infla los buckets foráneos**: entre 10 y 20 grupos
  foráneos por tab; Benzodiacepinas, Opioides, Neurolépticos, Laxantes,
  Antihistamínicos aparecen como foráneos en prácticamente TODOS los tabs
  (incluido `antibioticos`) porque los sistemas `*` (caídas, analgésicos,
  anticolinérgicos, indicación) llegan a todos. **ASUNCIÓN**: que esto sea ruido o
  señal es una decisión clínica; el dato objetivo es el volumen.

### ¿Qué se actualiza solo y qué hay que tocar a mano?

Si mañana un criterio nuevo cita `inDrugClass: ["X", ...]` bajo `system: S`:

| Condición | ¿Automático? |
|---|---|
| `S` existe en `SYSTEM_TO_TABS` | Sí → relevancia y visibilidad se actualizan solas (afloramiento foráneo + promoción de unitarios). |
| `S` es nuevo o tiene un typo | **No** — hay que añadirlo a mano en `system-relevance.ts:22-36`; si no, el criterio es invisible para la relevancia (fallo silencioso). |
| Algún grupo de `RAW_DRUG_CATEGORIES` tiene `drugClass: 'X'` | Sí → ese grupo aflora donde toque. |
| Ninguna categoría tiene un grupo con clase `X` | **No** — hoy hay **24 clases citadas por criterios sin grupo en la taxonomía** (`AAS`, `ANTICOAGULANTE`, `PSICOTROPICO`, `PROLONGADOR_QTC`, `FENOTIAZINA`, `BETABLOQUEANTE_CARDIOSELECTIVO`, `ESTROGENO`, `OPIOIDE_LP`…). Parte son subclases/marcadores intencionales (sus fármacos se alcanzan por otro grupo), pero el mecanismo no distingue lo intencional de lo olvidado. |
| Los fármacos llevan la clase `X` en `medications.ts` | Requisito previo manual: la membresía se deriva de ahí (`byClass`). |
| El criterio usa un operador custom en vez de `inDrugClass` | **No se actualiza nada** (riesgo 3 de 1a) y probablemente haya que añadir un override en `dx-dependencies-overrides.ts`. |

**Ficheros que se tocan a mano hoy ante un cambio de criterios**, en orden típico:
1. `src/assets/data/criteria.json` (el criterio).
2. `src/app/core/data/medications.ts` (fármacos/clases nuevos).
3. `src/app/core/data/medications-taxonomy.ts` (grupo nuevo o cambio de "casa").
4. `src/app/core/data/system-relevance.ts` (solo si aparece un `system` nuevo).
5. `src/app/core/services/criteria-engine.service.ts` (solo si hace falta operador).
6. `src/app/core/data/dx-dependencies-overrides.ts` (si el gating derivado no basta).
7. Los `docs/*.md` enlazados por convención `@linked` en las cabeceras.

**Acoplamiento**: la clave de join entre las tres capas es el **string de clase**
(`drugClass`), repetido en 4 ficheros con manejo de mayúsculas ad hoc (taxonomía y
criteria.json en MAYÚSCULAS, engine normalizando a minúsculas, los `multiple*`
hardcodeados ya en minúsculas). No hay un catálogo central de clases: la clase
"existe" por aparición simultánea en `medications.ts`, la taxonomía y criteria.json,
y nada verifica la coherencia entre los tres.

### Opciones para derivar la ubicación (coste, sin elegir)

1. **Catálogo central de clases** — un fichero `drug-classes.ts` (o sección en
   criteria.json) con `clase → {homeTab, label, fullName, esMarcador}` y generar
   `RAW_DRUG_CATEGORIES` desde él. Coste: medio. Migrar 87 grupos y sus labels
   curados; resuelve también las 24 clases sin grupo (declarando cuáles son
   marcadores). La visibilidad no cambia. Es el único que elimina la triple
   declaración del string de clase.
2. **Derivar la "casa" de la relevancia específica dominante** — el tab propio de
   una clase = el tab donde más criterios la citan, con overrides para empates
   (p. ej. `DIURETICO_ASA` se cita en cardiovascular y renal). Coste: bajo en
   código, alto en sorpresas: la casa cambiaría al editar criterios (hoy Colchicina
   "se mudaría" a renal), y los labels/fullName seguirían necesitando un mapa
   manual, con lo que no se elimina la taxonomía, solo su campo categoría.
3. **No derivar: validar** — mantener la taxonomía manual pero añadir un test de
   consistencia que cruce criteria.json ↔ taxonomía ↔ medications.ts (clases sin
   grupo no declaradas como marcador, systems sin mapeo, grupos unitarios ocultos
   en su propio tab, `additionalCategories` muerta). Coste: bajo (un spec). No
   reduce el trabajo manual, pero convierte todos los fallos silenciosos de la
   tabla anterior en fallos de test.

---

# PARTE 2 — Salud general del proyecto

> Análisis realizado por un subagente independiente cruzando IDs entre
> `criteria.json` (222 criterios), los catálogos y la UI con scripts de solo
> lectura. Donde un hallazgo solapa con la Parte 1 se indica.

## Severidad Alta

### H1. `STOPP-E1-DIGOXINA-RENAL` nunca puede dispararse desde la UI
- **Dónde**: `criteria-engine.service.ts:213-220` (operador `digoxinaDosisAlta`),
  `meds-step.component.ts:228-231` (`toggleDrug`/`toggleOtro`), `types.ts:22-23`.
- **Qué**: el operador exige `doseMcgDay >= 125` **y** `durationDays > 90`, pero
  la UI crea las medicaciones como `{ id, drugClasses }` sin dosis ni duración
  (verificado por grep: esos campos solo existen en `types.ts`, el motor y los
  specs). La Digoxina seleccionada lleva ambos `undefined` → el operador devuelve
  siempre `false`.
- **Por qué importa**: falso negativo clínico **permanente** (digoxina a dosis alta
  en insuficiencia renal jamás alerta, salvo importando un JSON fabricado a mano).
  Los tests del motor no lo detectan porque construyen `Med` con dosis.

### H2. Diagnósticos seleccionables que no disparan ningún criterio
- **Dónde**: `diagnoses.ts:21/246` (`aneurisma_aortico`) y `diagnoses.ts:137/362`
  (`prostatismo_retencion_urinaria`).
- **Qué**: cruzados todos los IDs de diagnóstico de `criteria.json` contra
  `DIAGNOSIS_MAP`, dos opciones de la UI no aparecen en ningún criterio:
  - `aneurisma_aortico` (tab Cardiovascular): ausente por completo de criteria.json.
  - `prostatismo_retencion_urinaria`: los criterios usan `prostatismo` y
    `retencion_urinaria` **por separado** (que también son opciones propias); la
    entrada combinada mapea a un ID huérfano. Hay tres entradas visibles y solo dos
    activan criterios.
- **Por qué importa**: el clínico marca el diagnóstico creyendo registrarlo y el
  motor lo ignora en silencio.

## Severidad Media

### M1. Relevancia ciega a operadores custom + doble walker sin fuente única
- **Dónde**: `system-relevance.ts:60-89` y `meds-step.component.ts:287-303`
  (`extractInDrugClasses`) — dos implementaciones paralelas del mismo walk; el mapa
  operador→clase vive solo en `criteria-engine.service.ts:245-254`.
- **Qué**: confirmado que 9 criterios (`STOPP-A3-*-DUPLICIDAD`,
  `STOPP-A3-DIURETICO-ASA`, `STOPP-A3-TIAZIDA`, `STOPP-E1-DIGOXINA-RENAL`) aportan
  **cero** al índice de relevancia. Efecto medible: `DIGOXINA` no queda marcada
  como relevante para el tab `renal` pese a que STOPP-E1 es un criterio de
  "Sistema renal" sobre digoxina. (Es la confirmación con datos del riesgo 3 de la
  Parte 1a, más el agravante del walker duplicado en `meds-step`.)
- **Por qué importa**: conocimiento operador→clase triplicado implícitamente; ya
  obligó a crear `dx-dependencies-overrides.ts` como parche manual.

### M2. Fallo de carga de `criteria.json` sin feedback al usuario
- **Dónde**: `meds-step.component.ts:191-195` y `diagnosis-step.component.ts:181`.
- **Qué**: `ngOnInit` hace `await loadCriteria()` sin try/catch. Si el fetch falla
  (offline, 404 tras despliegue), el signal `criteria` queda vacío y la app muestra
  el mismo estado que "paciente sin alertas". `onFileLoad` sí maneja errores; esto no.
- **Por qué importa**: "0 criterios" por fallo técnico es indistinguible de "0
  criterios" clínico — el peor modo de fallo posible para una herramienta de cribado.

### M3. Fármacos seleccionables sin ningún criterio asociado
- **Dónde**: `medications.ts` — dihidropiridinas (`CALCIOANTAGONISTA_DHP`:
  Amlodipino, Nifedipino, Lercanidipino, Nitrendipino, Felodipino) y `CALCIO`
  (Carbonato/Citrato cálcico).
- **Qué**: 7 de 244 fármacos tienen clases que ningún criterio referencia (ni en
  `logic` ni en `excludes`). **ASUNCIÓN**: puede ser intencional (no hay STOPP v3
  para DHP), pero no está documentado como tal.
- **Por qué importa**: entrada de datos inerte, misma categoría de problema que H2.

### M4. `excludes.medications` cita fármacos que no existen en el catálogo
- **Dónde**: `criteria.json` (`STOPP-A3-ISRS-DUPLICIDAD`, `STOPP-C12-…`,
  `STOPP-D7-…`) vs `medications.ts` (solo Sertralina y Fluoxetina como ISRS).
- **Qué**: `"Fluvoxamina"` y `"Paroxetina"` no existen en `MEDICATIONS`;
  `getExcludedMedications` los omite en silencio (`criteria-engine.service.ts:133-134`).
- **Por qué importa**: evidencia de que criteria.json y el catálogo ya divergieron
  sin que nada lo avisara (el fallo silencioso descrito en Parte 1a, riesgo 4).

### M5. Validación de import casi vacua (`isLabs`, versión no comprobada)
- **Dónde**: `case-io.service.ts:16-23`.
- **Qué**: `isLabs` solo exige que los valores sean `number|null` (un `{}` pasa;
  claves arbitrarias también); `isPatientCase` no valida `info` ni el contenido de
  `diagnoses`. `EXPORT_VERSION` se escribe al exportar pero **nunca se compara** al
  importar.
- **Por qué importa**: frontera de confianza débil en el único punto de entrada de
  datos externos, en contradicción con el "schema-first" del CLAUDE.md.

## Severidad Baja

### B1. Rama muerta en `normalizeLogic` — `criteria-engine.service.ts:88-97`.
Claves `drug_class`/`diagnosis` que aparecen 0 veces en criteria.json (coincide con
Parte 1a, riesgo 5: código muerto que sugiere una convención que ya no existe).

### B2. `collapsedSections` no se persiste — `case-store.service.ts:17,106`.
Único signal del estado que ni se carga en el constructor ni tiene effect de
persistencia; se pierde al recargar, a diferencia de sus hermanos.

### B3. Clonado profundo de 222 criterios por evaluación —
`criteria-engine.service.ts:82-86,108-110`. Trabajo redundante en cada pulsación
(la normalización es determinista y cacheable). Impacto real hoy: bajo.

### B4. Cache-bust permanente — `criteria-engine.service.ts:46`.
`?v=${Date.now()}` fuerza descarga de criteria.json en cada arranque, también en
producción.

### B5. Piezas sin spec pese al mandato TDD — sin `.spec.ts`:
`display-options-dialog.component.ts`, `quick-guide-dialog.component.ts`,
`shared/tooltip.directive.ts` (esta última con lógica de posicionamiento). En
positivo: 0 usos de `any` en producción y 581 `it()` en 28 specs.

> Verificaciones negativas del cruce (dirección inversa limpia): no hay IDs de
> diagnóstico usados en `logic` inalcanzables desde la UI, no hay criterios con ID
> duplicado, y `DIAGNOSIS_MAP`/`DIAGNOSIS_GROUPS` coinciden (132 claves).

---

# Cierre

## Recuento de hallazgos

- **Alta: 2** (H1 digoxina inactivable desde la UI; H2 diagnósticos huérfanos).
- **Media: 5** (M1 relevancia ciega a operadores custom; M2 carga sin feedback;
  M3 fármacos inertes; M4 excludes con fármacos inexistentes; M5 import sin
  validación real).
- **Baja: 5** (B1 código muerto; B2 signal no persistido; B3 clonado redundante;
  B4 cache-bust; B5 piezas sin spec).
- Además, la Parte 1 documenta los riesgos estructurales (no contados arriba):
  el mapa manual `SYSTEM_TO_TABS` sin validación de exhaustividad, la capa
  `additionalCategories` muerta, las 24 clases citadas sin grupo, los 7 fármacos
  degradados a "Otros" y los 3 grupos ocultos en su propio tab.

## Las 3 cosas que yo arreglaría primero

1. **Un spec de consistencia cruzada criteria.json ↔ catálogos ↔ taxonomía**
   (opción 3 de la Parte 1). Es un solo fichero de test y convierte en fallo de
   test la mayoría de los fallos silenciosos de este informe: H2, M3, M4, las 24
   clases sin grupo, un `system` nuevo sin mapear y la capa muerta. Máxima
   palanca por coste mínimo, y protege exactamente el escenario "el PDF cambia
   dentro de unos años".
2. **H1 (digoxina)**: o la UI captura dosis/duración o el criterio se reescribe
   sin ellas — hoy es un criterio STOPP clínicamente relevante que es imposible
   activar, en una app cuyo propósito es precisamente no callarse esas alertas.
3. **M2 (carga de criterios sin manejo de error)**: distinguir "no hay criterios
   activados" de "no se pudieron cargar los criterios" es barato (un try/catch y
   un estado de error) y elimina el modo de fallo más peligroso de la app.

