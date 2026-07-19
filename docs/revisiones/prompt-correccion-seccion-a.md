# Prompt — Corrección de los hallazgos de la Sección A (motor de criterios)

> Redactado 2026-07-18 tras la ronda de revisión general. Decisiones del
> usuario ya incorporadas. Copiar todo lo de abajo como prompt del agente.

---

Actúas como agente corrector sobre el repo `C:\Users\jcarl\TFG\TFG` — app
Angular 20 standalone `stopp-start-app` que implementa los criterios
STOPP/START (TFG de farmacia clínica). Tu encargo es corregir los hallazgos de
la **Sección A (motor de criterios y datos clínicos)** de la ronda de revisión
general.

**Lee antes de empezar:**
- `docs/revisiones/informe-revision-general-seccion-a.md` — los 20 hallazgos
  (A1–A20) con evidencia `fichero:línea` y comprobaciones. Es tu fuente de
  verdad; incluye una adenda del 2026-07-18 que ya debes tener en cuenta
  (A11 parcialmente mitigado, L6 ya parcheado).
- `CLAUDE.md` — normas del proyecto. **TDD no negociable**: para cada fix,
  primero el test que reproduce el bug (en rojo), luego el cambio mínimo (en
  verde). Datos inmutables, sin `any`, sin comentarios superfluos.
- `src/assets/data/criteria.json` es el único fichero de criterios;
  `src/app/core/services/criteria-engine.service.ts` el motor;
  `src/app/core/data/` los catálogos.

**Reglas del encargo:**
- Trabaja en una rama nueva (`fix/seccion-a-motor-criterios`).
- Un commit por fix o por grupo coherente de fixes, mensajes en español.
  **No hagas push** y deja los commits listos para revisión.
- La suite se ejecuta con `npx ng test --watch=false --browsers=ChromeHeadless`.
  Antes de tu primer cambio, ejecútala y anota la línea base (669 SUCCESS al
  redactar esto). Debe quedar en verde tras cada commit.
- No toques nada del alcance de la Sección B (UI/servicios: historial,
  case-io, shell…), no muevas ni borres ficheros `.md`, y no crees el
  formulario de paciente (decisión pendiente de otra ronda).
- Al terminar, escribe `docs/revisiones/revision-seccion-a-motor-resultado.md` con:
  hallazgo → qué se hizo → tests añadidos → commit. Marca explícitamente lo
  que quede fuera o bloqueado.

## FASE 1 — Fixes clínicos del motor

1. **A1 — STOPP-C12** (`criteria.json:456`): la lógica no exige ISRS. Añade la
   cláusula `inDrugClass(ISRS)` al `and`. Test previo: anticoagulante +
   `antecedentes_sangrado_grave` **sin** ISRS no debe disparar (es el caso
   roto); mantén los tests existentes de `criteria-c.spec.ts:282` en verde.

2. **A2 — START-I3/I4 inalcanzables** (`criteria.json:1640,1647`): comparan
   `info.sex` con `"f"` pero el tipo es `'F' | 'M'` (`types.ts:4`). Fix en el
   motor, no en el JSON: `normalizeCase` (`criteria-engine.service.ts:65-80`)
   debe normalizar también `info.sex` a minúsculas en la copia de evaluación.
   Tests: I3 e I4 disparan con `sex: 'F'` + dx correspondiente sin estrógeno
   tópico, y no disparan con `sex: 'M'`. Nota: seguirán siendo poco
   alcanzables desde la UI hasta que exista formulario de paciente — eso está
   fuera de tu alcance; el fix vale para casos importados.

3. **A3 — STOPP-B20-ANTIHIPERTENSIVO** (`criteria.json:316-322`): la lógica
   solo evalúa `ANTIHIPERTENSIVO_CENTRAL`. Conviértela en `or` sobre las 4
   clases que ya prometen summary y excludes (`DIURETICO_ASA`,
   `DIURETICO_TIAZIDICO`, `ANTIHIPERTENSIVO_CENTRAL`, `ALFABLOQUEANTE`),
   siguiendo el patrón de K3 (`criteria.json:1178`). Test: furosemida o
   doxazosina + `estenosis_aortica_grave_sintomatica` dispara; verifica
   también que el greying (`getExcludedMedications`) funciona ahora sin
   necesitar un central.

4. **A5 — STOPP-C16** (`criteria.json:488`): añade `cardiopatia_isquemica` e
   `ictus_previo` a los diagnósticos negados. Test: `ictus_previo` + AAS no
   dispara (prevención secundaria); sin ningún dx aterosclerótico + AAS sigue
   disparando.

5. **A6 — STOPP-J3** (`criteria.json:1090`): cambia la clase de la lógica de
   `BETABLOQUEANTE` a `BETABLOQUEANTE_NO_CARDIOSELECTIVO` (existe en
   `medications.ts:327-328`; comprueba qué fármacos la portan). Test:
   bisoprolol NO dispara; carvedilol/propranolol sí.

6. **A7 — STOPP-B6** (`criteria.json:144`): el criterio es específico de
   amiodarona. Restringe la lógica al fármaco Amiodarona (busca cómo expresan
   otros criterios la coincidencia por fármaco concreto; si no hay patrón,
   usa la clase mínima que solo contenga amiodarona o un operador existente —
   no inventes operador nuevo sin necesidad). Mantén los excludes de clase
   (siguen siendo correctos para el greying). Test: flecainida +
   `taquiarritmias_supraventriculares` no dispara; amiodarona sí.

7. **A4 — STOPP-D12** (`criteria.json:628`): **decisión tomada — eximir
   quetiapina y clozapina** (excepciones STOPP v3). La lógica no debe
   disparar si el único neuroléptico del paciente es quetiapina o clozapina;
   sí si hay cualquier otro. Corrige el summary (elimina el confuso «bajo
   olanzapina y quetiapina») y los excludes para que sean coherentes (no
   proteger quetiapina/clozapina del greying es correcto; el resto de
   neurolépticos sí se greyan). Tests: haloperidol dispara; quetiapina sola
   no; quetiapina + haloperidol dispara.

8. **A9 — Sección K incoherente** (`criteria.json:1234,1258`): **decisión —
   `or` uniforme**, no unificar códigos (romperíamos casos guardados). Todos
   los criterios de la sección K que hoy usan `caidas_repeticion` o
   `riesgo_caidas_repeticion` deben aceptar **ambos** códigos con un `or`.
   Test de datos: recorre los criterios K y asserta que ninguno referencia
   solo uno de los dos códigos.

9. **A10 — STOPP-C4** (`criteria.json:377`): el exclude greya todos los
   anticoagulantes justo cuando START-C1/C7 recomiendan anticoagular. Cambia
   `excludes.drugClasses` de `ANTICOAGULANTE` a `ANTIAGREGANTE` (patrón C5,
   `criteria.json:385`). Test sobre `getExcludedMedications`: con FA +
   antiagregante, ningún anticoagulante queda excluido.

10. **A13 — START-H2** (`criteria.json:1584`): añade condición de duración
    con `medicationClassDurationAbove` sobre `CORTICOIDE_SISTEMICO` con el
    mismo umbral que H4 (`criteria.json:971`, >90 días). Test: prednisona 5
    días no dispara; 91 días sin bifosfonato/vit. D sí. Nota: la UI ya
    captura los días del corticoide en cualquier tab (`clinical-capture.ts`).

11. **A14 — STOPP-I7** (`criteria.json:1055`): **decisión — solo
    duloxetina**, fiel al texto STOPP. Restringe la lógica al fármaco
    Duloxetina (mismo mecanismo que elijas en A7) y añade el bloque
    `excludes` que falta (es el único STOPP sin él): `medications:
    ["Duloxetina"]` como mínimo. Test: venlafaxina no dispara; duloxetina sí.

12. **A8 — Checkbox combinado inerte** (`diagnoses.ts:139,366`): **decisión —
    conectar**. Añade `prostatismo_retencion_urinaria` al `or` de diagnósticos
    de D1 (`criteria.json:512`) y D4 (`criteria.json:560`). Test: ADT +
    `prostatismo_retencion_urinaria` dispara D1. (`aneurisma_aortico` y los
    fármacos DHP/calcio se quedan como registro clínico legítimo — se
    protegen con la lista blanca del guard de la Fase 2, no los toques.)

13. **Specs nuevas I/J/K/M**: crea `criteria-i.spec.ts`, `criteria-j.spec.ts`,
    `criteria-k.spec.ts` y `criteria-m.spec.ts` siguiendo el patrón de
    `criteria-d.spec.ts` y `criteria-test-helpers.ts`. Cobertura mínima: cada
    criterio de esas secciones con un caso que dispara y uno que no
    (incluidos los umbrales/negaciones que toques en esta ronda).

## FASE 2 — Robustez del motor y datos

14. **A11 — `extractReferences` con operadores custom**
    (`system-relevance.ts:72-99`): enséñale `medicationClassDurationAbove`,
    `medicationClassDoseMgAbove`, los operadores `multiple*` y
    `digoxinaDosisAlta` (mapa operador→clase; tienes el precedente exacto en
    `dx-dependencies.ts:35-39`). Después **elimina los parches ad hoc**
    `relevance.medicationClasses` de E1, F2, F4 y L6 en `criteria.json` y
    verifica que los tests de visibilidad/relevancia siguen en verde (si
    alguno cae, el extractor aún no cubre ese caso — arréglalo, no
    reintroduzcas el parche).

15. **A12 + guard catálogo↔criterios**: crea una spec de datos (p. ej.
    `criteria-data-integrity.spec.ts`) que falle si: (a) un id de
    `excludes.medications` no existe en `MEDICATIONS` — hoy fallaría por
    Paroxetina/Fluvoxamina en A3-ISRS/C12/D7: **elimínalas de los excludes**
    (no están en el catálogo); (b) una clase usada en lógica o excludes no
    tiene ningún fármaco que la porte; (c) un código de `DIAGNOSIS_MAP` no es
    referenciado por ningún criterio, con **lista blanca explícita y
    comentada** para los informativos deliberados (`aneurisma_aortico`,
    `enfermedad_renal_grave`, `insuficiencia_renal_terminal` — estos dos
    últimos se usan implícitamente vía `egfrBelow`, revisa antes de
    whitelistear); (d) análogo para clases de fármaco sin criterio, con lista
    blanca para las decorativas aceptadas (DHP, CALCIO, etc. — enuméralas).

16. **A15 — código muerto del motor**
    (`criteria-engine.service.ts:82-97`): elimina
    `normalizeCriterion`/`normalizeLogic` (las claves `drug_class`/`diagnosis`
    no existen en criteria.json y el deep-clone de 216 criterios por
    evaluación es coste puro). La suite completa debe seguir en verde — es tu
    red de seguridad de que no cambia el comportamiento.

17. **A20 — política de variantes HTA**: no cambies lógica; documenta en
    `docs/motor-criterios.md` la regla («criterios generales de HTA aceptan
    las 4 variantes; B5, específico de HTA no complicada, acepta solo
    `hta` y `hta_no_complicada`») y añade a la spec de datos del punto 15 un
    assert que la haga cumplir, para que cualquier criterio nuevo con HTA
    decida conscientemente.

## Qué NO hacer

- No tocar `system-relevance` más allá del punto 14, ni `group-visibility`,
  ni componentes de UI (salvo que un test de integración lo exija, en cuyo
  caso páralo y anótalo en el informe).
- No renombrar códigos de diagnóstico ni ids de criterio (rompen casos
  guardados y checklists).
- No commitear en `master` ni hacer push.
- Si un fix clínico te genera duda real (p. ej. el mecanismo para «solo
  amiodarona» en A7/A14 no tiene patrón limpio), implementa la opción menos
  invasiva y documenta la alternativa en el informe — no inventes operadores
  nuevos sin justificarlo.

## Cierre

Ejecuta la suite completa una última vez, anota el total en el informe
(`docs/revisiones/revision-seccion-a-motor-resultado.md`), y lista los commits creados
en orden con una línea por commit.
