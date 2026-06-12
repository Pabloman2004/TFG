# Dudas pendientes con Raquel

> Decisiones clínicas acumuladas que requieren validación de la tutora del TFG. No bloquean desarrollo (las tareas técnicas avanzan en paralelo) pero deben resolverse antes de cerrar el TFG.
>
> Última actualización: 2026-05-22 (tras auditoría PROMPT 2 cierre).

---

## 1. Niveles de "insuficiencia renal" en STOPP-B8

Tras añadir `Insuficiencia renal` como diagnóstico seleccionable, la taxonomía tiene **tres niveles** en el tab Renal:

- `Insuficiencia renal` (general, añadido para B8)
- `Enfermedad renal grave`
- `Insuficiencia renal terminal (TFGe < 15 ml/min)`

`STOPP-B8-DIURETICO-ASA-EDEMAS-MALEOLARES` solo excluye con el código `insuficiencia_renal` (general). Las versiones más graves NO bloquean el criterio.

**Pregunta**: ¿las versiones más graves también deberían justificar el diurético de asa? ¿O conviene refactorizar a un único diagnóstico "Insuficiencia renal" con subopciones de gravedad?

**Estado**: no bloqueante. Decidir antes de cerrar el feature de relevancia automática.

---

## 2. Cambio `pregabalina` (med) → `GABAPENTINOIDE` (clase) en START-D5

START-D5 referenciaba `pregabalina` por nombre individual. Cambiado a la clase `GABAPENTINOIDE` por dos motivos:

- (a) Corregir bug latente: el id real era `Pregabalina` con mayúscula y el `in` nunca disparaba.
- (b) Unificar estilo con el resto del fichero.

**Efecto clínico**: la exclusión ahora también aplica a `gabapentina` (cualquier gabapentinoide), no solo pregabalina.

**Pregunta**: ¿es clínicamente correcto que gabapentina también bloquee el START de ISRS para ansiedad grave? ¿O debe seguir siendo solo pregabalina?

**Estado**: si Raquel pide volver atrás, refactor menor (añadir id `pregabalina` minúscula distinto al `Pregabalina` capitalizado).

---

## 3. Grupo C de 8 etiquetas de clases sin uso

En la limpieza taxonómica del PROMPT 2 quedó identificado un Grupo C de 8 clases declaradas en `medications-taxonomy.ts` que no son referenciadas por ningún criterio en `criteria.json`. No se eliminaron por precaución.

**Pregunta**: ¿se pueden eliminar (no se prevén reglas futuras), o conservar como reserva para reglas futuras?

**Estado**: no bloqueante. Cosmético / mantenimiento.

---

## 4. STOPP-B16-ESTATINA — modelado de "esperanza de vida <3 años"

La guía oficial exige: estatina + edad ≥85 + **fragilidad establecida** + **esperanza de vida <3 años** (prevención primaria). La lógica actual cubre los tres primeros pero NO modela "esperanza <3 años" (no existe ese concepto en el modelo de datos).

**Opciones**:

- **(a) PREFERENCIA PROVISIONAL DEL USUARIO**: aceptar `fragilidad` como proxy de "esperanza <3 años".
  - Justificación: no introduce concepto nuevo en el modelo; fragilidad establecida en >85 años ya implica clínicamente expectativa vital limitada.
  - Si Raquel lo considera insuficiente, lo refinamos más adelante.
- **(b)** Añadir un diagnóstico nuevo `esperanza_vida_menor_3_anos` y exigirlo en la lógica.
- **(c)** Añadir un campo en `patientInfo` (p.ej. `life_expectancy_lt_3y: boolean`).

**Pregunta**: ¿basta con la opción (a), o quiere distinguir explícitamente "fragilidad" vs "esperanza <3 años"?

**Estado**: NO bloqueante. El criterio funciona con (a) implícito. Si Raquel pide (b) o (c), refactor menor.

---

## 5. Antiarrítmicos clase Ia — ¿añadir al sistema?

La guía STOPP/START v3 sección B15 menciona expresamente "antiarrítmicos de los grupos Ia y III" como prolongadores del QT. Actualmente:

- **Clase III**: Amiodarona está modelada (`ANTIARITMICO_CLASE_III` + `PROLONGADOR_QTC`).
- **Clase Ia**: NINGÚN fármaco en `medications.ts`. Los candidatos serían **procainamida, quinidina, disopiramida**.

**Pregunta**: ¿conviene añadirlos al sistema? Son fármacos poco usados actualmente en la práctica clínica española en mayores, pero figuran en la guía oficial.

**Estado**: NO bloqueante. Si Raquel los considera relevantes, añadir 3 meds con clases `ANTIARITMICO`, `ANTIARITMICO_CLASE_IA`, `PROLONGADOR_QTC`. El criterio paraguas `STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO` los cubriría automáticamente.

---

## 6. Variantes de Insuficiencia cardíaca — modelado clínico

Tras el PROMPT 5 conviven 5 variantes de insuficiencia cardíaca como diagnósticos:

1. `Insuficiencia cardíaca` (genérica) → `insuficiencia_cardiaca`
2. `Insuficiencia cardíaca con FE reducida` → `insuficiencia_cardiaca_fe_reducida`
3. `Insuficiencia cardíaca con función sistólica conservada` → `ic_funcion_sistolica_conservada`
4. `Insuficiencia cardíaca grave` → `insuficiencia_cardiaca_grave` *(nuevo en PROMPT 5)*
5. `Insuficiencia cardíaca NYHA III-IV` → `ic_nyha_3_4`

**Preguntas (acumuladas tras PROMPT 6, sugeridas por tutor)**:

- (a) ¿"IC grave" y "IC NYHA III-IV" describen lo mismo clínicamente?
  - Si **sí**: unificar a uno solo (probablemente "NYHA III-IV" por ser más específico) y actualizar B14 para que use ese único código.
  - Si **no**: aclarar el criterio diferenciador (¿NYHA III-IV se basa solo en disnea funcional y "grave" engloba además otros marcadores: FEVI muy baja, hospitalizaciones recurrentes, etc.?). En ese caso documentar la diferencia en los tooltips de cada diagnóstico.

- (b) **Propuesta del tutor**: ¿conviene unificar las 5 variantes actuales en **una única opción "Insuficiencia cardíaca" con subopciones combinables**?
  - Subopciones propuestas: `Estable`, `Sintomática`, `Fracción de eyección preservada`, `Fracción de eyección reducida`.
  - Permite combinaciones realistas: "IC estable con FE reducida", "IC sintomática con FE preservada", etc.

- (c) **Si se opta por (b), ¿cómo migrar los criterios actuales que referencian cada variante por separado?**
  - STOPP-B1 (IC con función sistólica conservada), B2 (NYHA III-IV), B7-neg, B8-neg, B14 (IC grave), B19 (varios).
  - START-B5/B6/B7/B9/B11 (IC con FE reducida), B8 (genérica).
  - Cada criterio requeriría reformularse en términos de las nuevas subopciones (p.ej. B5: `IC ∧ FE_REDUCIDA`; B14: `IC ∧ Sintomática ∧ grave` o similar).

**Estado**: NO bloqueante. (a) es refactor menor. (b)+(c) es un cambio estructural importante que afecta al modelo de datos, a la UI del paso de diagnósticos y a ~12 criterios. No aplicar hasta tener respuesta clara de Raquel sobre qué nivel de unificación quiere.

---

## 7. STOPP/START — TFGe permisiva en START-B7 (consulta menor)

Lógica actual de B7 (antagonista de aldosterona en IC con FE reducida):

```
AND: insuficiencia_cardiaca_fe_reducida ∧ !ANTAGONISTA_ALDOSTERONA ∧ (labs.egfr_ml_min_173 == null  OR  labs.egfr > 30)
```

La rama `egfr == null` se mantiene permisiva: en pacientes sin analítica reciente, el criterio dispara igualmente la recomendación. Decisión técnica deliberada (PROMPT 6): endurecerlo a `egfr != null ∧ > 30` generaría falsos negativos en pacientes sin función renal medida.

**Pregunta para Raquel**: ¿es clínicamente aceptable recomendar antagonistas de aldosterona en IC con FE reducida cuando no hay TFGe registrada, o debería exigirse analítica reciente como prerequisito?

**Estado**: NO bloqueante. Si Raquel exige analítica obligatoria, refactor de 1 línea en `criteria.json` (quitar la rama `egfr == null`).

---

## 8. Bug clínico en STOPP-F5-CORTICOIDE-ULCERA-PEPTICA

El criterio se llama "evitar corticosteroides en pacientes con úlcera péptica previa sin IBP" pero la lógica actual NO comprueba si el paciente toma corticoides. Solo comprueba:

- Antecedentes de úlcera péptica.
- No toma IBP.

Resultado: el criterio dispara incorrectamente en cualquier paciente con úlcera péptica que no tome IBP, aunque no esté tomando corticoides.

**Pregunta para Raquel**: confirmar el arreglo correcto:

- Opción A: añadir condición `{inDrugClass: 'CORTICOIDE_SISTEMICO'}` → solo dispara si toma corticoides sistémicos.
- Opción B: añadir condición que incluya también otros gastrolesivos (AINE, antiagregantes) según la guía oficial.
- Opción C: revisar el wording de la guía v3 y aplicar literalmente lo que diga.

**Estado**: NO bloqueante para la entrega actual, pero conviene resolverlo en próxima iteración. Detectado durante la auditoría taxonómica de cierre del PROMPT 2 (consolidación CORTICOIDE → CORTICOIDE_SISTEMICO).

---

## Histórico — dudas obsoletas

Dudas que fueron retiradas porque la decisión técnica las dejó sin objeto:

- **B15-ISRS-QTC-PROLONGADO** (¿restringir a citalopram >20 mg/d y escitalopram >10 mg/d?) — **OBSOLETA tras PROMPT 4**: el sub-criterio B15-ISRS-QTC se eliminó al adoptar la Opción A (solo paraguas). Ya no aplica la pregunta porque no existe el criterio específico.
- **B15-NEUROLEPTICO-QTC-PROLONGADO** (¿restringir a haloperidol y fenotiazinas?) — **OBSOLETA tras PROMPT 4**: misma razón. El paraguas `PROLONGADOR_QTC` ya dispara únicamente para los neurolépticos que llevan esa clase (haloperidol, clorpromazina, levomepromazina, tioridazina, proclorperazina — los atípicos sin QT alargado no la llevan).
