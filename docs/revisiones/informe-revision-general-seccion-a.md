# Informe de revisión — Sección A: Motor de criterios y datos clínicos

- **Ronda:** Revisión general 2026-07-17 (manifiesto: `docs/revisiones/manifiesto-revision-general-2026-07-17.md`)
- **Fecha del informe:** 2026-07-18
- **Modo:** solo análisis; no se ha cambiado código ni movido/borrado ningún fichero.

## Alcance realmente revisado

Ficheros leídos íntegramente:

- `src/app/core/services/criteria-engine.service.ts`
- `src/app/core/services/criteria-test-helpers.ts`
- Specs consultadas puntualmente: `criteria-c.spec.ts`, `criteria-d.spec.ts` (para contrastar huecos de test de los hallazgos; el resto de specs a–h y l no se leyeron línea a línea)
- `src/assets/data/criteria.json` (216 criterios; es el único fichero de criterios que consume el motor, cargado en `criteria-engine.service.ts:48`)
- `src/app/core/data/diagnoses.ts`, `diagnoses-taxonomy.ts`, `diagnosis-family.ts`, `diagnosis-variants.ts`, `diagnosis-variant-view.ts`
- `src/app/core/data/dx-dependencies.ts`, `dx-dependencies-overrides.ts`, `dx-anchor-labels-candidate.ts`
- `src/app/core/data/medications.ts`, `medications-taxonomy.ts`, `system-relevance.ts`
- `src/app/core/criteria-groups.ts`, `src/app/core/types.ts`
- `src/app/core/group-visibility.ts` (frontera con Sección B; leído porque el punto 3 del alcance pide revisar la visibilidad multiclase tras 1a49c0b/54f29f4)

Cross-checks automatizados (scripts de solo lectura en el scratchpad de la sesión, `xcheck.js` / `xcheck2.js`): ids de `excludes.medications` vs catálogo, clases usadas en lógica/excludes vs clases con miembros, códigos dx usados vs `DIAGNOSIS_MAP`, sistemas de criterios vs `SYSTEM_TO_TABS`, duplicados de ids, variables `labs.*`/`info.*` vs `types.ts`. Resultados citados en cada hallazgo. No se ejecutó la suite Karma.

**Nota de alcance:** no existe ningún otro JSON/TS de criterios además de `src/assets/data/criteria.json`. `criteria-groups.ts` son 22 líneas de agrupación pura y no presenta hallazgos propios.

---

## Hallazgos

### A1 (ALTA) — STOPP-C12 dispara sin que el paciente tome ISRS

- **Evidencia:** `src/assets/data/criteria.json:456`. La lógica es
  `and[ inDrugClass(ANTICOAGULANTE), in(antecedentes_sangrado_grave) ]` — **no contiene ninguna cláusula ISRS**, aunque el criterio es «Evitar ISRS en pacientes con antecedentes de hemorragia grave que utilizan anticoagulantes».
- **Efecto:** cualquier paciente anticoagulado con `antecedentes_sangrado_grave` y **sin ningún ISRS** aparece en los resultados/report con la recomendación "Evitar ISRS", como criterio cumplido. Todos sus criterios hermanos (p. ej. D7, `criteria.json:592`) sí exigen el fármaco.
- **Hueco de test:** `src/app/core/services/criteria-c.spec.ts:282-293` prueba «dispara con antecedentes + ISRS + anticoagulante» y «no dispara sin antecedentes», pero **no** prueba «anticoagulante + antecedentes sin ISRS», que es exactamente el caso roto.
- **Comprobación:** `engine.evaluate(makeCase({ diagnoses: ['antecedentes_sangrado_grave'], medications: [anticoag()] }), [crit('STOPP-C12-ISRS-ANTICOAGULANTE-SANGRADO')])` devuelve 1 resultado; debería devolver 0.
- Nota: la exclusión preventiva de ISRS por probe (`getExcludedMedications`) seguiría funcionando igual si se añade la cláusula `inDrugClass(ISRS)`, porque el probe inyecta el ISRS antes de evaluar.

### A2 (ALTA) — START-I3 y START-I4 no pueden dispararse nunca: `info.sex` se compara con `"f"` pero el tipo es `'F' | 'M'`

- **Evidencia:**
  - `src/assets/data/criteria.json:1640` y `:1647`: `{"==":[{"var":"info.sex"},"f"]}` (minúscula).
  - `src/app/core/types.ts:4`: `export type Sex = 'F' | 'M'` (mayúscula); `historial.component.html:29` y las specs (`case-io.service.spec.ts:151`) confirman que el dato real se guarda como `'F'`.
  - `criteria-engine.service.ts:65-80` (`normalizeCase`) normaliza a minúsculas `diagnoses` y `medications`, pero **no** `info`.
- **Efecto:** `'F' == 'f'` es falso en json-logic → los dos únicos criterios dependientes de sexo (estrógenos tópicos en vaginitis atrófica e ITU recurrentes) son inalcanzables con datos conformes al tipo.
- **Agravante:** no existe ningún formulario en la UI que capture `info` (edad/sexo); `store.patient` solo se puebla vía `loadCase`/import (`case-store.service.ts:131-137`; búsqueda de `patient.set` en `src/app` sin más escritores). Ver A16.
- **Comprobación:** `engine.evaluate(makeCase({ info: { ...withAge(80), sex: 'F' }, diagnoses: ['vaginitis_atrofica'] }), [crit('START-I3-ESTROGENO-TOPICO-VAGINITIS-ATROFICA')])` devuelve `[]`.

### A3 (ALTA) — STOPP-B20-ANTIHIPERTENSIVO-ESTENOSIS-AORTICA: la lógica solo evalúa antihipertensivos centrales pero el summary y los excludes prometen diuréticos y alfabloqueantes

- **Evidencia:** `src/assets/data/criteria.json:316-322`. Lógica: `and[ inDrugClass(ANTIHIPERTENSIVO_CENTRAL), in(estenosis_aortica_grave_sintomatica) ]`. Excludes: `DIURETICO_ASA, DIURETICO_TIAZIDICO, ANTIHIPERTENSIVO_CENTRAL, ALFABLOQUEANTE`. Summary: «Evitar antihipertensivos (diuréticos, antihipertensivos centrales, alfabloqueantes)…».
- **Efecto doble:**
  1. Un paciente con estenosis aórtica grave que toma furosemida o doxazosina (sin central) **no dispara** el criterio, contradiciendo su propio texto.
  2. El greying de diuréticos/alfabloqueantes vía `getExcludedMedications` solo se activa si el paciente ya toma un antihipertensivo central: el probe (p. ej. Furosemida, `criteria-engine.service.ts:136-155`) no satisface la cláusula `ANTIHIPERTENSIVO_CENTRAL` de la lógica.
- **Comprobación:** `evaluate({diagnoses:['estenosis_aortica_grave_sintomatica'], medications:[diureticoAsa()]}, [B20-ANTIHIPERTENSIVO])` → `[]`. La lógica debería ser un `or` sobre las cuatro clases (como hace K3 en `criteria.json:1178` con su lista de vasodilatadores).

### A4 (MEDIA) — STOPP-D12 penaliza también quetiapina/clozapina y su summary se contradice con sus excludes

- **Evidencia:** `src/assets/data/criteria.json:628-633`. La lógica dispara con **cualquier** `NEUROLEPTICO` en parkinsonismo/Lewy; en STOPP v3 las excepciones son quetiapina y clozapina. El summary dice «(bajo olanzapina y quetiapina)» (texto ya de por sí confuso) mientras `excludes.medications` incluye `Olanzapina` y omite `Quetiapina` y `Clozapina`.
- **Efecto:** un paciente de Parkinson tratado correctamente con quetiapina recibe la alerta «Evitar neurolépticos…»; a la vez, la lista de exclusión no protege frente a añadir quetiapina pero sí frente a olanzapina, lo contrario de lo que sugiere el summary.
- **Comprobación:** `evaluate({diagnoses:['parkinsonismo'], medications:[neuroleptico('Quetiapina')]}, [D12])` → dispara. La spec (`criteria-d.spec.ts:363-385`) solo prueba Haloperidol y Risperidona, nunca las excepciones.

### A5 (MEDIA) — STOPP-C16 (AAS en prevención primaria) da falso positivo en prevención secundaria: no niega `cardiopatia_isquemica` ni `ictus_previo`

- **Evidencia:** `src/assets/data/criteria.json:488`. Se niegan `enfermedad_cardiovascular`, `enfermedad_vascular_coronaria`, `angina`, `enfermedad_vascular_cerebral`, `enfermedad_vascular_periferica`, pero el catálogo tiene otros dos códigos de enfermedad aterosclerótica establecida que los criterios START usan como indicación de antiagregación: `cardiopatia_isquemica` e `ictus_previo` (START-C2, `criteria.json:1430`, los acepta exactamente para indicar AAS).
- **Efecto:** paciente con `ictus_previo` + AAS (prevención secundaria correcta) dispara «Evitar AAS en prevención primaria», a la vez que START-C2 lo considera bien tratado.
- **Comprobación:** `evaluate({diagnoses:['ictus_previo'], medications:[aas()]}, [C16])` → dispara.

### A6 (MEDIA) — STOPP-J3: la lógica usa la clase BETABLOQUEANTE completa aunque el criterio es de no cardioselectivos

- **Evidencia:** `src/assets/data/criteria.json:1090-1091`. Summary: «Evitar betabloqueantes **no cardioselectivos**…». Lógica: `inDrugClass(BETABLOQUEANTE)`. Excludes (coherentes con el summary): solo `Carvedilol, Propranolol`. El catálogo distingue `BETABLOQUEANTE_NO_CARDIOSELECTIVO` (`medications.ts:327-328`), que es la clase que debería usar la lógica.
- **Efecto:** bisoprolol/metoprolol (cardioselectivos, de elección en diabético) disparan la alerta.
- **Comprobación:** `evaluate({diagnoses:['diabetes_hipoglucemias_frecuentes'], medications:[betabloq('Bisoprolol')]}, [J3])` → dispara.

### A7 (MEDIA) — STOPP-B6: dispara con cualquier antiarrítmico, no solo amiodarona

- **Evidencia:** `src/assets/data/criteria.json:144-145`. Lógica: `inDrugClass(ANTIARITMICO)`; la clase incluye Flecainida y Dronedarona (`medications.ts:103-104,304`). El criterio STOPP B6 es específico de amiodarona como primera línea, y los excludes solo listan `Amiodarona` pero con `drugClasses:["ANTIARITMICO"]`, que además excluye Flecainida/Dronedarona vía `getExcludedMedications`.
- **Efecto:** flecainida en taquiarritmia supraventricular (uso legítimo) dispara «Evitar amiodarona…».
- **Comprobación:** `evaluate({diagnoses:['taquiarritmias_supraventriculares'], medications:[makeMed('Flecainida',['ANTIARITMICO'])]}, [B6])` → dispara.

### A8 (MEDIA) — Diagnósticos seleccionables que ningún criterio evalúa: `prostatismo_retencion_urinaria` y `aneurisma_aortico`

- **Evidencia:** cross-check `xcheck.js` («dx codes in DIAGNOSIS_MAP never referenced»): `aneurisma_aortico`, `prostatismo_retencion_urinaria` (y `enfermedad_renal_grave`/`insuficiencia_renal_terminal`, que sí se usan implícitamente vía `egfrBelow`, `criteria-engine.service.ts:262-264` — falso positivo del script).
  - `diagnoses.ts:139` y `:366`: «Prostatismo / Retención urinaria» → `prostatismo_retencion_urinaria`. Los criterios D1/D4 evalúan `prostatismo` y `retencion_urinaria` por separado (`criteria.json:512,560`).
  - `diagnoses.ts:21` y `:248`: «Aneurisma aórtico» → `aneurisma_aortico`; cero referencias en criteria.json.
- **Efecto:** el clínico que marca el checkbox combinado «Prostatismo / Retención urinaria» cree cubrir D1-ADT-PROSTATISMO y D4, pero **ningún criterio dispara** (el código combinado no equivale a los individuales). «Aneurisma aórtico» es un checkbox totalmente inerte.
- **Comprobación:** `evaluate({diagnoses:['prostatismo_retencion_urinaria'], medications:[adt()]}, [D1-ADT-PROSTATISMO])` → `[]`.

### A9 (MEDIA) — Sección K incoherente: K8-PSICOTROPICO y K11 usan `riesgo_caidas_repeticion` mientras K1–K7/K4b/K12 usan `caidas_repeticion`

- **Evidencia:** `src/assets/data/criteria.json:1234` (K8-PSICOTROPICO) y `:1258` (K11) frente a `caidas_repeticion` en K1 (`:1162`), K2, K3, K4, K4b, K5, K6, K7, K8-ISRS, K9, K10, K12. En catálogo son dos entradas distintas: «Caídas de repetición» (Geriátrico, `diagnoses.ts:66`) y «Riesgo de caídas de repetición» (Síntoma, `diagnoses.ts:115`); el propio `dx-anchor-labels-candidate.ts:227-231` reconoce el solape («solapa con caídas de repetición», doubtful).
- **Efecto:** marcar «Caídas de repetición» dispara todo K **excepto** K8-PSICOTROPICO y K11; para el clínico es indistinguible por qué litio o clonidina no generan alerta.
- **Comprobación:** `evaluate({diagnoses:['caidas_repeticion'], medications:[makeMed('Litio',['ESTABILIZADOR_ANIMO','PSICOTROPICO'])]}, [K8-PSICOTROPICO])` → `[]`.

### A10 (MEDIA) — STOPP-C4 excluye (vía greying) los anticoagulantes justo cuando START-C1 y STOPP-C7 recomiendan anticoagular

- **Evidencia:** `src/assets/data/criteria.json:377`: `excludes: {"medications":[],"drugClasses":["ANTICOAGULANTE"]}` para la lógica `FA + antiagregante + anticoagulante`. Con paciente FA + antiagregante (sin anticoagulante), `getExcludedMedications` (`criteria-engine.service.ts:116-162`) prueba cada anticoagulante como probe → la lógica se cumple → **todos los anticoagulantes quedan excluidos/greyed**. Simultáneamente START-C1 (`criteria.json:1423`) recomienda iniciar anticoagulante y C7 (`criteria.json:416`) avisa de que el antiagregante solo es insuficiente en FA.
- **Efecto:** la app recomienda iniciar la anticoagulación y a la vez bloquea seleccionar cualquier anticoagulante. La exclusión debería apuntar al fármaco redundante (el antiagregante), como hace C5 con ambos (`criteria.json:385`), o al menos ser simétrica.
- **Comprobación:** `getExcludedMedications({diagnoses:['fibrilacion_auricular'], medications:[antiag()]}, [C4])` contiene `'apixaban'`, `'warfarina'`, etc.

### A11 (MEDIA) — La relevancia por sistema no ve las clases usadas en operadores custom; el parche `relevance.medicationClasses` solo cubre 3 de ~19 criterios afectados

- **Evidencia:** `system-relevance.ts:72-99` (`walk`) solo extrae clases de `inDrugClass` (y dx de `in`/`egfrBelow`). Los operadores `multiple*`, `medicationClassDurationAbove`, `medicationClassDoseMgAbove` y `digoxinaDosisAlta` son invisibles. Solo E1, F2 y F4 llevan el parche `relevance.medicationClasses` (`criteria.json:753,842,867`). El cross-check `xcheck2.js` lista los criterios cuya clase queda sin capturar: los 8 STOPP-A3, B21 (DIGOXINA), C1 (AAS), C3 (ANTIAGREGANTE), D8/D10 (BENZODIACEPINA), D11 (HIPNOTICO_Z), D15 (NEUROLEPTICO), H4 (CORTICOIDE_SISTEMICO), L6 (ANALGESICO_SIMPLE), M1×2 (ANTICOLINERGICO). Además 10 criterios se saltan por completo en `buildRelevance` (`system-relevance.ts:159`: A3×8, C1, D8) por no tener ninguna referencia extraíble.
- **Efecto:** hoy casi todas esas clases entran en la relevancia por otros criterios del mismo sistema (D9 aporta BENZODIACEPINA a snc, H5 aporta CORTICOIDE_SISTEMICO a osteo…), así que el impacto visible es limitado; pero `ANALGESICO_SIMPLE` (L6) no es aportado por ningún otro criterio, y el mecanismo es frágil: cualquier refactor que deje una clase solo en operadores custom la hará desaparecer silenciosamente de la visibilidad por sistema. Es exactamente la clase de regresión que los commits 1a49c0b/54f29f4 intentaron corregir a mano con los parches `relevance`.
- **Comprobación:** `extractReferences(crit('STOPP-D8-BENZODIACEPINA-USO-PROLONGADO').logic)` → `{classes: {}, dxs: {}}` pese a que la lógica gira sobre BENZODIACEPINA.

### A12 (MEDIA) — `excludes.medications` referencia fármacos inexistentes en el catálogo: Paroxetina y Fluvoxamina

- **Evidencia:** cross-check sobre `criteria.json:57` (A3-ISRS), `:457` (C12), `:593` (D7) vs `medications.ts` (la clase ISRS solo tiene Sertralina, Fluoxetina, Citalopram, Escitalopram). `getExcludedMedications` los ignora en silencio (`criteria-engine.service.ts:133-134`, `if (!probeMed) continue`).
- **Efecto:** datos muertos sin efecto funcional hoy, pero delatan la falta de un guard catálogo↔criterios: si mañana se elimina un fármaco del catálogo, sus exclusiones desaparecerán sin aviso. (El resto de ids de excludes y todas las clases de lógica/excludes cruzan limpio: 0 huérfanos adicionales.)
- **Comprobación:** `node xcheck.js` → sección «excludes.medications not in catalog» lista exactamente esas 6 entradas.

### A13 (MEDIA) — START-H2 no comprueba «a largo plazo» aunque el motor tiene operador de duración

- **Evidencia:** `src/assets/data/criteria.json:1584`. Summary: «recibe corticosteroides orales **a largo plazo** sin protección ósea»; la lógica solo pide `inDrugClass(CORTICOIDE_SISTEMICO)` y que falte bifosfonato **o** vitamina D. `medicationClassDurationAbove` existe y se usa en H4 (`criteria.json:971`) para el mismo fármaco.
- **Efecto:** una pauta corta de prednisona (p. ej. 5 días por reagudización EPOC) dispara la recomendación de iniciar bifosfonato + vitamina D + calcio.
- **Comprobación:** `evaluate({medications:[makeMed('Prednisona',['CORTICOIDE_SISTEMICO'],{durationDays:5})]}, [START-H2])` → dispara.

### A14 (MEDIA) — STOPP-I7: usa la clase ISRN completa (venlafaxina dispara un criterio específico de duloxetina) y es el único STOPP sin `excludes`

- **Evidencia:** `src/assets/data/criteria.json:1055-1059`. Lógica `inDrugClass(ISRN)`; el summary es específico de duloxetina. Venlafaxina (`medications.ts:80`) también dispara. Además es el único criterio STOPP del fichero sin bloque `excludes` (verificado por script), con lo que no greya nada, inconsistente con el patrón del resto.
- **Comprobación:** `evaluate({diagnoses:['incontinencia_urinaria_urgencia'], medications:[isrn('Venlafaxina')]}, [I7])` → dispara «Evitar duloxetina…».

### A15 (BAJA) — `normalizeCriterion`/`normalizeLogic` son código muerto que además deep-clona los 216 criterios en cada `evaluate`

- **Evidencia:** `criteria-engine.service.ts:82-97` solo minusculiza valores bajo las claves `drug_class` y `diagnosis`; **ninguna** de las dos claves existe en `criteria.json` (los criterios usan `inDrugClass`/`in`, verificado por grep). El coste real es `JSON.parse(JSON.stringify(c))` por criterio en cada evaluación (`:83`, llamado desde `:109` y `:123`).
- **Efecto:** sin efecto funcional (la insensibilidad a mayúsculas la garantizan los propios operadores, `:194,208,229` etc.); coste de CPU/GC evitable y código que sugiere una normalización que no ocurre.

### A16 (BAJA) — STOPP-B16 depende de `info.age` pero la UI no captura datos de paciente

- **Evidencia:** `criteria.json:280` usa `info.age ≥ 85`; `types.ts:8-16` define `PatientInfo`; no existe ningún componente que escriba `store.patient` con datos de formulario (rutas en `app.routes.ts:11-15`: solo diagnósticos, medicaciones e historial; únicos `patient.set` en `case-store.service.ts:27,99,132`).
- **Efecto:** B16 (y la parte de sexo de A2) solo puede dispararse con casos importados por JSON. Es frontera con Sección B (falta de formulario), pero afecta a la alcanzabilidad de criterios del motor.

### A17 (BAJA) — Comentarios de `dx-dependencies-overrides.ts` citan IDs STOPP equivocados

- **Evidencia:** `dx-dependencies-overrides.ts:9` («STOPP-B9: DIGOXINA; STOPP-B10: DIURETICO_ASA; STOPP-B11: AINE/CORTICOIDE» — B9 son tiazidas, B10 es asa+incontinencia, B11 es antihipertensivo central), `:29` («STOPP-B3: BETABLOQUEANTE» para Bradicardia — es B4), `:50` («STOPP-B1: ANTIHIPERTENSIVO_CENTRAL» — B1 es digoxina; sería B11). Las **clases** listadas son razonables; solo las citas de respaldo están mal, lo que invalida la promesa del encabezado («Cada clase está respaldada por un criterio STOPP… ID en comentario») y dificulta auditar los overrides.

### A18 (BAJA) — Comentario de `group-visibility.ts` contradice el código tras 1a49c0b (unitarios afloran por relevancia específica *global*, no del tab)

- **Evidencia:** `group-visibility.ts:105-106` dice «los unitarios solo afloran por relevancia ESPECÍFICA **del tab**», pero `:114-117` filtra `ownAll` con `globallySpecificClasses` (unión de clases específicas de **todos** los tabs, `:81-83`). Es el comportamiento que el commit 1a49c0b introdujo deliberadamente («se mantiene el grupo principal de los unitarios relevantes»), pero el comentario quedó sin actualizar; además `specificClasses` del tab (`:110-112`) ya solo se usa para foráneos unitarios (`:128`). Documentar o renombrar para que la próxima revisión no lo "corrija" en sentido contrario.
- Revisada la lógica multiclase nueva (`drugSurfacesByRelevance`, `:36-47`): correcta para fármacos de catálogo (usa todas las clases del fármaco) con fallback a `group.drugClass` para ids fuera de catálogo (`otro__*`); la deduplicación por fármaco (`seenForeignDrugIds`) y la priorización de coincidencia directa (`:136-139`) coinciden con lo descrito en el commit. Sin bugs detectados aquí más allá del comentario.

### A19 (BAJA) — Clases de catálogo que ningún criterio referencia: fármacos seleccionables pero inertes

- **Evidencia:** cross-check `xcheck.js`: clases sin referencia en lógica ni excludes: `AINE_COX2, ANTIANGINOSO, ANTIARITMICO_CLASE_IC, ANTIARITMICO_CLASE_III, ANTIEMETICO_5HT3, ANTIESPASMÓDICO, ANTIFUNGICO, ANTINEOPLASICO, ANTIPALUDICO, CALCIO, CALCIOANTAGONISTA_DHP, ESTABILIZADOR_ANIMO, INMUNOSUPRESOR, MACROLIDO, QUINOLONA, RELAJANTE_MUSCULAR`. La mayoría son inofensivas (el fármaco porta otra clase sí evaluada: p. ej. macrólidos vía PROLONGADOR_QTC/INHIBIDOR_GLUCOPROTEINA_P). Pero **Amlodipino, Nifedipino, Lercanidipino, Nitrendipino, Felodipino** (solo `CALCIOANTAGONISTA_DHP`, `medications.ts:313-317`) y **Carbonato/Citrato cálcico** (solo `CALCIO`, `medications.ts:379-380`) no pueden disparar ni ser excluidos por ningún criterio: son puramente decorativos en el motor. Llama la atención en STOPP-K3 (vasodilatadores/caídas) y B20, donde los DHP podrían ser clínicamente pertinentes, y en START-H2, cuyo summary menciona «con calcio» sin evaluar la clase CALCIO.

### A20 (BAJA) — Cobertura desigual de la familia de variantes HTA entre criterios

- **Evidencia:** la familia mutex HTA (`diagnosis-variants.ts:22-28`) hace que el usuario elija UNA de {`hta`, `hta_no_complicada`, `hipertension_moderada`, `hipertension_grave`}. Pero los criterios cubren subconjuntos distintos: B7 y B10 y K9 aceptan las 4 (`criteria.json:152,200,1242`); B5 solo `hta|hta_no_complicada` (`:136`); B11 las 4 (`:208`); START-B1 las 4 (`:1346`). Consecuencia: quien marca «HTA moderada» no dispara B5 (evitar betabloqueante en HTA no complicada — discutible pero probablemente deseado), y quien marca «HTA (sin especificar)» dispara B5 aunque pudiera tratarse de HTA complicada. No hay una regla documentada de qué variantes debe listar cada criterio; cada uno improvisa su `or`.

---

## Mejoras propuestas (no bugs), priorizadas

1. **Guard automático catálogo↔criterios** (previene A8, A12, A19 y regresiones futuras): extender `scripts/audit-criteria.cjs` o añadir una spec de datos que falle si (a) un id de `excludes.medications` no existe en `MEDICATIONS`, (b) una clase usada en lógica/excludes no tiene miembros, (c) un código de `DIAGNOSIS_MAP` no es referenciado por ningún criterio (lista blanca explícita para los informativos tipo `aneurisma_aortico`, si se decide conservarlos).
2. **Enseñar a `extractReferences` los operadores custom** (`multiple*`, `medicationClass*`, `digoxinaDosisAlta`) y retirar los parches ad hoc `relevance.medicationClasses` de E1/F2/F4 (A11). Una tabla operador→clase como la del cross-check basta; elimina toda una categoría de incoherencias de visibilidad.
3. **Eliminar `normalizeCriterion`/`normalizeLogic`** (A15) o convertirlas en validación única en `loadCriteria`; evita 216 deep-clones por evaluación.
4. **Tipar las clases farmacológicas**: `Med.drugClasses: string[]` (`types.ts:21`) admite typos silenciosos (nótese `ANTIESPASMÓDICO` con tilde como id de clase, `medications.ts:344-347`, que funciona pero es frágil). Derivar un union type `DrugClass` del catálogo y usarlo en `Med`, `DrugGroup.drugClass` y `Crit.excludes.drugClasses`.
5. **Unificar `caidas_repeticion` / `riesgo_caidas_repeticion`** (A9): o bien un solo código, o declarar familia/alias en `diagnosis-variants.ts` y que los criterios K acepten ambos con un `or` uniforme.
6. **Política uniforme de variantes HTA** (A20): documentar en `docs/motor-criterios.md` qué variantes debe listar cada criterio con HTA y aplicar la misma lista (o resolver por familia: «variante X implica ancla»).
7. **Retirar o conectar los checkbox inertes** «Prostatismo / Retención urinaria» y «Aneurisma aórtico» (A8): la opción barata es mapear el combinado a dos códigos al guardar; la limpia, eliminarlo del catálogo (existen los individuales).
8. **`additionalCategories`**: ya no existe en el código de producción; solo queda la spec de guarda `medications-taxonomy.spec.ts:16-18` que impide su reintroducción. Nada que limpiar aparte de saberlo (el punto 4 del manifiesto queda respondido: purgado).
9. **Deduplicar los sistemas `Síntoma` y `Sintomático`** en `DIAGNOSIS_GROUPS` (`diagnoses.ts:91-93,107,115`) — hoy generan dos grupos distintos dentro del tab «Otros» (`diagnoses-taxonomy.ts:41-42,45-55`) para el mismo concepto.
10. **Formulario de paciente (edad/sexo)** o retirada de B16/I3/I4 del fichero de criterios mientras no exista (A2/A16); decisión conjunta con Sección B.

## Cobertura de tests observada (contexto, no hallazgo)

Solo existen specs por sección para A–H y L; las secciones I, J, K y M de criteria.json no tienen spec propia (`src/app/core/services/criteria-*.spec.ts`), y justamente ahí se concentran A2 (I3/I4), A6 (J3), A9 (K8/K11) y A14 (I7). Priorizar specs de I/J/K/M al corregir.

---

## Adenda (2026-07-18) — tras la ronda d10-d11-h4-l6-campos-multitab

La ronda correctiva `docs/revisiones/revision-d10-d11-h4-l6-campos-multitab-resultado.md`
(verificada por el orquestador: diff revisado + suite completa **669 SUCCESS**)
tocó el alcance de esta sección. Impacto sobre los hallazgos:

- **A11 (parcialmente mitigado, sigue abierto):** el parche ad hoc
  `relevance.medicationClasses` cubre ahora **4** criterios (E1, F2, F4 y
  **L6**, `criteria.json:1313`). El caso concreto que citaba este hallazgo
  como único con impacto visible (`ANALGESICO_SIMPLE`/L6 no aportado por
  ningún otro criterio) queda resuelto vía parche. El problema estructural
  persiste: `extractReferences` de `system-relevance.ts:72-99` sigue sin
  entender los operadores custom, y la lista de ~19 criterios afectados solo
  baja en uno. Además, el fix A1/A2 de esa ronda enseñó
  `medicationClassDurationAbove` al extractor **de dx-dependencies**
  (`dx-dependencies.ts:35-39`) — es el extractor gemelo, no el de
  system-relevance: la mejora propuesta nº 2 sigue pendiente y ahora hay
  precedente de cómo hacerla.
- **Dato nuevo:** STOPP-L6 cambió `system` de `"Analgésicos"` a
  `"Sistema musculoesquelético"` (`criteria.json:1312`), coherente con el
  patrón E1. No invalida ningún hallazgo de este informe.
- El resto de hallazgos A1–A20 **no se ven afectados** (verificado:
  `system-relevance.ts`, `criteria-engine.service.ts` y el resto de
  `criteria.json` no cambiaron en esa ronda).
