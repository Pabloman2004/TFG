# Auditoria del sistema cardiovascular STOPP/START

## 1. Mapa del sistema

Nota previa: en `criteria.json` no existe ningun criterio con `system == "cardiovascular"` literal. El sistema real implementado para el tab cardiovascular se resuelve mediante `SYSTEM_TO_TABS`: `"Sistema cardiovascular"` -> `cardiovascular` (`src/app/core/data/system-relevance.ts:22-46`). Ademas, sistemas transversales como `"Analgésicos"` se expanden a todos los tabs, y `"Anticoagulantes/Antiagregantes"` NO se mapea al tab cardiovascular.

Hipotesis verificada: las opciones no se derivan de una unica fuente de verdad clinica. Las medicaciones salen de `DRUG_CATEGORIES` y de `relevance.classesByTab`; los diagnosticos salen de `DIAGNOSIS_GROUPS`, `DIAGNOSIS_SUBGROUPS`, `relevance.dxsByTab` y `dx-dependencies`/overrides. Esto permite divergencias entre opciones y criterios.

### Criterios reales con `system: "Sistema cardiovascular"`

| id | tipo | resumen corto |
|---|---|---|
| STOPP-B1-DIGOXINA | STOPP | Digoxina en IC con funcion sistolica conservada |
| STOPP-B2-VERAPAMILO-IC-NYHA | STOPP | Verapamilo/diltiazem en IC NYHA III-IV |
| STOPP-B3-VERAPAMILO-BETABLOQUEANTES | STOPP | Verapamilo/diltiazem con betabloqueantes |
| STOPP-B4-BETABLOQUEANTE-BRADICARDIA | STOPP | Betabloqueantes con bradicardia |
| STOPP-B4-DIGOXINA-BLOQUEO-CARDIACO | STOPP | Digoxina con bloqueo AV |
| STOPP-B4-DIGOXINA-BRADICARDIA | STOPP | Digoxina con bradicardia |
| STOPP-B4-VERAPAMILO-BLOQUEO-CARDIACO | STOPP | Verapamilo/diltiazem con bloqueo AV |
| STOPP-B4-VERAPAMILO-BRADICARDIA | STOPP | Verapamilo/diltiazem con bradicardia |
| STOPP-B5-BETABLOQUEANTE-HTA-NO-COMPLICADA | STOPP | Betabloqueantes en HTA no complicada |
| STOPP-B6-AMIODARONA-TAQUIARRITMIA-PRIMERA-LINEA | STOPP | Amiodarona como primera linea en TSV |
| STOPP-B7-DIURETICO-ASA-PRIMERA-LINEA-HTA | STOPP | Diuretico de asa como primera linea en HTA |
| STOPP-B8-DIURETICO-ASA-EDEMAS-MALEOLARES | STOPP | Diuretico de asa para edemas maleolares sin causa |
| STOPP-B9-TIAZIDA-GOTA | STOPP | Tiazida con gota |
| STOPP-B9-TIAZIDA-HIPERCALCEMIA | STOPP | Tiazida con hipercalcemia |
| STOPP-B9-TIAZIDA-HIPONATREMIA | STOPP | Tiazida con hiponatremia |
| STOPP-B9-TIAZIDA-HIPOPOTASEMIA | STOPP | Tiazida con hipopotasemia |
| STOPP-B10-DIURETICO-ASA-INCONTINENCIA | STOPP | Diuretico de asa para HTA con incontinencia |
| STOPP-B11-ANTIHIPERTENSIVO-CENTRAL-ANCIANOS | STOPP | Antihipertensivo central en mayor con HTA salvo intolerancia |
| STOPP-B12-ARA2-HIPERPOTASEMIA | STOPP | ARA-II con hiperpotasemia |
| STOPP-B12-IECA-HIPERPOTASEMIA | STOPP | IECA con hiperpotasemia |
| STOPP-B13-ANTAGONISTA-ALDOSTERONA-IECA-ARA2-POTASIO | STOPP | Antagonista aldosterona con IECA/ARA-II/ahorrador K |
| STOPP-B13-ARA2-ANTAGONISTA-ALDOSTERONA | STOPP | ARA-II con antagonista aldosterona |
| STOPP-B13-ARA2-DIURETICO-AHORRADOR-POTASIO | STOPP | ARA-II con ahorrador de potasio |
| STOPP-B13-DIURETICO-AHORRADOR-POTASIO-ANTAGONISTA | STOPP | Ahorrador K con antagonista aldosterona |
| STOPP-B13-IECA-ANTAGONISTA-ALDOSTERONA | STOPP | IECA con antagonista aldosterona |
| STOPP-B13-IECA-DIURETICO-AHORRADOR-POTASIO | STOPP | IECA con ahorrador de potasio |
| STOPP-B14-INHIBIDOR-PDE5-INSUFICIENCIA-CARDIACA-HIPOTENSION | STOPP | PDE5 en IC grave con hipotension |
| STOPP-B14-INHIBIDOR-PDE5-NITRATOS | STOPP | PDE5 con nitratos |
| STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO | STOPP | Prolongadores QTc con QTc prolongado |
| STOPP-B16-ESTATINA-PREVENCION-PRIMARIA-ANCIANO | STOPP | Estatina en prevencion primaria con edad avanzada/fragilidad |
| STOPP-B17-AINE-ENFERMEDAD-VASCULAR | STOPP | AINE con enfermedad vascular |
| STOPP-B18-NEUROLEPTICO-ENFERMEDAD-VASCULAR | STOPP | Neuroleptico con enfermedad vascular |
| STOPP-B19-AINE-INSUFICIENCIA-CARDIACA | STOPP | AINE con IC que requiere diuretico de asa |
| STOPP-B19-CORTICOIDE-SISTEMICO-IC | STOPP | Corticoide sistemico con IC que requiere diuretico de asa |
| STOPP-B20-ANTIHIPERTENSIVO-ESTENOSIS-AORTICA | STOPP | Antihipertensivo central con estenosis aortica grave |
| STOPP-B20-BETABLOQUEANTE-ESTENOSIS-AORTICA | STOPP | Betabloqueante con estenosis aortica grave |
| STOPP-B21-DIGOXINA-FA | STOPP | Digoxina como primera linea en FA |
| START-B1-ANTIHIPERTENSIVO-HTA | START | Iniciar antihipertensivo en HTA sin tratamiento |
| START-B2-ESTATINA-ENFERMEDAD-VASCULAR | START | Iniciar estatina en enfermedad vascular |
| START-B3-IECA-CARDIOPATIA-ISQUEMICA | START | Iniciar IECA en cardiopatia isquemica |
| START-B4-BETABLOQUEANTE-CARDIOPATIA-ISQUEMICA | START | Iniciar betabloqueante en cardiopatia isquemica |
| START-B5-IECA-IC-FE-REDUCIDA | START | Iniciar IECA/ARA-II en IC con FE reducida |
| START-B6-BETABLOQUEANTE-IC-FE-REDUCIDA | START | Iniciar betabloqueante en IC con FE reducida |
| START-B7-ANTAGONISTA-ALDOSTERONA-IC | START | Iniciar antagonista aldosterona en IC-FEr sin deterioro renal grave |
| START-B8-ISGLT2-INSUFICIENCIA-CARDIACA | START | Iniciar iSGLT2 en IC sintomatica |
| START-B9-SACUBITRILO-VALSARTAN-IC | START | Considerar sacubitrilo/valsartan en IC-FEr pese a IECA/ARA-II |
| START-B10-BETABLOQUEANTE-FA-MAL-CONTROL | START | Iniciar betabloqueante en FA con mal control |
| START-B11-HIERRO-IV-IC-DEFICIT-HIERRO | START | Hierro IV en IC-FEr con deficit de hierro |

### Criterios oficiales STOPP cardiovasculares no implementados en JSON

No falta ningun numero STOPP-B1..B21 como bloque general: todos tienen al menos una entrada en `criteria.json` (`STOPP_START_CRITERIOS_CONTEXTO.md:56-80`). Pero hay implementaciones incompletas o divergentes:

- STOPP-B13 esta sobredesglosado y duplica hallazgos (ver seccion 6).
- STOPP-B15 oficial incluye una lista amplia de farmacos QTc, pero el JSON usa solo `PROLONGADOR_QTC`; no existe grupo visible por esa clase y Digoxina ni siquiera lleva `PROLONGADOR_QTC` en `MEDICATIONS`.
- STOPP-B20 oficial habla de antihipertensivos salvo inhibidores del sistema renina-angiotensina. El JSON solo dispara con `ANTIHIPERTENSIVO_CENTRAL` o `BETABLOQUEANTE`; los diureticos/tiazidas/alfabloqueantes aparecen solo en `excludes` de una entrada, y los calcioantagonistas DHP no aparecen en la logica.
- Los criterios STOPP-C y START-C con diagnosticos cardiovasculares existen en otro sistema (`Anticoagulantes/Antiagregantes`) y no se mapean al tab cardiovascular; esto afecta a `Prótesis valvular metálica`, `Estenosis mitral moderada-grave`, `FA paroxística`, etc.
- START oficial no esta en el repo; no he contrastado ausencias START contra fuente externa.

## 2. Tabla por criterio

Leyenda de seleccionabilidad: "Si" = disponible en el tab cardiovascular por grupo propio o relevancia; "Parcial" = parte de los disparadores no es seleccionable en cardiovascular; "No" = algun disparador imprescindible no esta disponible en cardiovascular.

| id | requiere (dx / med / lab) | seleccionable | estado |
|---|---|---|---|
| STOPP-B1-DIGOXINA | dx `ic_funcion_sistolica_conservada`; med `DIGOXINA` | No | Falso negativo: `Digoxina` es grupo de 1 farmaco y `computeMedGroupBuckets` oculta grupos con `drugs.length <= 1` fuera de `Otros`. |
| STOPP-B2-VERAPAMILO-IC-NYHA | dx `ic_nyha_3_4`; med `CALCIOANTAGONISTA_NO_DHP` | Si | OK. |
| STOPP-B3-VERAPAMILO-BETABLOQUEANTES | med `CALCIOANTAGONISTA_NO_DHP` + `BETABLOQUEANTE` | Si | OK. |
| STOPP-B4-BETABLOQUEANTE-BRADICARDIA | dx `bradicardia` o lab `fc_lpm < 50`; med `BETABLOQUEANTE` | Si | OK. |
| STOPP-B4-DIGOXINA-BLOQUEO-CARDIACO | dx `bloqueo_av_grado_2`/`bloqueo_av_completo`; med `DIGOXINA` | No | Falso negativo por Digoxina no visible en cardiovascular. |
| STOPP-B4-DIGOXINA-BRADICARDIA | dx `bradicardia` o lab `fc_lpm < 50`; med `DIGOXINA` | No | Falso negativo por Digoxina no visible en cardiovascular. |
| STOPP-B4-VERAPAMILO-BLOQUEO-CARDIACO | dx bloqueo AV; med `CALCIOANTAGONISTA_NO_DHP` | Si | OK. |
| STOPP-B4-VERAPAMILO-BRADICARDIA | dx `bradicardia` o lab `fc_lpm < 50`; med `CALCIOANTAGONISTA_NO_DHP` | Si | OK. |
| STOPP-B5-BETABLOQUEANTE-HTA-NO-COMPLICADA | dx `hta`/`hta_no_complicada`; med `BETABLOQUEANTE` | Si | OK en logica; `Angina de pecho` y `Aneurisma aórtico` no son disparadores, solo aclaraciones del resumen oficial. |
| STOPP-B6-AMIODARONA-TAQUIARRITMIA-PRIMERA-LINEA | dx `taquiarritmias_supraventriculares`; med `ANTIARITMICO` | Parcial | Seleccionable, pero la clase `ANTIARITMICO` incluye flecainida/dronedarona; el resumen dice amiodarona. Riesgo de falso positivo por clase demasiado amplia. |
| STOPP-B7-DIURETICO-ASA-PRIMERA-LINEA-HTA | dx HTA variantes; no IC; med `DIURETICO_ASA` | Si | OK; los dx de exclusion de IC son negativos y no deberian presentarse como disparadores. |
| STOPP-B8-DIURETICO-ASA-EDEMAS-MALEOLARES | dx `edemas_maleolares`; no IC/hepatica/renal/sindrome nefrotico; med `DIURETICO_ASA` | Parcial | El disparador principal esta; los dx negativos se hacen relevantes por `system-relevance` aunque no activan criterio. |
| STOPP-B9-TIAZIDA-GOTA | dx gota activa/recurrente/antecedentes; med `DIURETICO_TIAZIDICO` | Si | OK. |
| STOPP-B9-TIAZIDA-HIPERCALCEMIA | dx `hipercalcemia` o lab `calcio_corregido_mmol_l > 2.65`; med `DIURETICO_TIAZIDICO` | Si | OK. |
| STOPP-B9-TIAZIDA-HIPONATREMIA | dx `hiponatremia` o lab `sodio_mmol_l < 130`; med `DIURETICO_TIAZIDICO` | Si | OK. |
| STOPP-B9-TIAZIDA-HIPOPOTASEMIA | dx `hipopotasemia` o lab `potasio_mmol_l < 3`; med `DIURETICO_TIAZIDICO` | Si | OK. |
| STOPP-B10-DIURETICO-ASA-INCONTINENCIA | dx HTA + `incontinencia_urinaria`; med `DIURETICO_ASA` | Si | OK, aunque `incontinencia_urinaria` pertenece semanticamente a urologico. |
| STOPP-B11-ANTIHIPERTENSIVO-CENTRAL-ANCIANOS | edad >=65; dx HTA; no `intolerancia_otros_antihipertensivos`; med `ANTIHIPERTENSIVO_CENTRAL` | Parcial | Disparadores positivos OK; `Intolerancia/fallo a otros antihipertensivos` es una excepcion negativa siempre visible. |
| STOPP-B12-ARA2-HIPERPOTASEMIA | dx `hiperpotasemia` o lab K >5.5; med `ARA2` | Si | OK. |
| STOPP-B12-IECA-HIPERPOTASEMIA | dx `hiperpotasemia` o lab K >5.5; med `IECA` | Si | OK. |
| STOPP-B13-ANTAGONISTA-ALDOSTERONA-IECA-ARA2-POTASIO | med `ANTAGONISTA_ALDOSTERONA` + (`IECA`/`ARA2`/`DIURETICO_AHORRADOR_POTASIO`) | Si | Funciona, pero se solapa con cinco entradas B13 especificas. |
| STOPP-B13-ARA2-ANTAGONISTA-ALDOSTERONA | med `ARA2` + `ANTAGONISTA_ALDOSTERONA` | Si | Duplicado funcional de la entrada general B13. |
| STOPP-B13-ARA2-DIURETICO-AHORRADOR-POTASIO | med `ARA2` + `DIURETICO_AHORRADOR_POTASIO` | Si | Duplicado parcial de B13, sin antagonista de aldosterona. |
| STOPP-B13-DIURETICO-AHORRADOR-POTASIO-ANTAGONISTA | med `DIURETICO_AHORRADOR_POTASIO` + `ANTAGONISTA_ALDOSTERONA` | Si | Duplicado funcional de la entrada general B13. |
| STOPP-B13-IECA-ANTAGONISTA-ALDOSTERONA | med `IECA` + `ANTAGONISTA_ALDOSTERONA` | Si | Duplicado funcional de la entrada general B13. |
| STOPP-B13-IECA-DIURETICO-AHORRADOR-POTASIO | med `IECA` + `DIURETICO_AHORRADOR_POTASIO` | Si | Duplicado parcial de B13, sin antagonista de aldosterona. |
| STOPP-B14-INHIBIDOR-PDE5-INSUFICIENCIA-CARDIACA-HIPOTENSION | dx `insuficiencia_cardiaca_grave`; dx `hipotension_sintomatica` o PAS <90; med `INHIBIDOR_PDE5` | Si | OK. |
| STOPP-B14-INHIBIDOR-PDE5-NITRATOS | med `INHIBIDOR_PDE5` + `NITRATO` | Si | OK. |
| STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO | dx `intervalo_qtc_prolongado` o lab QTc >=450; med `PROLONGADOR_QTC` | Parcial | No hay grupo `PROLONGADOR_QTC` visible. Algunas meds pueden entrar por otros grupos, pero quinolonas/macrolidos/ondansetron/ATC/ISRS/litio/fenotiazinas/tizanidina/mirabegron dependen de taxonomia no usada por el filtro. Digoxina no tiene clase `PROLONGADOR_QTC`. |
| STOPP-B16-ESTATINA-PREVENCION-PRIMARIA-ANCIANO | edad >=85; dx `fragilidad`; no enfermedad cardiovascular; med `ESTATINA` | Si | OK, aunque `enfermedad_cardiovascular` es excepcion negativa. |
| STOPP-B17-AINE-ENFERMEDAD-VASCULAR | dx vascular coronaria/cerebral/periferica; med `AINE` | Si | OK. |
| STOPP-B18-NEUROLEPTICO-ENFERMEDAD-VASCULAR | dx vascular coronaria/cerebral/periferica; med `NEUROLEPTICO` | Si | OK. |
| STOPP-B19-AINE-INSUFICIENCIA-CARDIACA | dx IC; med `AINE` + `DIURETICO_ASA` | Si | OK. |
| STOPP-B19-CORTICOIDE-SISTEMICO-IC | dx IC; med `CORTICOIDE_SISTEMICO` + `DIURETICO_ASA` | Si | OK. |
| STOPP-B20-ANTIHIPERTENSIVO-ESTENOSIS-AORTICA | dx `estenosis_aortica_grave_sintomatica`; med `ANTIHIPERTENSIVO_CENTRAL` | Parcial | Incompleto respecto al resumen/excludes: diureticos, tiazidas y alfabloqueantes estan en `excludes`, pero no en `logic`. |
| STOPP-B20-BETABLOQUEANTE-ESTENOSIS-AORTICA | dx `estenosis_aortica_grave_sintomatica`; med `BETABLOQUEANTE` | Si | OK para esta subregla. |
| STOPP-B21-DIGOXINA-FA | dx `fibrilacion_auricular`; med `DIGOXINA` | No | Falso negativo por Digoxina no visible en cardiovascular. |
| START-B1-ANTIHIPERTENSIVO-HTA | dx HTA o PA >140/90; ausencia IECA/ARA2/beta/tiazida/no-DHP/central | Si | OK con los grupos actuales; no considera calcioantagonistas DHP aunque son antihipertensivos seleccionables. |
| START-B2-ESTATINA-ENFERMEDAD-VASCULAR | dx vascular/enfermedad cardiovascular; ausencia `ESTATINA` | Si | OK. |
| START-B3-IECA-CARDIOPATIA-ISQUEMICA | dx `cardiopatia_isquemica`; ausencia `IECA` | Si | OK. |
| START-B4-BETABLOQUEANTE-CARDIOPATIA-ISQUEMICA | dx `cardiopatia_isquemica`; ausencia `BETABLOQUEANTE` | Si | OK. |
| START-B5-IECA-IC-FE-REDUCIDA | dx `insuficiencia_cardiaca_fe_reducida`; ausencia `IECA`/`ARA2`/`SACUBITRILO_VALSARTAN` | Parcial | `Sacubitrilo/Valsartán` existe en `MEDICATIONS` pero es grupo de 1 farmaco y no se muestra en cardiovascular. |
| START-B6-BETABLOQUEANTE-IC-FE-REDUCIDA | dx IC-FEr; ausencia beta cardio/no cardioselectivo | Si | OK. |
| START-B7-ANTAGONISTA-ALDOSTERONA-IC | dx IC-FEr; ausencia `ANTAGONISTA_ALDOSTERONA`; lab TFGe >30 o null | Si | OK. |
| START-B8-ISGLT2-INSUFICIENCIA-CARDIACA | dx IC/IC-FEr; ausencia `ISGLT2` | Si | OK. |
| START-B9-SACUBITRILO-VALSARTAN-IC | dx IC-FEr; IECA/ARA2 presente; ausencia `SACUBITRILO_VALSARTAN` | Parcial | `Sacubitrilo/Valsartán` no es seleccionable en cardiovascular. |
| START-B10-BETABLOQUEANTE-FA-MAL-CONTROL | dx `fibrilacion_auricular` + `fa_mal_control_frecuencia`; ausencia `BETABLOQUEANTE` | Si | OK. |
| START-B11-HIERRO-IV-IC-DEFICIT-HIERRO | dx IC-FEr + `deficit_hierro`; ausencia `HIERRO_IV` | Si | OK; `Déficit de hierro` es extranjero hematologico pero se vuelve visible por relevancia. |

## 3. Opciones que SOBRAN

### Diagnosticos

| opcion | razon | accion propuesta |
|---|---|---|
| Angina de pecho | Texto explicativo de STOPP-B5; no aparece como disparador positivo en criterios cardiovasculares. Solo aparece como exclusion negativa en STOPP-C16 (`! angina`). | No mostrar como diagnostico suelto en cardiovascular; mover a tooltip/aclaracion de `HTA no complicada`. |
| Aneurisma aórtico | Texto explicativo del criterio oficial B5, pero no aparece en `logic`. | No mostrar como diagnostico suelto; tooltip de `HTA no complicada`. |
| Prótesis valvular metálica | Solo justifica una excepcion negativa de STOPP-C11, sistema `Anticoagulantes/Antiagregantes`; no activa nada al marcarla sola en cardiovascular. | Mantener si se decide que es dato clinico, pero atenuarla/gatearla por AVK o mover a anticoagulantes. |
| Estenosis mitral moderada-grave | Igual que la anterior: solo excepcion negativa de STOPP-C11. | Atenuar salvo AVK marcado (`ANTICOAGULANTE_AVK`) o mover a anticoagulantes. |
| FA paroxística | Solo se usa en START-C1, no en `"Sistema cardiovascular"`. | Si se mantiene en cardiovascular, debe mapearse la relevancia de START-C1 al tab o explicar que pertenece a anticoagulacion. |
| Trastornos de conducción cardíaca | Usado por STOPP-D1 (triciclicos), no por el sistema cardiovascular real. | Mover a SNC o hacerlo foreign solo si triciclicos son relevantes. |
| Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica | No se usa en criterios cardiovasculares; los criterios usan las variantes separadas `enfermedad_vascular_coronaria/cerebral/periferica`. | Eliminar o convertir en familia/tooltip de las tres variantes. |
| Enfermedad vascular estable / Enfermedad vascular estable sin indicación clara | Usadas por STOPP-C5 (anticoagulacion/antiagregacion), no por `"Sistema cardiovascular"`. | Mover al tab anticoagulantes o marcar como foreign dependiente de antiagregante/anticoagulante. |
| Hipotensión ortostática / Síncopes recurrentes | No activan criterios cardiovasculares actuales; aparecen por otros sistemas como I5/K. | No mostrarlas como propias del piloto cardiovascular salvo que B20 se amplie realmente a estas condiciones. |
| Malnutrición | No pertenece al sistema; aparece por criterio transversal de analgesicos (L6). | No expandir todos los criterios transversales a cardiovascular o excluir este dx del tab. |
| Insuficiencia hepática / Insuficiencia renal / Síndrome nefrótico | Aparecen por referencias negativas de B8; marcar una de ellas evita el criterio, no lo activa. | No presentarlas como disparadores; si se muestran, atenuarlas como excepciones condicionadas a diuretico de asa + edemas. |

### Medicamentos / grupos

| opcion | razon | accion propuesta |
|---|---|---|
| Antagonistas del calcio DHP | Grupo propio cardiovascular, pero ningun criterio cardiovascular lo usa en `logic`. Tampoco cuenta en START-B1 pese a ser antihipertensivo. | O bien integrarlo en START-B1/B20 si clinicamente procede, o sacarlo del tab si no desbloquea nada. |
| Laxantes | No pertenece al sistema cardiovascular; entra por criterios transversales de analgesicos/GI. | No expandir `Analgésicos` a todos los tabs sin filtro clinico; en laxantes, dejar solo la estructura que toque al sistema GI. |
| Lactulosa / Macrogol como opciones finales de "Laxantes" | Sub-opciones mal definidas si se muestran por START-F5: son ejemplos de osmoticos, no opciones cardiovasculares. | Agrupar como tooltip de `Osmóticos`; mantener `Osmóticos` y `Otros` como opciones de laxantes cuando toque GI. |
| Flecainida / Dronedarona bajo `ANTIARITMICO` para STOPP-B6 | B6 dice amiodarona, pero la logica dispara por cualquier `ANTIARITMICO`. | Cambiar la logica a `Amiodarona` o clase especifica si se corrige despues. |

## 4. Opciones que FALTAN

| opcion faltante | tipo | criterios que desbloquea | causa |
|---|---|---|---|
| Digoxina | medicacion/grupo | STOPP-B1, STOPP-B4-DIGOXINA-BLOQUEO-CARDIACO, STOPP-B4-DIGOXINA-BRADICARDIA, STOPP-B21; tambien STOPP-E1 en renal | Existe en `MEDICATIONS` (`src/app/core/data/medications.ts:102-106`) y en `DRUG_CATEGORIES`, pero el grupo tiene un solo farmaco y `computeMedGroupBuckets` solo muestra `ownAll` con `drugs.length > 1` (`src/app/core/group-visibility.ts:45-48`). |
| Sacubitrilo/Valsartán | medicacion/grupo | START-B5 y START-B9 (como medicacion que suprime/condiciona START) | Mismo problema de grupo unitario; esta en `MEDICATIONS` y taxonomia, pero no se muestra en cardiovascular. |
| Grupo/clase `PROLONGADOR_QTC` | grupo transversal | STOPP-B15 | El criterio usa `inDrugClass("PROLONGADOR_QTC")`, pero no hay grupo de taxonomia con `drugClass: "PROLONGADOR_QTC"`. Las `additionalCategories: ['cardiovascular']` no se usan en la visibilidad. |
| Quinolonas, macrolidos, ondansetron, citalopram/escitalopram, triciclicos, litio, haloperidol/fenotiazinas, tizanidina, astemizol, mirabegron | medicamentos/grupos | STOPP-B15 | Muchas medicaciones tienen `PROLONGADOR_QTC` como clase secundaria, pero sus grupos primarios no se hacen visibles por esa clase secundaria. |
| Digoxina como prolongador QTc | clase en medicacion | STOPP-B15 si se quiere alinear con texto oficial | `Digoxina` tiene solo `DIGOXINA`; el criterio oficial B15 la nombra, pero el JSON no la detecta como `PROLONGADOR_QTC`. |

## 5. Dependencias rotas / sombreado

El sombreado se construye en `buildDxDependencies` a partir de criterios STOPP, extrayendo diagnosticos positivos y clases positivas (`src/app/core/data/dx-dependencies.ts:104-138`). Los diagnosticos dentro de `!` se ignoran por `extractPositiveDxCodesForDependencies` (`src/app/core/data/diagnosis-family.ts:75-118`). Por eso varias excepciones negativas quedan siempre habilitadas aunque no activen nada al marcarlas solas.

| diagnostico | criterio que lo justifica | condicion de medicacion esperada |
|---|---|---|
| Estenosis mitral moderada-grave | STOPP-C11-AVK-FA-PRIMERA-LINEA (`src/assets/data/criteria.json:476-481`) | Atenuada salvo `ANTICOAGULANTE_AVK` marcado; al marcarla sola no debe parecer disparador. |
| Prótesis valvular metálica | STOPP-C11-AVK-FA-PRIMERA-LINEA | Atenuada salvo `ANTICOAGULANTE_AVK` marcado. |
| Intolerancia/fallo a otros antihipertensivos | STOPP-B11-ANTIHIPERTENSIVO-CENTRAL-ANCIANOS (`criteria.json:204-209`) | Atenuada salvo `ANTIHIPERTENSIVO_CENTRAL` marcado; es una excepcion que suprime el criterio. |
| Insuficiencia hepática / Insuficiencia renal / Síndrome nefrótico | STOPP-B8-DIURETICO-ASA-EDEMAS-MALEOLARES (`criteria.json:156-161`) | Atenuadas salvo `DIURETICO_ASA` y contexto de edemas; son exclusiones, no disparadores. |
| Enfermedad cardiovascular establecida | STOPP-B16 y START-B2 | En B16 es excepcion negativa; en START-B2 si es positiva. Debe decidirse si se mantiene como ancla siempre visible o si se separan usos. |

## 6. Bug B13

Causa raiz: no lo genera `multipleAldosteroneAntagonists`. Ese operador solo se usa en STOPP-A3 para duplicidad de antagonistas de aldosterona (`criteria.json:12-17`) y devuelve un booleano unico por criterio (`src/app/core/services/criteria-engine.service.ts:199-203`, `245-251`).

El bug viene de entradas duplicadas/solapadas en `criteria.json`: hay una regla general B13 y cinco subreglas B13 especificas, todas con `system: "Sistema cardiovascular"` y summaries distintos (`criteria.json:228-273`). Si se marcan, por ejemplo, IECA + espironolactona, disparan simultaneamente la general `STOPP-B13-ANTAGONISTA-ALDOSTERONA-IECA-ARA2-POTASIO` y `STOPP-B13-IECA-ANTAGONISTA-ALDOSTERONA`; con ARA-II/ahorradores de potasio pueden acumularse mas variantes.

Por que se ven "varias veces con la misma etiqueta B13 pero redaccion distinta": la UI deriva el codigo mostrado con `critCode(id) = id.split('-')[1]` (`src/app/core/criteria-groups.ts:20-22`), de modo que las seis entradas colapsan al mismo badge `B13` aunque su `id` completo y su `summary` difieran. El resultado es una lista de tarjetas todas rotuladas `B13` con textos diferentes. Tabla de solapamientos:

| entrada (id) | dispara con | subsumida por |
|---|---|---|
| STOPP-B13-ANTAGONISTA-ALDOSTERONA-IECA-ARA2-POTASIO | antag. aldosterona + (IECA o ARA-II o ahorrador K) | — (regla general) |
| STOPP-B13-IECA-ANTAGONISTA-ALDOSTERONA | IECA + antag. aldosterona | regla general |
| STOPP-B13-ARA2-ANTAGONISTA-ALDOSTERONA | ARA-II + antag. aldosterona | regla general |
| STOPP-B13-DIURETICO-AHORRADOR-POTASIO-ANTAGONISTA | ahorrador K + antag. aldosterona | regla general |
| STOPP-B13-IECA-DIURETICO-AHORRADOR-POTASIO | IECA + ahorrador K | parcial (sin antag. aldosterona) |
| STOPP-B13-ARA2-DIURETICO-AHORRADOR-POTASIO | ARA-II + ahorrador K | parcial (sin antag. aldosterona) |

Accion propuesta (no aplicada): dejar una unica entrada B13 (la general) o desambiguar el `id`/badge para que no colapsen; las dos parciales sin antagonista de aldosterona deben revisarse aparte porque la combinacion IECA/ARA-II + ahorrador de potasio "puro" no es exactamente el supuesto oficial de B13.

## 7. Detalle trivial: "Start"/"Stop"

La vista de criterios activados renderiza los badges de cabecera de cada caja como `Start` y `STOP` (deberia ser `START` y `STOPP`):

- `src/app/steps/meds-step/meds-step.component.html:260` (`Start <span ...>`) y `:318` (`STOP <span ...>`).
- `src/app/steps/diagnosis-step/diagnosis-step.component.html:302` (`Start <span ...>`) y `:360` (`STOP <span ...>`).

Es solo el texto literal de esos cuatro badges; las tarjetas individuales usan `critCode(c.id)` (el codigo tipo `B5`) y `c.type` se compara internamente siempre en mayuscula (`'STOPP'`/`'START'`), por lo que el resto de la app (p. ej. el PDF en `src/app/core/report.service.ts:156,163`) ya rotula correctamente `STOPP`/`START`. El defecto esta aislado a esos badges de las dos plantillas de pasos.

## 8. ASUNCIONES

- He tratado `system: "Sistema cardiovascular"` como el sistema cardiovascular real del JSON, porque `system == "cardiovascular"` no existe.
- Para START no hay texto oficial en el repo; he usado los `summary` y `logic` de `criteria.json` como fuente de lo implementado.
- "Seleccionable en cardiovascular" significa visible en el tab cardiovascular por `DRUG_CATEGORIES`/`DIAGNOSIS_TABS` + `buildRelevance`; los grupos de un solo farmaco quedan accesibles solo en `Otros`, no en cardiovascular.
- No he ejecutado la app ni tests; esta auditoria se basa en lectura estatica del codigo y datos.
