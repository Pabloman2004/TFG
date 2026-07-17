# Plan de mejora — dosis y duración estructurada en criterios STOPP/START

> Documento de investigación para PLAN-01 (`docs/revision-dosis-duracion-medicacion.md`).
> No implementa nada. Presenta opciones y una recomendación razonada; la
> decisión final es del usuario.

## Problema

Hoy el motor de criterios evalúa la mayoría de los umbrales de dosis/duración
mencionados en el `summary` de un criterio de forma **implícita**: si el
fármaco/clase está presente y (cuando aplica) el diagnóstico asociado también,
el criterio se dispara — sin comprobar el número real de mg, µg, g o días que
introduciría el clínico. Solo 3 fármacos tienen captura numérica real
(Digoxina, Hierro oral, IBP), mediante bloques de HTML hardcodeados y
gateados por pestaña. Si se quiere cerrar esa brecha para los demás
criterios candidatos, el patrón actual obligaría a añadir un bloque
`@if`/`@for` nuevo por cada fármaco/clase, cada uno atado a una pestaña
concreta del formulario. Este documento investiga si conviene generalizar
ese patrón antes de escalarlo, y con qué forma.

## Estado actual (verificado)

Verificación directa de código (no se asume nada del manifiesto sin releer):

- **`src/app/core/types.ts:19-25`** — `Med` tiene únicamente `id`,
  `drugClasses[]`, `doseMcgDay?`, `doseMgDay?`, `durationDays?`. No hay campo
  de unidad explícito: la unidad (µg vs mg) está implícita en qué campo se
  rellena, y no existe ningún campo para gramos (relevante para Paracetamol,
  ver más abajo).
- **`src/app/core/data/medications.ts`** — el catálogo estático `MEDICATIONS`
  confirmado: cada entrada es solo `{ id, drugClasses }` (p. ej. línea 297,
  `Ácido acetilsalicílico: ["ANTIAGREGANTE","AAS"]`). No lleva dosis ni
  duración; esos datos solo existen en la instancia por paciente
  (`store.meds()`), nunca en el catálogo.
- **`src/app/steps/meds-step/meds-step.component.html:140-194`** — exactamente
  3 bloques hardcodeados, cada uno gateado por `activeCategoryId()`:
  - `renal` (líneas 140-179): panel de TFGe + Digoxina (µg/día y días, campo
    por campo) + `@for` sobre `medicationsByClass('HIERRO_ORAL')` (mg/día).
  - `gastrointestinal` (líneas 181-194): `@for` sobre
    `medicationsByClass('IBP')` (solo días).
  - No hay un cuarto bloque ni patrón genérico; confirma DD-01 del manifiesto.
- **`meds-step.component.ts:267-286`** — `updateMedicationNumber(id, field,
  rawValue)` es ya genérico: acepta `'doseMcgDay' | 'doseMgDay' |
  'durationDays'` como unión cerrada de campo, valida no-negativo, y hace
  update inmutable sobre `store.meds()`. Es reutilizable tal cual para
  cualquier fármaco nuevo — el cuello de botella no está aquí sino en el HTML
  que decide qué inputs mostrar y dónde.
- **`criteria-engine.service.ts:191-246`** — operadores confirmados:
  - `digoxinaDosisAlta` (212-220): **ad-hoc**, hardcodea `'digoxina'`,
    `≥125` µg y `>90` días dentro del propio operador. No es reutilizable
    para otro fármaco sin duplicar código.
  - `medicationClassDurationAbove(drugClass, days, meds)` (222-233): genérico,
    ya parametrizado por clase y umbral de días.
  - `medicationClassDoseMgAbove(drugClass, doseMg, meds)` (235-246): genérico,
    ya parametrizado por clase y umbral de mg — pero **fijo a mg**, no sirve
    para µg (Digoxina) ni para g (Paracetamol) sin conversión previa o sin
    una tercera variante `medicationClassDoseAbove` con unidad como parámetro.
  - No existe ningún operador que combine dosis Y duración de forma genérica
    — `digoxinaDosisAlta` es la única combinación, y está cableada a un solo
    fármaco.
- **`criteria.json`** — de los ~12 candidatos listados en el manifiesto,
  confirmé directamente los 11 con grep (los relevantes al ítem):
  `STOPP-B21-DIGOXINA-FA`, `STOPP-C1-AAS-DOSIS-ALTA`,
  `STOPP-C3-AAS-CLOPIDOGREL-ICTUS`, `STOPP-C8/C9-...-PRIMER-EPISODIO`,
  `STOPP-D8/D10/D11-...` (benzodiacepinas/hipnóticos-Z),
  `STOPP-D15-ANTIPSICOTICO-SCPD`, `STOPP-F2-IBP-TRATAMIENTO-PROLONGADO`,
  `STOPP-H4-CORTICOIDE-ARTRITIS-REUMATOIDE`,
  `STOPP-H6-AINE-COLCHICINA-GOTA-CRONICA`, `STOPP-H9-OPIOIDE-ARTROSIS`,
  `STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA`. Todos usan solo
  `inDrugClass`/`in diagnoses` (más `or`/`and`), sin ningún operador de
  dosis/duración pese a que el `summary` de cada uno menciona un umbral
  numérico textualmente (">3 meses", "≥ 4 semanas", "≥ 3 g/día", etc.).
  `STOPP-F2-IBP` es la única excepción real: ya usa
  `medicationClassDurationAbove:["IBP",56,...]`.
- **Unidades por fármaco/clase (relevante para cualquier opción)**:
  Digoxina → µg/día; AAS, Hierro oral → mg/día; Paracetamol → g/día (umbral
  "≥3 g/día" = 3000 mg, fuera del rango natural en que se piensa la dosis de
  paracetamol en la práctica clínica — un input en mg confundiría al usuario
  clínico, que piensa en gramos o en "nº de comprimidos de 1g").
- **Combinación dosis+duración simultánea**: solo Digoxina/B21-E1 la necesita
  hoy (`digoxinaDosisAlta`). De los ~11 candidatos restantes, la mayoría son
  **solo duración** (benzodiacepinas, hipnóticos-Z, antipsicóticos SCPD,
  corticoides AR, AINE/colchicina gota, opioides artrosis, anticoagulantes
  TVP/TEP) y 2 son **solo dosis** (AAS, Paracetamol). Ninguno de los nuevos
  candidatos combina ambas — la complejidad de "dosis Y duración a la vez"
  no se multiplica al escalar, solo se repite una vez más (si se decide
  aplicar duración a B21 también, ver DD-05 en el documento hermano).

## Opciones investigadas

### Opción A: configuración data-driven (generalizar el patrón actual)

Una lista declarativa, p. ej. en un nuevo fichero
`src/app/core/data/med-structured-fields.ts`:

```ts
type StructuredFieldSpec = {
  drugClass: string;       // 'IBP', 'AINE', ...
  tabId: string;           // pestaña donde se muestra el input
  fields: Array<
    | { kind: 'doseMcgDay'; label: string }
    | { kind: 'doseMgDay'; label: string }
    | { kind: 'doseGDay'; label: string }   // requiere nuevo campo en Med
    | { kind: 'durationDays'; label: string }
  >;
};
```

Un único `@for` en el HTML (o un componente hijo, ver Opción B) recorre esta
lista para el `activeCategoryId()` actual y genera los inputs; el operador de
evaluación se resuelve con una función `evaluateThreshold(spec, meds)`
genérica que sustituye a `medicationClassDurationAbove` /
`medicationClassDoseMgAbove` por variantes parametrizadas por unidad, o añade
un tercer parámetro de unidad a un operador único
`medicationClassThresholdAbove(drugClass, field, threshold, meds)`.

- **Qué cambia en `types.ts`**: añadir `doseGDay?: number` (o generalizar a
  `doseValue?: number` + `doseUnit?: 'mcg'|'mg'|'g'`, decisión de diseño
  dentro de la opción). `updateMedicationNumber` amplía su unión de `field`.
- **Qué cambia en `criteria.json`/`criteria-engine.service.ts`**: cada
  criterio candidato pasa de `inDrugClass` puro a
  `medicationClassDurationAbove` / variante de dosis, con el umbral ya
  presente en su `summary` trasladado a la `logic`. `digoxinaDosisAlta` podría
  reescribirse como composición de dos condiciones genéricas (`and` de
  duración + dosis) en vez de operador ad-hoc, o mantenerse como excepción
  documentada si se prioriza no tocar un criterio ya probado.
- **Qué cambia en el componente de UI**: los 3 bloques `@if` de
  `meds-step.component.html:140-194` se sustituyen por un único bloque que
  itera `STRUCTURED_FIELDS.filter(s => s.tabId === activeCategoryId())`.
- **Coste de migrar los 3 casos existentes**: bajo — son los primeros 3
  entries de la tabla de config; `updateMedicationNumber` ya es reutilizable
  sin cambios de firma salvo la nueva unión de `field`. El riesgo principal
  es de regresión en tests existentes de Digoxina/Hierro/IBP si el HTML
  generado difiere en estructura (hay que revisar specs de
  `meds-step.component` si existen).
- **Cómo escala a los ~12 candidatos**: cada nuevo criterio es una entrada de
  config + una línea de `logic` en `criteria.json`. No requiere tocar HTML ni
  TS de componente para el caso general (solo si aparece una combinación
  dosis+duración nueva, que sí necesitaría lógica `and` explícita en
  `criteria.json` en vez de un operador ad-hoc por fármaco).
- **Riesgos concretos**:
  - La unidad variable (µg/mg/g) obliga a decidir entre 3 campos separados
    en `Med` (como hoy, con más entradas) o un par `doseValue/doseUnit` más
    flexible pero que rompe compatibilidad con `doseMcgDay`/`doseMgDay`
    existentes en casos guardados (`SavedCase`/`CaseExport` en
    `types.ts:75-85`) — migración de datos persistidos a considerar.
  - Combinar dosis+duración de forma genérica (como Digoxina) exige o bien
    un operador con aridad variable, o expresar el `and` directamente en
    `criteria.json`, perdiendo la legibilidad de nombre semántico que hoy da
    `digoxinaDosisAlta`.
  - Cambiar `criteria.json` para 11 criterios es trabajo clínico-editorial
    (decidir el umbral exacto en días/mg a partir del `summary` en texto
    libre), no solo técnico — riesgo de introducir umbrales incorrectos si
    no se revisa cada `summary` con cuidado clínico.

### Opción B: componente Angular reutilizable (`<med-dose-input>`)

Un componente standalone parametrizado por `@Input()` (fármaco/clase, campos
requeridos, umbral a mostrar como ayuda visual), insertado donde haga falta:

```html
<med-dose-input
  [med]="medicationById('Digoxina')"
  [fields]="['doseMcgDay','durationDays']"
  (fieldChange)="updateMedicationNumber($event.id, $event.field, $event.value)" />
```

- **Qué cambia en `types.ts`**: nada obligatorio por sí solo — es una opción
  puramente de presentación; puede combinarse con o sin la Opción A para el
  origen de la lista de qué fármacos necesitan el componente.
- **Qué cambia en `criteria.json`/`criteria-engine.service.ts`**: nada por sí
  sola. Esta opción no resuelve el problema de "qué operador evalúa el
  umbral" — solo evita duplicar el HTML del input. Sin la Opción A (o algo
  equivalente) para decidir qué fármacos van en qué pestaña, seguiría
  habiendo un `@if (activeCategoryId() === 'x')` por pestaña, solo que más
  corto.
- **Qué cambia en el componente de UI**: extrae el HTML repetido de
  input+label+validación a un componente hijo reutilizable; reduce
  duplicación visual pero no elimina el problema de origen (dónde se declara
  qué fármaco necesita qué campos).
- **Coste de migrar los 3 casos existentes**: medio — hay que definir la
  interfaz del componente (inputs/outputs, validación, formato numérico) y
  sustituir el HTML de los 3 bloques por invocaciones del componente. Test
  unitario nuevo para el componente en sí.
- **Cómo escala a los ~12 candidatos**: mejor que el patrón actual porque
  reduce el HTML repetido a una línea por fármaco, pero **sigue exigiendo
  tocar `meds-step.component.html` para cada fármaco nuevo** salvo que se
  combine con Opción A para generar también la lista de invocaciones.
  Considerado aisladamente, es una mejora de calidad de código (DRY) más que
  una solución al problema de escalabilidad de origen.
- **Riesgos concretos**: menor riesgo técnico que A (no toca `criteria.json`
  ni el motor); el riesgo es que, sin combinarse con A, dé una falsa
  sensación de haber resuelto el problema cuando en realidad solo se resolvió
  la duplicación de marcado, no la de "añadir un fármaco nuevo sigue tocando
  3 ficheros" (HTML, `criteria.json`, posiblemente un operador).

### Opción C: mantener el patrón manual, documentado como decisión consciente

No generalizar nada. Añadir cada nuevo caso (si se decide capturar
numéricamente alguno de los ~12) como un bloque hardcodeado más, siguiendo el
patrón ya existente para Digoxina/Hierro/IBP, y documentar explícitamente en
`docs/motor-criterios.md` (sección "Si cambias esto…") el procedimiento para
añadir un caso nuevo: campo en `Med`, bloque HTML gateado por tab, operador
genérico o nuevo en `criteria-engine.service.ts`, actualización de
`criteria.json`.

- **Qué cambia en `types.ts`**: un campo más por cada fármaco con unidad
  distinta a las 2 ya existentes (p. ej. `doseGDay?: number` si se aborda
  Paracetamol). Sin abstracción de unidad.
- **Qué cambia en `criteria.json`/`criteria-engine.service.ts`**: igual que
  en la Opción A en cuanto a `criteria.json` (cada criterio candidato
  necesita su umbral trasladado a `logic`), pero cada combinación
  dosis+duración nueva probablemente genera un operador ad-hoc más (siguiendo
  el precedente de `digoxinaDosisAlta`) en vez de una función genérica.
- **Qué cambia en el componente de UI**: un `@if`/`@for` más por fármaco,
  igual que los 3 actuales.
- **Coste de migrar los 3 casos existentes**: cero — no se toca nada
  existente.
- **Cómo escala a los ~12 candidatos**: linealmente peor que A/B: ~10 bloques
  HTML más, cada uno revisado y testeado individualmente. Es el patrón que ya
  demostró llegar a 3 casos sin abstracción; con ~12 más el fichero
  `meds-step.component.html` crecería sustancialmente y el riesgo de
  inconsistencia entre bloques (p. ej. validación de campo vacío, formato de
  label) aumenta porque cada bloque se escribe/copia a mano.
  - Nota importante: **no todos los ~11 candidatos van a implementarse
    necesariamente** — ver más abajo la distinción entre relevancia técnica y
    clínica. Si tras revisión clínica solo 3-4 de los 11 candidatos se
    consideran de valor real, el volumen total rondaría 6-7 casos, donde la
    ventaja de abstraer es menor que si fueran 15.
- **Riesgos concretos**: el riesgo no es técnico sino de mantenibilidad a
  medio plazo — cuantos más bloques hardcodeados, más fácil que una futura
  revisión (como esta misma) vuelva a preguntarse "¿por qué no hay un patrón
  común?". Es una opción válida solo si el volumen final se mantiene bajo
  (definir un umbral explícito, p. ej. "si se superan 5-6 casos, migrar a
  Opción A" — ver Recomendación).

## Qué es técnico vs. qué requiere decisión de producto/clínica

**Puramente técnico (resoluble por un ingeniero sin consulta adicional):**
- Elegir entre Opción A, B, C o combinación A+B — es arquitectura de software
  pura, no cambia el comportamiento clínico observable si se implementa
  correctamente.
- Diseño del campo de unidad en `Med` (`doseGDay` separado vs.
  `doseValue`+`doseUnit` genérico) y su impacto en compatibilidad de
  `SavedCase`/`CaseExport` persistidos.
- Generalizar `medicationClassDoseMgAbove` a una variante con unidad
  parametrizada, o mantener 3 operadores separados por unidad.
- Extraer el componente `<med-dose-input>` (Opción B) y su contrato de
  inputs/outputs.

**Requiere decisión de producto/UX (cómo se presenta al usuario clínico):**
- Si un fármaco necesita input numérico, ¿en qué pestaña aparece? Hoy
  Digoxina y Hierro están en `renal` (por E1, criterio renal), no en
  `cardiovascular` pese a que B21 (FA) también los usa — encaja porque el
  campo se comparte, pero para nuevos casos (p. ej. AAS con dosis, que vive
  en la pestaña de antiagregantes) hay que decidir dónde vive el input si el
  criterio pertenece a un sistema distinto al de la clase del fármaco.
  Ejemplo: `STOPP-C1-AAS-DOSIS-ALTA` es de "Anticoagulantes/Antiagregantes";
  el grupo `antiagregantes` en `medications-taxonomy.ts:56` no tiene grupo
  propio para AAS en solitario, está dentro del grupo agregado
  `ANTIAGREGANTE` — decidir si el input de dosis se ata a la clase agregada
  o solo a AAS específicamente es una decisión de UX/clínica, no técnica.
- Formato del input: ¿campo numérico libre (como hoy) o selector de rango /
  slider / autocompletar con dosis comerciales habituales (p. ej. Digoxina
  0,125 mg, 0,25 mg)? Afecta a la usabilidad para un clínico que rellena el
  formulario rápido.
- Paracetamol en gramos vs. mg: decisión de UX que además tiene coste técnico
  derivado (nuevo campo o conversión), pero el "en qué unidad piensa el
  usuario clínico" es una decisión de producto informada por cómo se prescribe
  en la práctica (comprimidos de 1 g es el formato habitual en España).

**Requiere criterio clínico (qué fármacos aportan valor real capturando el
dato, no solo cuáles son técnicamente viables):**
- De los ~11 candidatos, ¿cuáles tienen un umbral cuantificable de forma
  fiable por el usuario (fechas de inicio de tratamiento conocidas) vs.
  cuáles son datos que en la práctica el clínico revisor no sabrá precisar
  (p. ej. "duración exacta en días" de un antipsicótico prescrito hace meses
  por otro profesional)? Si el dato no se puede rellenar con fiabilidad,
  capturarlo no mejora la precisión del criterio, solo añade fricción al
  formulario sin beneficio.
- `STOPP-H9-OPIOIDE-ARTROSIS` (DD-13 en el documento hermano): el propio
  STOPP no da umbral numérico ("tratamiento prolongado" es cualitativo) —
  clínicamente puede no proceder capturar duración aquí en absoluto, a
  diferencia de los que sí tienen un número explícito en el `summary`
  (">12 semanas", "≥ 4 semanas", etc.).
- `STOPP-B21-DIGOXINA-FA` (DD-05): si aplicar el mismo `durationDays` que ya
  usa E1 (renal) a B21 (FA) es clínicamente correcto o mezcla dos umbrales de
  naturaleza distinta (toxicidad renal por acumulación vs. beneficio/riesgo
  de uso prolongado en FA) — no es una decisión de arquitectura, aunque la
  arquitectura elegida (A o C) determina cuánto cuesta técnicamente aplicar
  el cambio una vez decidido.
- Priorizar qué criterios son de mayor impacto clínico real (más prevalentes
  en la población de pacientes objetivo, mayor riesgo si se pasa por alto)
  frente a los de bajo impacto — ver tabla de priorización más abajo, que es
  una propuesta técnica de orden pero cuya validación final es clínica.

## Recomendación razonada

No se elige la opción por el usuario, pero como guía:

- Si tras la revisión clínica de los ~11 candidatos se concluye que **más de
  5-6 merecen captura numérica real**, la Opción A (config data-driven) es la
  que mejor amortiza el coste de escalar: evita que
  `meds-step.component.html` crezca de forma descontrolada y centraliza en un
  solo lugar la relación fármaco↔campo↔umbral↔pestaña, que hoy está dispersa
  entre HTML, el operador de `criteria-engine.service.ts` y `criteria.json`.
  Combinarla con Opción B (extraer el input a un componente) es
  complementario y de bajo riesgo adicional una vez se tiene la config: A
  decide *qué* mostrar, B decide *cómo* se ve.
- Si la revisión clínica concluye que **solo 2-3 candidatos adicionales**
  aportan valor real (p. ej. solo AAS y Paracetamol, ambos de dosis simple,
  sin duración), la Opción C documentada explícitamente es razonable y evita
  invertir en abstracción para un volumen que no la justifica — el coste de
  3 bloques más hardcodeados es bajo y ya hay precedente funcionando.
- La variable que más pesa en la decisión final **no es técnica**: es cuántos
  de los ~11 candidatos superan el filtro clínico de "el dato es fiable y
  aporta precisión real al criterio". Se recomienda resolver primero esa
  pregunta (con el documento hermano de cobertura de datos, DD-02 a DD-13) y
  solo después fijar la arquitectura, para no diseñar una abstracción a
  medida de un volumen que luego no se materializa.

## Priorización sugerida de los ~12 criterios candidatos

Orden propuesto combinando impacto clínico aparente (gravedad si se omite +
prevalencia esperada) y coste técnico estimado (bajo si es duración simple
sobre operador ya genérico, medio si requiere nuevo campo/unidad, alto si
combina dosis+duración o requiere decisión de ámbito de pestaña):

| Prioridad | Criterio | Tipo de umbral | Coste técnico | Nota |
|---|---|---|---|---|
| 1 | `STOPP-D8`/`D10`/`D11` (benzodiacepinas / hipnóticos-Z) | duración | Bajo — `medicationClassDurationAbove` ya sirve | Alta prevalencia esperada en ancianos; caídas es un desenlace grave |
| 2 | `STOPP-C1-AAS-DOSIS-ALTA` | dosis (mg) | Bajo-medio — `medicationClassDoseMgAbove` ya sirve; decidir pestaña (antiagregantes) | Riesgo de sangrado, alta prevalencia de AAS en polimedicados |
| 3 | `STOPP-H4`/`H6`/`H9` (musculoesquelético: corticoide AR, AINE/colchicina gota, opioide artrosis) | duración (H9 sin umbral numérico) | Bajo (H4/H6) / requiere criterio clínico (H9) | H9 puede no proceder capturarlo, ver arriba |
| 4 | `STOPP-D15-ANTIPSICOTICO-SCPD` | duración | Bajo | Relevante en demencia, pero el dato de "duración exacta" puede ser poco fiable si el usuario revisor no es quien inició el tratamiento |
| 5 | `STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA` | dosis (g) | Medio — requiere nueva unidad/campo | Prevalencia alta de paracetamol, pero el subgrupo de riesgo (hepatopatía/malnutrición) es más acotado |
| 6 | `STOPP-C3-AAS-CLOPIDOGREL-ICTUS` | duración | Bajo — `medicationClassDurationAbove` sirve, pero aplica sobre combinación de 2 fármacos, no una clase única | Requiere decidir si el umbral se ata a AAS, a clopidogrel, o a la combinación |
| 7 | `STOPP-C8`/`C9` (anticoagulantes TVP/TEP primer episodio) | duración | Bajo técnico, pero el umbral hoy está codificado en el propio diagnóstico (`..._sin_factores_persistentes`) | Cambiar esto puede duplicar semántica entre diagnóstico y duración — revisar con cuidado para no crear inconsistencia |
| 8 | `STOPP-B21-DIGOXINA-FA` | duración (reutilizar `durationDays` ya capturado) | Bajo técnico, alto en decisión clínica (DD-05) | No añade campo nuevo, pero mezclar semántica con E1 requiere validación clínica previa |

`STOPP-F2-IBP-TRATAMIENTO-PROLONGADO` no se incluye en la tabla por ya estar
resuelto (único candidato que ya usa el operador genérico de duración).
