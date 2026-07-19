# Plan de corrección — QA manual secciones I–M (2026-07-19)

> Origen: prueba manual del usuario sobre el checklist de las secciones I, J, K,
> L y M. Cada hallazgo se ha verificado contra `criteria.json`, el catálogo
> (`diagnoses.ts`, `medications.ts`, `medications-taxonomy.ts`), el gating
> (`dx-dependencies.ts`, `dx-anchor-labels-candidate.ts`) y la relevancia
> (`system-relevance.ts`).
>
> **Estado 2026-07-19:** Fase 1 + Fase 2 aplicadas (TDD). Fase 3 decidida y
> aplicada: L4 usa el dx nuevo «Dolor crónico de la artrosis» (también añadido
> al `or` de L5), L6 se mantiene condicionado a dosis («Hepatopatía crónica»
> está en tab Otros → Hepático, no sombreada), y el label de HBP pasa a
> «Hiperplasia benigna de próstata (síntomas prostáticos)». Checklists de
> prueba manual regenerados con `gen-checklist-tabs.js`. Suite completa:
> 858 SUCCESS; tsc y check-links limpios. Pendiente: E2E manual (4.3) y commit.

## 0. Diagnóstico de cada observación del usuario

| Observación | Diagnóstico | Acción |
|---|---|---|
| I4: estreñimiento solo en tab gastrointestinal | Confirmado — el criterio está modelado como `STOPP-F3-ANTICOLINERGICO-ESTRENIMIENTO` con `system: gastrointestinal`; la relevancia por tab deriva del `system`, así que nunca aflora en Urológico | Fase 2.1 |
| J1: salta sin escoger diagnóstico | Confirmado — la lógica es solo `inDrugClass(SULFONILUREA)`, sin exigir diabetes pese al summary | Fase 1.1 |
| K8: con IRSN no salta | Confirmado (ya era el hallazgo nº1 de la revisión post-ronda) — K8-ISRS solo evalúa ISRS; ningún antidepresivo lleva la clase PSICOTROPICO | Fase 1.2 |
| K9: "escogí ramipril y no fue" | **Comportamiento correcto** — ramipril es IECA; K9 exige un ALFABLOQUEANTE (doxazosina, terazosina…) + caídas + HTA. Verificar manualmente con doxazosina | Fase 4 |
| K10: "no aparece síntomas prostáticos" | El dx existe con el label «Hiperplasia benigna de próstata» (tab Urológico, siempre habilitado). Problema de descubribilidad del label | Fase 3.4 |
| K12: salta sin indicación; incontinencia de urgencia sombreada; no existe vejiga hiperactiva | Confirmado triple — la lógica no exige la indicación que anuncia el summary; «Incontinencia urinaria de urgencia» solo se desbloquea marcando Duloxetina (su único trigger STOPP es I7); «Vejiga hiperactiva» no existe en el catálogo | Fase 2.2 |
| L3: "no encuentro dolor irruptivo… no me va" | La lógica es correcta pero exige el dx `dolor_moderado_grave`, cuyo label es «Dolor moderado-grave» (tab Sintomático): el usuario buscó "dolor irruptivo" y no lo encontró, luego el criterio nunca pudo disparar | Fase 2.3 |
| L4: lidocaína no está en "analgésicos"; salta con artrosis | (a) Correcto: no hay tab de medicación "Analgésicos" (es sección transversal STOPP); el parche está en tab Osteo → grupo «Anestésicos tópicos». (b) `artrosis` sin dolor crónico: misma simplificación ya aceptada en H9 (opioide+artrosis) | Fase 3.2 |
| L5: salta sin escoger dolor no neuropático | Confirmado (hallazgo nº3 de la revisión post-ronda, ahora reproducido) — `GABAPENTINOIDE AND NOT dolor_neuropatico` dispara con cero diagnósticos | Fase 1.3 |
| L6: paracetamol no salta ni con hepatopatía | La lógica exige **dosis capturada** > 2999 mg/día (`medicationClassDoseMgAbove`); sin rellenar el campo «Paracetamol (mg/día)» nunca dispara. Diseño deliberado (como los criterios de duración), pero hay que verificar que el campo aparece y decidir si conviene una alerta blanda sin dosis | Fase 3.3 + Fase 4 |
| M1: dos antimuscarínicos no saltan; amitriptilina+solifenacina sí | Confirmado — solo existen las variantes M1-ADT y M1-NEUROLEPTICO (ancladas a tricíclico/neuroléptico + `multipleANTICOLINERGICOS`); falta el criterio genérico «≥2 fármacos anticolinérgicos» del checklist | Fase 1.4 |
| I6/I7/I8 (sin veredicto) | Sin defecto detectado. Nota I7: el dx «Incontinencia urinaria de urgencia» se desbloquea al marcar Duloxetina (flujo correcto para I7; el problema solo afecta a K12, ver 2.2) | — |

## Fase 1 — Fixes de lógica inequívocos (TDD sobre `criteria-{j,k,l,m}.spec.ts`)

Cada ítem: primero test RED que reproduce el escenario del usuario, después el
cambio mínimo en `criteria.json`.

### 1.1 STOPP-J1: exigir diabetes (`criteria.json:1072`)

- Lógica actual: `{"inDrugClass":["SULFONILUREA",…]}` a secas.
- Propuesta: `and` con `{"or":[{"in":["diabetes",…]},{"in":["diabetes_hipoglucemias_frecuentes",…]}]}`.
- **Efecto colateral a cubrir:** al citar `diabetes` en un STOPP, el label
  «Diabetes mellitus» entraría en el gating (sombreado hasta marcar una
  sulfonilurea). No es un ancla todavía → añadir «Diabetes mellitus» a
  `ALWAYS_ENABLED_LABELS` (`dx-anchor-labels-candidate.ts`) con rationale
  "condición crónica de base", como ya lo son «Diabetes con episodios
  frecuentes de hipoglucemia», HBP, etc.
- Tests: (a) sulfonilurea sola → NO dispara; (b) sulfonilurea + diabetes →
  dispara; (c) sulfonilurea + diabetes_hipoglucemias_frecuentes → dispara;
  (d) «Diabetes mellitus» sigue siempre habilitado en dx-dependencies.

### 1.2 STOPP-K8: cubrir ISRN (`criteria.json:1224`)

- Añadir al `and` de K8-ISRS: `{"or":[{"inDrugClass":["ISRS",…]},{"inDrugClass":["ISRN",…]}]}`.
- El summary ya dice "ISRS e ISRN" y los `excludes` ya listan Venlafaxina/
  Duloxetina y la clase ISRN — solo falta la rama en la lógica.
- Tests: venlafaxina + caídas_repeticion → dispara K8; duloxetina + riesgo_caidas → dispara.
- Nota: no tocar K8-PSICOTROPICO (litio) — su hueco "antidepresivos" queda
  cubierto por esta rama y por K4-ADT.

### 1.3 STOPP-L5: exigir dolor no neuropático positivo (`criteria.json:1304`)

- Lógica actual: `GABAPENTINOIDE AND NOT dolor_neuropatico` → dispara sin
  ningún diagnóstico (reproducido por el usuario) y penaliza epilepsia y
  ansiedad_grave (donde START-D5 recomienda pregabalina).
- Propuesta: `GABAPENTINOIDE AND (dolor_leve OR dolor_leve_moderado OR
  dolor_moderado_grave OR artrosis) AND NOT dolor_neuropatico`.
  Al exigir un dolor positivo, los casos epilepsia/ansiedad sin dolor dejan
  de disparar sin necesidad de negarlos explícitamente.
- Tests: (a) gabapentina sola → NO; (b) gabapentina + epilepsia → NO;
  (c) pregabalina + ansiedad_grave → NO (y START-D5 sí);
  (d) pregabalina + artrosis → SÍ; (e) + dolor_neuropatico → NO.

### 1.4 STOPP-M1: criterio genérico ≥2 anticolinérgicos (`criteria.json:1316`)

- Hoy: solo variantes ancladas a ADT y a neuroléptico → oxibutinina +
  solifenacina (2 anticolinérgicos puros) no dispara nada.
- Propuesta recomendada: **sustituir las dos variantes por un único
  `STOPP-M1-ANTICOLINERGICOS`** con lógica
  `{"multipleANTICOLINERGICOS":[{"var":"medications"}]}` y summary del
  checklist («Evitar ≥2 fármacos con propiedades antimuscarínicas/
  anticolinérgicas concomitantes…»). El operador ya cuenta ≥2 miembros de la
  clase ANTICOLINERGICO, y ADT/neurolépticos anticolinérgicos ya llevan esa
  clase, así que los casos de las variantes actuales quedan cubiertos sin
  duplicar alertas (mantener las variantes + el genérico haría disparar dos
  avisos por el mismo par de fármacos).
  - Alternativa conservadora (si se prefiere conservar los textos
    específicos): mantener las variantes y añadir el genérico con `excludes`
    mutuos — decisión del usuario; la recomendada es la sustitución.
- `excludes`: `{"drugClasses":["ANTICOLINERGICO"]}`.
- Tests: (a) oxibutinina + solifenacina → dispara M1; (b) amitriptilina +
  solifenacina → dispara M1 (y solo una vez); (c) un solo anticolinérgico → NO.
- Revisar los specs existentes de M1 (`criteria-*.spec.ts`) y el informe/
  checklist que citen los ids antiguos.

## Fase 2 — Catálogo y relevancia (nuevos dx + reubicación)

### 2.1 Estreñimiento visible en Urogenital: renombrar F3-ANTICOLINERGICO → I4

- `STOPP-F3-ANTICOLINERGICO-ESTRENIMIENTO` (`criteria.json:844`) es en
  realidad el ítem I4 del checklist (antimuscarínico sistémico +
  estreñimiento). Cambiar `id` → `STOPP-I4-ANTIMUSCARINICO-ESTRENIMIENTO` y
  `system` → `"Sistema urogenital"`.
- Efecto: `buildRelevance` pasará a listar `estrenimiento_cronico` en los
  tabs urologico/ginecologico («Relevantes de otros sistemas»), que es
  exactamente lo que pedía el usuario. El tab gastrointestinal NO pierde el
  dx: lo sigue aportando `STOPP-F3-FARMACOS-ESTRENIMIENTO` (system GI).
- Tocar también: specs que citen el id antiguo (`criteria-f.spec.ts`,
  integridad), y cualquier doc/checklist con el id.
- Tests: relevancia — `estrenimiento_cronico ∈ specificDxsByTab('urologico')`
  y sigue en `specificDxsByTab('gastrointestinal')`.

### 2.2 STOPP-K12: exigir la indicación y desbloquear el dx (`criteria.json:1264`)

- Añadir al `and`: `{"or":[{"in":["incontinencia_urinaria_urgencia",…]},{"in":["vejiga_hiperactiva",…]}]}`.
- Crear el dx nuevo «Vejiga hiperactiva» (`vejiga_hiperactiva`, grupo
  Urológico) en `DIAGNOSIS_MAP`/`DIAGNOSIS_GROUPS`. No son sinónimos
  estrictos (la vejiga hiperactiva puede cursar sin incontinencia), por eso
  el summary los cita como alternativas: mejor dos checkboxes que un label
  fusionado.
- Efecto colateral positivo: al citar K12 esos dx, `buildDxDependencies`
  añade ANTIESPASMÓDICO_URINARIO a sus triggers → «Incontinencia urinaria de
  urgencia» dejará de estar sombreada cuando se marque un antimuscarínico
  urinario (hoy solo la desbloquea Duloxetina vía I7), resolviendo lo que
  observó el usuario.
- Tests: (a) oxibutinina + caídas sin indicación → NO dispara; (b) + 
  incontinencia_urinaria_urgencia → SÍ; (c) + vejiga_hiperactiva → SÍ;
  (d) dx-dependencies: el label se habilita con solifenacina marcada.

### 2.3 STOPP-L3: dx «Dolor irruptivo» (`criteria.json:1288`)

- Crear dx «Dolor irruptivo» (`dolor_irruptivo`, grupo Sintomático). OJO: no
  entra en la futura familia de variantes de intensidad de dolor (es otro
  tipo, como el neuropático — así lo advierte `diagnosis-variants.ts:33-34`).
  Añadirlo a `ALWAYS_ENABLED_LABELS` como el resto de labels de dolor.
- Cambiar la cláusula del dx en L3:
  `{"in":["dolor_moderado_grave",…]}` → `{"or":[{"in":["dolor_irruptivo",…]},{"in":["dolor_moderado_grave",…]}]}`
  (se mantiene dolor_moderado_grave como red de seguridad; si Raquel prefiere
  solo el irruptivo, quitar la segunda rama).
- Tests: morfina LP sin opioide rápido + dolor_irruptivo → dispara; añadir
  Morfina (rápida) → NO dispara.

## Fase 3 — Decisiones para el usuario / Raquel (no ejecutar sin respuesta)

1. **M1**: ~~¿sustituir las dos variantes por el genérico?~~ → **hecho**
   (opción recomendada: un único `STOPP-M1-ANTICOLINERGICOS`).
2. **L4**: ¿aceptar `artrosis` a secas (coherente con H9) o crear
   `dolor_cronico_artrosis`? Recomendado: aceptar y documentarlo como
   simplificación en el informe, igual que H9. La ubicación del parche de
   lidocaína en Osteo → «Anestésicos tópicos» es correcta (no existe tab de
   medicación "Analgésicos"; es sección transversal).
3. **L6**: ¿mantener el criterio condicionado a la dosis capturada
   (recomendado, coherente con los criterios de duración) o añadir una
   alerta blanda cuando hay paracetamol + hepatopatía/malnutrición sin dosis
   informada? Si se mantiene, valorar anotarlo en el checklist («requiere
   introducir mg/día»).
4. **K10**: ¿ampliar el label a «Hiperplasia benigna de próstata (síntomas
   prostáticos)» para la descubribilidad? Cambio solo de presentación
   (el código `hiperplasia_benigna_prostata` no se toca — regla D15.6).

## Fase 4 — Verificación

1. Suite completa (`npx ng test --watch=false --browsers=ChromeHeadless`) —
   hoy 807 en verde; los guards de integridad (`criteria-data-integrity.spec`,
   `dx-dependencies.spec`, `diagnoses.spec`) deben absorber los dx nuevos y
   los renombrados de id sin whitelists nuevas injustificadas.
2. `bash scripts/check-links.sh` → 0 problemas.
3. E2E manual (agent-browser) reproduciendo los escenarios del usuario:
   - J1: sulfonilurea sola NO salta; + diabetes SÍ.
   - K8: venlafaxina + caídas SÍ salta.
   - K9 (control): doxazosina + caídas + HTA SÍ salta; ramipril NO.
   - K12: solifenacina desbloquea «Incontinencia urinaria de urgencia»; sin
     indicación NO salta.
   - L3: morfina LP + dolor irruptivo SÍ salta.
   - L5: gabapentina sola NO salta; + artrosis SÍ.
   - L6: paracetamol 3000 mg/día + hepatopatía SÍ salta (verifica de paso
     que el campo mg/día aparece en el tab donde se marca).
   - M1: oxibutinina + solifenacina SÍ salta (una sola alerta).
4. Actualizar docs `@linked` afectados (`catalogo-clinico.md` por los dx
   nuevos y anclas; checklist maestro si cita los ids F3/M1 antiguos).

## Orden sugerido de ejecución

Fase 1 (rama `fix/criterios-jklm-logica`) → Fase 2 (misma rama o
`fix/catalogo-i4-k12-l3`) → esperar respuestas de Fase 3 → Fase 4 antes del
merge. Commits pequeños por criterio, con aprobación previa como siempre.
