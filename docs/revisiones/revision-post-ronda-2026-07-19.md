

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

### 3. MEDIA — STOPP-L5-GABAPENTINOIDE penaliza indicaciones legítimas (`criteria.json:1304`)

Lógica: `GABAPENTINOIDE AND NOT dolor_neuropatico`, sin exceptuar otras
indicaciones. Confirmado: epilepsia + gabapentina → dispara "evitar
gabapentinoides para dolor no neuropático" (gabapentina es antiepiléptico
de pleno derecho, pero en el catálogo solo lleva `GABAPENTINOIDE`); y
ansiedad_grave + pregabalina → dispara L5 mientras START-D5 recomienda
explícitamente pregabalina para esa misma condición (`criteria.json:1463`) —
el motor puede recomendar y penalizar el mismo fármaco a la vez.

**Fix sugerido:** negar también `epilepsia` y `ansiedad_grave` en L5.

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
- I3 (`criteria.json:1032`): el summary exige "volumen residual &gt; 200 ml"
que no se modela (dispara con cualquier HBP + antimuscarínico);
probablemente simplificación deliberada al no existir ese dato capturable.



---





