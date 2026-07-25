# Revisión previa de los 57 criterios START — 2026-07-19

> Revisión automática del bloque START de `criteria.json` contra el checklist
> clínico del usuario (secciones A–L, 57 ítems), previa a su prueba manual.
> Hallazgos confirmados evaluando json-logic real contra el catálogo.
>
> **Estado 2026-07-19 (tras decisión del usuario):** CORREGIDOS los hallazgos
> §2 (B8 acepta FE preservada e IC grave), §4 (E1/E2/E3 usan `egfrBelow`),
> §5 (H5 pasa a conjunción, con dx nuevo «No sale de casa»), §9 (K1 excluye
> «Dolor crónico de la artrosis») y §7-B2 (estatina exceptúa `fragilidad`).
> §3 resuelto: el paso de medicación ya captura **todas** las analíticas que
> consumen los criterios, derivadas de `relevance.labsByTab`. §7 (resto de
> matices) documentado como simplificación deliberada en `catalogo-clinico.md`.
> §1 y §6 siguen abiertos. Suite: 885 SUCCESS.

**Recuento:** el JSON tiene **52 criterios START** (49 en la revisión original,
+3 el 2026-07-25 al implementar G3, H6 y H7); el checklist enumera **57**.
Faltan 5: A1 y las cuatro vacunas (detalle en §1).

## 1. ALTA — 8 criterios del checklist que NO existían en el catálogo (quedan 5)

| Checklist | Descripción | Estado |
|---|---|---|
| A1 | Medicamento indicado, adecuado y sin contraindicación, no iniciado | Ausente (probablemente no modelable: es juicio clínico puro, no una regla fármaco↔dx) |
| G3 | Oxigenoterapia domiciliaria en hipoxemia crónica documentada | **IMPLEMENTADO 2026-07-25**: dx «Hipoxemia crónica documentada (pO2 < 60 mmHg o SatO2 < 89%)» (`hipoxemia_cronica`) + clase `OXIGENOTERAPIA` con el ítem «Oxigenoterapia domiciliaria» en el tab Respiratorio |
| H6 | Antirresortivo tras retirada de denosumab (≥2 dosis) | **IMPLEMENTADO 2026-07-25**: dx «Retirada de denosumab tras 2 o más dosis» (`retirada_denosumab`) |
| H7 | Antirresortivo tras retirada de teriparatida/abaloparatida | **IMPLEMENTADO 2026-07-25**: dx «Retirada de teriparatida o abaloparatida» (`retirada_anabolizante_oseo`) + Abaloparatida en el catálogo |
| L1 | Vacuna antigripal anual | **FUERA DE ALCANCE (decisión 2026-07-25)** |
| L2 | Vacuna antineumocócica al menos una vez | **FUERA DE ALCANCE (decisión 2026-07-25)** |
| L3 | Vacuna varicela-zóster | **FUERA DE ALCANCE (decisión 2026-07-25)** |
| L4 | Vacuna SARS-CoV-2 | **FUERA DE ALCANCE (decisión 2026-07-25)** |

H6 y H7 se resolvieron modelando la retirada como un diagnóstico marcable más,
sin mecanismo nuevo. G3 resolvió la duda sobre "medicaciones" no farmacológicas:
una clase como `OXIGENOTERAPIA` es viable y no necesita mecanismo aparte.

Quedan fuera dos bloques, por decisión explícita y no por olvido:

- **A1**: no modelable. Es juicio clínico puro («el fármaco está indicado y no se
  ha iniciado»), no una regla fármaco↔dx que el motor pueda evaluar.
- **L1–L4 (vacunas)**: **fuera de alcance del TFG**. Eran implementables — el
  patrón de G3 daba el interruptor de "ya vacunado" con una categoría «Vacunas
  administradas» en el paso de medicación— pero se descartó. Dos razones: son
  recomendaciones universales que dispararían en todo paciente hasta marcarlas,
  y **L1 es anual**, algo que el modelo no sabe representar: una casilla marcada
  no distingue "vacunado esta temporada" de "vacunado hace tres años", así que el
  criterio se apagaría para siempre. L2, L3 y L4 no tienen ese problema, pero se
  dejan fuera con L1 para no partir la sección.

**Para la prueba manual: no busques L1–L4 ni A1. No están y no van a estar.**
El bloque START se queda en **52 de 57** deliberadamente.

### Nota sobre I3 e I4 (2026-07-25)

Ambos exigían `info.sex == "f"`. La app no tiene formulario de sexo —
`case-store.service.ts:10` inicializa `patient` a `null` y solo se rellena vía
`loadCase()`, es decir importando un JSON escrito a mano— así que la cláusula
los volvía inalcanzables desde la interfaz. **Decisión del usuario: se retira la
comprobación de sexo.** El matiz «en mujeres» queda en el `summary`, que el
clínico ve en la alerta.

Efecto secundario a vigilar: I4 (estrógenos vaginales para prevenir ITU
recurrentes) ya no distingue sexo, y «Infecciones urinarias recurrentes» no es
un diagnóstico exclusivo de mujeres, así que puede aparecer en un varón. En I3
el riesgo es nulo porque la vaginitis atrófica ya lo es de por sí. Si se añade
el formulario de edad/sexo (§3), conviene reponer la cláusula en I4.
**Decisión clínica pendiente:** ¿se implementan o se documentan como fuera de
alcance? Si es lo segundo, conviene anotarlo en el checklist para que la
prueba manual no los busque.

## 2. ALTA — IC con FE preservada no dispara NINGÚN criterio (`criteria.json:1385`)

START-B8 dice en su summary "insuficiencia cardíaca sintomática (FEVI reducida
o **preservada**)" y el checklist lo confirma, pero la lógica solo acepta
`insuficiencia_cardiaca` e `insuficiencia_cardiaca_fe_reducida`. El dx
«Insuficiencia cardíaca con función sistólica conservada»
(`ic_funcion_sistolica_conservada`) existe en el catálogo y lo usa STOPP-J2.

Verificado: un paciente con `ic_funcion_sistolica_conservada` y sin medicación
**no dispara absolutamente ningún criterio** (ni START ni STOPP).

**Fix sugerido:** añadir `ic_funcion_sistolica_conservada` al `or` de B8.
Valorar también `insuficiencia_cardiaca_grave`, que está igual de huérfano.

## 3. ALTA — START-E1 es inalcanzable desde la interfaz (`criteria.json:1476`)

E1 exige `labs.calcio_corregido_mmol_l < 2.1`, y **el único campo de analítica
que la UI permite introducir es la TFGe** (`meds-step.component.html:144-154`).
El resto de labs del modelo (calcio, TSH, sodio, potasio, PAS, PAD, FC, QTc)
existen en `types.ts` y en el schema Zod, pero no tienen input: solo se pueden
rellenar importando un JSON escrito a mano.

Criterios afectados por esta misma causa (además de E1):

- **START-B1**: sus ramas `pas_mmhg > 140` / `pad_mmhg > 90` son inalcanzables;
  el criterio solo dispara por los dx de HTA. Funciona, pero la mitad de su
  lógica es letra muerta.
- STOPP (fuera del alcance de esta revisión, misma raíz): B4 y D17 (FC),
  B9 (calcio/sodio/potasio), B12 (potasio), B14 (PAS), B15 (QTc), D6 (sodio),
  J9 (TSH).

**Fix sugerido:** ampliar el panel de datos clínicos con los labs que los
criterios consumen (idealmente mostrando en cada tab los relevantes, igual que
hoy se muestra TFGe en el tab renal). Es la misma familia de decisión que el
formulario de edad/sexo que quedó pendiente.

## 4. MEDIA — START-E1/E2/E3 ignoran las equivalencias renales (`:1476`, `:1483`, `:1490`)

Los tres exigen `labs.egfr_ml_min_173 != null AND < 30` en crudo, en vez de
usar el operador `egfrBelow`, que traduce los diagnósticos
`enfermedad_renal_grave` (≡ TFGe<30) e `insuficiencia_renal_terminal` (≡<15).

Verificado: un paciente con dx «Enfermedad renal grave» + hiperfosfatemia +
anemia sintomática + hiperparatiroidismo secundario, **sin analítica
introducida, no dispara E1, E2 ni E3**. Es el mismo defecto que ya se corrigió
en C11/B7/D6/E4/J1; a estos tres se les pasó por alto porque la comparación
está escrita en la forma "≠ null y <" en vez de "= null o ≥".

**Fix sugerido:** sustituir las dos cláusulas de labs por
`{"egfrBelow":[30,{"var":""}]}` en E1, E2 y E3.

## 5. MEDIA — START-H5 recomienda vitamina D con solo tener caídas (`criteria.json:1595`)

El checklist dice "déficit **confirmado** de vitamina D **+** riesgo (no sale de
casa, caídas, osteopenia)": es una conjunción. La lógica usa un `or` plano
entre `deficit_vitamina_d`, `caidas_repeticion` y `osteopenia`.

Verificado: un paciente con **solo** «Caídas de repetición» y sin medicación
dispara H5 (es lo que apareció como único resultado al probar el caso de K8 con
venlafaxina). Igual con solo «Osteopenia».

**Fix sugerido:** `deficit_vitamina_d AND (caidas_repeticion OR osteopenia OR
no_sale_de_casa)`. Falta el dx "no sale de casa / confinado en domicilio", que
habría que crear si se quiere cubrir el tercer factor de riesgo del checklist.
**Consultar con Raquel**: es posible que la intención fuese la disyunción (la
suplementación de vitamina D es de bajo riesgo), pero entonces el texto del
criterio debería cambiar, no la lógica.

## 6. BAJA — START-H9 se ancla a ANTIMETABOLITO en vez de a metotrexato (`criteria.json:1609`)

Hoy funciona porque Metotrexato es el único fármaco con la clase
`ANTIMETABOLITO`, pero el criterio es "ácido fólico **con metotrexato**". En
cuanto se añada otro antimetabolito (capecitabina, azatioprina…) el criterio
recomendará ácido fólico donde no procede.

**Fix sugerido:** anclar a `{"in":["Metotrexato",{"var":"medications"}]}` por id,
o crear una clase específica. Sin urgencia.

## 7. BAJA — Criterios cuyo alcance real es más ancho que su enunciado

Mismo patrón en varios START: el checklist matiza con un adjetivo que la lógica
no modela porque no existe el dx correspondiente. Ninguno es un bug funcional,
pero conviene decidir si se documentan como simplificación deliberada:

- **B2** (estatina): "salvo final de vida/fragilidad grave" — no se exceptúa
  `fragilidad`, que sí existe en el catálogo. Es el más fácil de corregir.
- **B1**: el umbral relajado ">150/90 si fragilidad moderada-grave" no se modela.
- **B4**: "cardiopatía isquémica **sintomática**" → usa `cardiopatia_isquemica`
  a secas, luego B3 y B4 disparan siempre juntos.
- **D3**: "Alzheimer **leve-moderado**" → usa `alzheimer` a secas.
- **H1**: "artritis reumatoide crónica activa **incapacitante**" → usa
  `artritis_reumatoide_activa`.
- **D1**: "Parkinson con **deterioro funcional**" → usa `parkinson` a secas.
- **I5**: "disfunción eréctil **que causa sufrimiento**" → dx a secas.

## 8. BAJA/DUDOSO — START-B6 y el betabloqueante no cardioselectivo (`criteria.json:1371`)

B6 pide betabloqueante cardioselectivo en IC-FEr, y no dispara si el paciente
ya toma uno **no** cardioselectivo. Verificado: IC-FEr + propranolol → B6 no
salta. Clínicamente cabría recomendar el cambio a cardioselectivo, pero
carvedilol (no cardioselectivo) **sí** está indicado en IC, así que la
implementación actual es defendible. Lo dejo como nota, no como fix.

## 9. Coherencia con el cambio de hoy en L4 — START-K1 (`criteria.json:1658`)

K1 excluye `artrosis` ("dolor moderado-grave **no artrósico**"). Ahora que
existe el dx «Dolor crónico de la artrosis» (`dolor_cronico_artrosis`), conviene
excluirlo también, o un paciente con ambos dx recibirá la recomendación de
opioide que el criterio quiere evitar.

**Fix sugerido:** añadir `{"!":{"in":["dolor_cronico_artrosis",…]}}` al `and`.

## 10. ALTA — El gating de diagnósticos bloqueaba 6 criterios START (CORREGIDO 2026-07-25)

Detectado al revisar START-H1. `buildDxDependencies` deriva el gating de la UI
desde los criterios STOPP: un diagnóstico solo se puede marcar si el paciente ya
tiene marcado alguno de los fármacos que lo citan. Eso es correcto para STOPP
(«fármaco + dx → alerta») pero invierte el sentido de START («dx + fármaco
ausente → recomendar iniciarlo»): el diagnóstico quedaba inalcanzable justo para
el paciente al que apunta el criterio.

Diagnósticos afectados y criterio START que bloqueaban:

| Diagnóstico | Gateado por | START bloqueado |
|---|---|---|
| Artritis reumatoide activa incapacitante | AINE, CORTICOIDE_SISTEMICO (STOPP-H7) | H1 |
| HTA / no complicada / moderada / grave | override manual (H2, D3, K9, C2, I6) | B1 |
| IC con función sistólica conservada | override manual (B9, B10, B11, J2) | B8 |
| Insuficiencia cardíaca grave | override manual (B14: PDE5, NITRATO) | B8 |
| EPOC grave | derivado de STOPP | G2 |
| Riesgo de caídas de repetición | override manual (K8, K11) | H5 |
| Dolor moderado-grave | OPIOIDE (STOPP-L) | K1 |

Nota: **§2 de este mismo informe corrigió la lógica de B8 para que aceptara la FE
preservada, pero el diagnóstico seguía sin poder marcarse** sin fármaco previo, así
que el fix no era observable desde la interfaz.

**Fix aplicado:** `startRequiredLabels(criteria)` en `dx-dependencies.ts` calcula
los labels exigidos en positivo por algún START y `buildDxDependencies` los
elimina del mapa final, derivados y overrides incluidos. Es una regla general, no
una lista manual: al añadir un criterio START nuevo la exención se aplica sola.
Un test-guard enumera los labels esperados para que un cambio de catálogo que los
vuelva a bloquear falle. Los overrides de esos labels quedan inertes pero se
conservan (ver comentario en `dx-dependencies-overrides.ts`).

Efecto en la UI: esas casillas pasan a estar siempre habilitadas. Suite 910 SUCCESS.

## Resto de criterios: sin defecto detectado

B3, B5, B7, B9, B10, B11, C1, C2, D2, D4 (corregido hoy), D5, D6, D7, E4, F1,
F2, F3, F4, F5, F6, F7, G1, G2, H2, H3, H4, H8, I1, I2, I3, I4, I5, J1, K2, K3
evalúan lo que anuncian. Nota sobre I3/I4: comparan `info.sex` con `"f"` y el
motor normaliza a minúscula, así que la comparación es correcta, pero **siguen
siendo inalcanzables desde la UI** porque no existe formulario de edad/sexo
(decisión ya conocida y pendiente).

## Prioridad sugerida

1. **§2** (IC preservada sin ningún criterio) y **§4** (equivalencias renales en
   E1/E2/E3): son bugs del mismo tipo que ya se corrigieron en otros criterios,
   con fix mecánico y test directo.
2. **§9** (K1 con el dx nuevo): coherencia con el cambio de hoy, trivial.
3. **§5** (H5) y **§7-B2** (fragilidad): requieren confirmación clínica.
4. **§3** (labs no capturables) y **§1** (los 8 ausentes): son decisiones de
   alcance del TFG, no fixes puntuales.
