# Revisión post-ronda — 2026-07-19

> Análisis de verificación tras el cierre de la ronda general 2026-07-17
> (48 hallazgos, 4 secciones). Solo análisis: no se aplicó ningún fix.
> Realizado por agente revisor adversarial; hallazgos de motor confirmados
> ejecutando json-logic real contra `criteria.json`.

## Estado de verificación

- Suite: **807/807 SUCCESS** (`npx ng test --watch=false --browsers=ChromeHeadless`)
- Typecheck: limpio (`npx tsc --noEmit`, exit 0)
- Fixes A1–A15 y B1–B15 verificados uno a uno en el código resultante:
  **ninguna regresión detectable** en `30d153b..40404c9`.

## Hallazgos

### 1. MEDIA — STOPP-K8 no cubre ISRN (`criteria.json:1224`, `:1232`)

Un paciente con ISRN y caídas de repetición no dispara ningún criterio STOPP.
Confirmado empíricamente: `{diagnoses:['caidas_repeticion'], meds:[Venlafaxina(ISRN)]}`
solo dispara START-H5 (vitamina D). Causa doble: K8-ISRS dice en su summary
"Evitar ISRS e ISRN" pero su lógica solo evalúa `inDrugClass(ISRS)`; y
K8-PSICOTROPICO dice "psicotrópicos (antidepresivos, litio)" pero ningún
antidepresivo del catálogo lleva la clase `PSICOTROPICO` (solo litio y
neurolépticos, `medications.ts:80-91`). Los `excludes` de ambos sí listan
Venlafaxina/Duloxetina/ISRN — aspiracional, nunca activable por esa vía.
Distinto del A9 ya corregido (aquel era el código de caídas).

**Fix sugerido:** añadir `{"inDrugClass":["ISRN",...]}` al `or` de K8-ISRS
(o dar la clase PSICOTROPICO a los antidepresivos — decisión de taxonomía).

### 2. MEDIA — Excepciones renales ignoran equivalencias diagnósticas

Afecta a STOPP-C11 (`criteria.json:448`), START-B7 (`:1386`), START-D6
(`:1470`), START-E4 (`:1505`) y START-J1 (`:1659`). Leen
`labs.egfr_ml_min_173` crudo con semántica "null → pasa", ignorando las
equivalencias que el propio motor define en `egfrBelow`
(`criteria-engine.service.ts:243-258`: `enfermedad_renal_grave` ≡ TFGe<30,
`insuficiencia_renal_terminal` ≡ TFGe<15). Escenarios confirmados:

- FA + warfarina + dx `insuficiencia_renal_terminal` sin analítica → C11
  dispara recomendando cambiar a ACOD, justo el caso que su summary exceptúa
  (ACOD contraindicado en ERT).
- IC-FE-reducida + dx `enfermedad_renal_grave` sin analítica → START-B7
  recomienda espironolactona, que si se añade dispara STOPP-E7
  (contradicción directa).

**Fix sugerido:** sustituir la cláusula de labs por
`{"!":{"egfrBelow":[umbral,{"var":""}]}}` en esos cinco criterios.

### 3. MEDIA — STOPP-L5-GABAPENTINOIDE penaliza indicaciones legítimas (`criteria.json:1304`)

Lógica: `GABAPENTINOIDE AND NOT dolor_neuropatico`, sin exceptuar otras
indicaciones. Confirmado: epilepsia + gabapentina → dispara "evitar
gabapentinoides para dolor no neuropático" (gabapentina es antiepiléptico
de pleno derecho, pero en el catálogo solo lleva `GABAPENTINOIDE`); y
ansiedad_grave + pregabalina → dispara L5 mientras START-D5 recomienda
explícitamente pregabalina para esa misma condición (`criteria.json:1463`) —
el motor puede recomendar y penalizar el mismo fármaco a la vez.

**Fix sugerido:** negar también `epilepsia` y `ansiedad_grave` en L5.

### 4. MEDIA — START-D4-RIVASTIGMINA dispara en Parkinson sin demencia (`criteria.json:1456`)

Summary: "demencia por cuerpos de Lewy o demencia asociada a Parkinson".
Lógica: `demencia_cuerpos_lewy OR parkinson` a secas. Confirmado: Parkinson
sin deterioro cognitivo → recomienda iniciar rivastigmina (falso positivo
clínico; los IACE no están indicados en Parkinson no demenciado).

**Fix sugerido:** `parkinson AND (demencia OR deterioro_cognitivo)` o crear
el dx `demencia_asociada_parkinson`.

### 5. MEDIA — START-B1 no reconoce todos los antihipertensivos (`criteria.json:1344`)

Solo niega 6 clases (IECA, ARA2, BB, tiazida, no-DHP, central). Confirmado:
HTA + amlodipino → dispara "considerar iniciar antihipertensivo" con el
paciente ya tratado con un fármaco de primera línea. Igual con furosemida
(STOPP-B7 la penaliza en HTA, pero START-B1 además pide *añadir* otro
fármaco), doxazosina y sacubitrilo/valsartán. Consecuencia visible del
hallazgo conocido "DHP decorativas" (informe A), que se señaló para K3/B20
pero no para START-B1.

**Fix sugerido:** añadir `CALCIOANTAGONISTA_DHP`, `DIURETICO_ASA`,
`ALFABLOQUEANTE` y `SACUBITRILO_VALSARTAN` a las negaciones.

### 6. MEDIA — Doc del motor desactualizado tras A15 (`docs/motor-criterios.md:49-50, 131-135, 252-253, 278`)

El doc `@linked` sigue describiendo `normalizeCriterion`/`normalizeLogic`
como paso obligatorio ("Nunca se evalúa con datos sin normalizar", "los
campos drug_class y diagnosis de los criterios se normalizan
recursivamente"), pero el fix A15 (`d2ac74b`) las eliminó — cero apariciones
en `src/`. Quien añada un criterio con códigos de diagnóstico en mayúsculas
fiándose del doc obtendrá un criterio que **nunca dispara silenciosamente**
(la tolerancia a mayúsculas vive hoy solo en los operadores custom y en los
literales del JSON). El propio fuente exige actualizar el doc
(`criteria-engine.service.ts:2-3`). Única contradicción doc↔código grave
encontrada.

**Fix sugerido:** reescribir flujo e invariantes del doc: la normalización
de criterios ya no existe; los árboles json-logic deben escribirse con
diagnósticos en minúscula.

### 7. BAJA — STOPP-D4 etiquetado en el sistema equivocado (`criteria.json:550`)

Criterio puramente cardiovascular (betabloqueante + bloqueo AV) etiquetado
con `system: "Sistema nervioso central"`; en el agrupado por sistema del
informe/PDF/UI aparece bajo SNC. Parece relleno del hueco de B4 archivado
en la sección equivocada.

**Fix sugerido:** `system: "Sistema cardiovascular"` (y valorar renombrar
el id a B4).

### 8. BAJA — STOPP-F3 promete "antiácidos con aluminio" inexistentes (`criteria.json:855`)

El summary los menciona pero no existe esa clase en el catálogo ni en la
lógica (mismo patrón que A3/B20 ya corregidos: summary > lógica).

**Fix sugerido:** recortar el summary o añadir la clase con miembros.

### 9. BAJA/DUDOSO — Zod no normaliza casing de `drugClasses` (`case-export.schema.ts:21`, `clinical-capture.ts:70`)

El schema valida `drugClasses` como `string[]` sin normalizar casing ni
pertenencia al vocabulario. El motor es tolerante (lowercasea), pero la UI
compara case-sensitive: un caso importado con `"benzodiacepina"` en
minúscula dispara D8 correctamente pero no muestra el campo de duración
(`CAPTURE_SPECS_BY_CLASS` exige mayúsculas), y `customDrugsFor` /
`isMedGroupChecked` tampoco lo reconocen. DUDOSO porque solo afecta a JSON
escritos a mano (el round-trip export→import conserva mayúsculas).

**Fix sugerido:** `.transform(c => c.toUpperCase())` en el schema o
validación contra el vocabulario de clases.

### 10. BAJA — Aserción de tipo falsa en normalización de sexo (`criteria-engine.service.ts:72-74`)

`input.info.sex.toLowerCase() as typeof input.info.sex` es una aserción
falsa (`'f'|'m'` no pertenece a `'F'|'M'|null`); compila pero contradice la
norma de no usar aserciones sin justificar y dejaría pasar sin error un
futuro `=== 'F'` sobre el caso normalizado. Además `sex === null` no cubre
`undefined` (solo alcanzable con localStorage legacy corrupto).

**Fix sugerido:** comparar con `== null` y tipar la salida como
`Lowercase<Sex> | null`.

### 11. DUDOSO (informativo) — STOPP-B5 y STOPP-I3

- B5 (`criteria.json:136`): HTA genérica + cardiopatía isquémica +
  bisoprolol dispara "evitar betabloqueante en HTA no complicada" pese a
  existir indicación imperiosa que START-B4 recomienda. La política de
  variantes HTA quedó decidida en el test A20
  (`criteria-data-integrity.spec.ts:149`); tocarlo es decisión clínica.
- I3 (`criteria.json:1032`): el summary exige "volumen residual > 200 ml"
  que no se modela (dispara con cualquier HBP + antimuscarínico);
  probablemente simplificación deliberada al no existir ese dato capturable.

## No reportado (ya decidido/abierto por el usuario)

H4 (corticoide vs AR), checklist CV sin fusionar, B16/I3/I4 solo alcanzables
por import (sin formulario de edad/sexo), A11 estructural
(`extractReferences`), checkbox `aneurisma_aortico` inerte (whitelisted en
el guard de integridad).

## Veredicto global

**El proyecto está sano tras la ronda.** Suite en verde, typecheck limpio,
los 48 fixes aplicados de forma coherente y sin regresiones. Lo que queda es
de segunda línea: criterios cuyo alcance real difiere del que anuncian sus
summaries (hallazgos 1–5, confirmados ejecutando el motor) y el doc del
motor desactualizado tras A15 (hallazgo 6). Ninguno bloquea; los hallazgos
**1, 2 y 6** merecen entrar en la próxima ronda correctiva.

---

## Adenda (2026-07-19) — hallazgos 2, 4 y 5 CORREGIDOS

Fixes aplicados y verificados por el orquestador de revisión sobre el diff
real y la suite completa (**835 SUCCESS**, +28 tests):

| Hallazgo | Fix aplicado | Verificación |
|----------|--------------|--------------|
| **2 — equivalencias renales** | Los 5 criterios (STOPP-C11, START-B7, START-D6, START-E4, START-J1) sustituyen la lectura cruda de `labs.egfr_ml_min_173` por `{"!":{"egfrBelow":[umbral,{"var":""}]}}` — C11 con umbral 15 (ERT), los otros cuatro con 30 | Lógica confirmada en `criteria.json`; los dos escenarios contradictorios del hallazgo (C11+ERT por dx, B7+ERC grave por dx) cubiertos en specs de criteria-b/c/e/j |
| **4 — START-D4 rivastigmina** | Lógica ahora `demencia_cuerpos_lewy OR (parkinson AND (demencia OR deterioro_cognitivo))`; ambos códigos existen en `DIAGNOSIS_MAP` | Parkinson sin deterioro ya no dispara; tests en criteria-d.spec |
| **5 — START-B1 antihipertensivos** | Negaciones ampliadas de 6 a 10 clases: + `DIURETICO_ASA`, `CALCIOANTAGONISTA_DHP`, `ALFABLOQUEANTE`, `SACUBITRILO_VALSARTAN` (fármaco añadido al catálogo, `medications.ts:400`) | HTA + amlodipino/furosemida/doxazosina ya no piden iniciar otro antihipertensivo; tests en criteria-b.spec |

Ajuste derivado: `CALCIOANTAGONISTA_DHP` retirada de la lista blanca de
clases decorativas en `criteria-data-integrity.spec.ts:84` — el guard (d)
falló exactamente como está diseñado al pasar la clase de decorativa a
referenciada. Las DHP dejan de ser inertes en el motor.

**Siguen abiertos:** 1 (K8/ISRN), 3 (L5 gabapentinoides), 6 (doc del motor
tras A15) — prioritarios para la próxima tanda — y 7–11 (bajas/dudosos).

## Adenda 2 (2026-07-19) — hallazgos 6, 7 y 8 CORREGIDOS

Verificados por el orquestador (diff + suite completa **837 SUCCESS** +
`check-links.sh` en 0):

| Hallazgo | Fix aplicado | Verificación |
|----------|--------------|--------------|
| **6 — doc del motor** | `docs/motor-criterios.md` reescrito: solo se normaliza el paciente (`normalizeCase`); documenta explícitamente que `normalizeCriterion`/`normalizeLogic` no existen y que los literales del JSON van en minúscula (con la consecuencia: un literal en mayúsculas nunca dispara) | Única mención restante es la negativa deliberada; invariantes en líneas 130-140, 256, 282 |
| **7 — STOPP-D4 mal etiquetado** | `system` → `"Sistema cardiovascular"`. No se renombró a B4 (ese id ya lo ocupa la bradicardia) | La suite cubre el reagrupado; relevancia por sistema recalculada sin regresiones |
| **8 — STOPP-F3 summary** | Summary alineado con la lógica real: hierro oral, opioides y calcioantagonistas no-DHP; fuera los "antiácidos con aluminio" inexistentes | Lógica sin cambios; specs de criteria-f actualizadas |

**Quedan abiertos:** 1 (K8/ISRN), 3 (L5 gabapentinoides) — los dos últimos
de las medias — y los bajos/dudosos 9, 10, 11.
