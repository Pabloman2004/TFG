# Revisión — dosis y duración estructurada en criterios STOPP/START

Contexto: hoy solo 3 casos capturan datos numéricos de medicación (Digoxina:
dosis+duración; Hierro oral: dosis; IBP: duración), mediante el tipo `Med`
(`src/app/core/types.ts:19-25`, campos `doseMcgDay` / `doseMgDay` /
`durationDays`) y bloques de UI hardcodeados por pestaña en
`meds-step.component.html:140-194`. El usuario reporta que un agente previo
le dijo que "otros medicamentos les pasa lo mismo" y pide comprobarlo y
producir un plan de mejora (sin implementar todavía).

## Sección: Cobertura de datos estructurados (dosis/duración) en criterios

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| DD-01 | Confirmar que Digoxina, Hierro oral e IBP son los únicos 3 casos con datos numéricos estructurados hoy | VERIFICAR | Exploración preliminar: `Med` solo tiene `doseMcgDay`/`doseMgDay`/`durationDays`; solo 3 bloques UI hardcodeados los usan (Digoxina `meds-step.component.html:150-167`, Hierro oral `:168-177`, IBP `:181-194`). Confirmar con lectura independiente antes de dar el hallazgo por bueno. |
| DD-02 | AAS >100 mg/día no captura dosis | VERIFICAR | `STOPP-C1-AAS-DOSIS-ALTA` (`criteria.json:339-346`) usa solo `inDrugClass:["AAS"]`, sin dato de dosis. Se dispara por presencia, no por umbral real. |
| DD-03 | Paracetamol ≥3 g/día no captura dosis | VERIFICAR | `STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA` (`criteria.json:1310-1316`) usa clase `ANALGESICO_SIMPLE` + hepatopatía/IMC, sin dato de dosis pese a que el nombre dice "dosis alta". |
| DD-04 | IBP "dosis terapéutica plena" no está capturada (solo duración) | VERIFICAR | `STOPP-F2-IBP-TRATAMIENTO-PROLONGADO` (`criteria.json:836-843`) solo usa `medicationClassDurationAbove:["IBP",56,...]`. No existe campo ni criterio que compare con "dosis plena". |
| DD-05 | Digoxina en FA (STOPP-B21) dice ">3 meses" pero no usa `durationDays` | VERIFICAR/DUDA | `STOPP-B21-DIGOXINA-FA` (`criteria.json:332-337`) es solo `{"and":[{"in":["fibrilacion_auricular",...]},{"inDrugClass":["DIGOXINA",...]}]}` — sin duración, pese a que el summary menciona ">3 meses". El campo `durationDays` de Digoxina ya se captura en UI pero solo lo usa `STOPP-E1` (renal), no B21. Confirmar si es discrepancia real entre enunciado clínico y lógica, y si aplicar `durationDays>90` a B21 es clínicamente correcto o mezclaría dos umbrales distintos (toxicidad renal vs. uso prolongado en FA) — requiere criterio clínico, no decidir mecánicamente. |
| DD-06 | AAS + clopidogrel >4 semanas no captura duración | VERIFICAR | `STOPP-C3-AAS-CLOPIDOGREL-ICTUS` (`criteria.json:363-370`) usa `multipleANTIAGREGANTES` + `ictus_previo`, sin duración. |
| DD-07 | Anticoagulantes tras 1ª TVP/TEP >6 meses no captura duración numérica | VERIFICAR | `STOPP-C8`/`C9` (`criteria.json:420-433`) codifican el umbral temporal implícitamente en el nombre del diagnóstico (`tvp_primer_episodio_sin_factores_persistentes`), no como dato numérico. |
| DD-08 | Antipsicóticos SCPD >12 semanas no captura duración | VERIFICAR | `STOPP-D15-ANTIPSICOTICO-SCPD` (`criteria.json:571-577`), misma lógica que D5, solo diagnóstico+clase, sin duración pese a que el summary dice ">12 semanas". |
| DD-09 | Benzodiacepinas ≥4 semanas (general) y ≥2 semanas (insomnio) no capturan duración | VERIFICAR | `STOPP-D8` (`criteria.json:595-601`) y `STOPP-D10` (`:611-617`): solo clase(+diagnóstico), sin duración. |
| DD-10 | Hipnóticos Z ≥2 semanas no captura duración | VERIFICAR | `STOPP-D11-HIPNOTICO-Z-INSOMNIO` (`criteria.json:619-625`): solo clase+diagnóstico, sin duración. |
| DD-11 | Corticoides sistémicos AR >3 meses no captura duración | VERIFICAR | `STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE` (`criteria.json:966-973`): solo clase+diagnóstico, sin duración. |
| DD-12 | AINE/colchicina gota crónica >3 meses no captura duración | VERIFICAR | `STOPP-H6-AINE-COLCHICINA-GOTA-CRONICA` (`criteria.json:982-989`): solo clase(s)+diagnóstico, sin duración. |
| DD-13 | Opioides artrosis "tratamiento prolongado" | VERIFICAR | `STOPP-H9-OPIOIDE-ARTROSIS` (`criteria.json:1006-1012`): solo clase+diagnóstico. El enunciado STOPP no da umbral numérico ("tratamiento prolongado" es cualitativo) — confirmar si aplica capturar duración igualmente o si se deja así por ser umbral no cuantificable. |
| DD-14 | Confirmar afirmación del usuario: sección E (dabigatrán, inhibidores Xa, AINE, colchicina, metformina, antagonistas de aldosterona, nitrofurantoína, bisfosfonatos, metotrexato) solo usa TFGe, sin dosis/duración propia | VERIFICAR | Exploración preliminar: `criteria.json:756-827`, todos usan solo `inDrugClass + egfrBelow`. Única excepción real de la sección E es E1-Digoxina (TFGe + dosis + duración). Confirmar antes de asumirlo cierto en el plan. |

## Sección: Plan de mejora — arquitectura de dosis/duración de medicación

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| PLAN-01 | Diseñar editor común de medicación (dosis + unidad + duración) frente a seguir añadiendo campos especiales por fármaco | DUDA | Hoy no existe editor genérico: los 3 casos existentes son bloques `@if`/`@for` hardcodeados en `meds-step.component.html:140-194`, gateados por pestaña activa (`activeCategoryId()`), reutilizando `updateMedicationNumber` (`meds-step.component.ts:267-286`) y operadores genéricos `medicationClassDurationAbove`/`medicationClassDoseMgAbove` (`criteria-engine.service.ts:222-246`) — salvo Digoxina, que tiene su propio operador ad-hoc `digoxinaDosisAlta` (`:212-220`) por combinar dosis y duración a la vez. Si se añade dato estructurado a los ~12 criterios de la sección anterior (DD-02 a DD-13) con el patrón actual, harían falta ~10 bloques hardcodeados más, cada uno atado a una pestaña. Investigar opciones: (a) generalizar el patrón actual con config data-driven (lista de `{drugId/drugClass, campos requeridos, tab}` que genere UI y operador automáticamente); (b) componente Angular reutilizable tipo `<med-dose-input>` parametrizado por fármaco/clase/campo/umbral; (c) mantener el patrón manual pero documentarlo como decisión consciente dado el volumen. Evaluar coste de migrar los 3 casos ya existentes a la solución elegida. **No implementar nada — solo investigar y presentar 2-3 opciones con trade-offs.** |
