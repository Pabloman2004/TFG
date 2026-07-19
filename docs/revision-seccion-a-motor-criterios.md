# Revisión — Corrección Sección A (motor de criterios)

Ronda correctiva sobre los hallazgos A1–A20 de la revisión general
(`docs/proceso/informe-revision-general-seccion-a.md`), con decisiones del
usuario ya tomadas en `plans/prompt-correccion-seccion-a.md`.

**Alcance:** `criteria.json`, `criteria-engine.service.ts`,
`system-relevance.ts`, catálogos en `src/app/core/data/`, specs de criterios.
**Fuera de alcance:** UI/servicios Sección B, formulario de paciente, renombrar
códigos, push a remoto.

**Convenciones:** TDD (test en rojo → fix mínimo), rama
`fix/seccion-a-motor-criterios`, un commit por fix/grupo, suite
`npx ng test --watch=false --browsers=ChromeHeadless` (baseline ~669 SUCCESS).

## Sección A — Motor de criterios y datos clínicos

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| A1 | STOPP-C12 sin ISRS | BUG | Añadir `inDrugClass(ISRS)` al `and` (`criteria.json:456`). Test: anticoag + sangrado grave sin ISRS no dispara. |
| A2 | START-I3/I4 inalcanzables | BUG | `normalizeCase` debe pasar `info.sex` a minúsculas (`criteria-engine.service.ts`). Tests I3/I4 con `sex: 'F'`/`'M'`. |
| A3 | STOPP-B20 solo centrales | BUG | Lógica `or` sobre 4 clases (patrón K3). Test furosemida/doxazosina + estenosis; greying sin central. |
| A4 | STOPP-D12 quetiapina/clozapina | BUG | Decisión: eximir quetiapina y clozapina. Corregir summary/excludes. Tests: halo sí; quetiapina sola no; quetiapina+halo sí. |
| A5 | STOPP-C16 negaciones incompletas | BUG | Añadir `cardiopatia_isquemica` e `ictus_previo` a dx negados. Test: ictus+AAS no dispara. |
| A6 | STOPP-J3 clase incorrecta | BUG | Cambiar a `BETABLOQUEANTE_NO_CARDIOSELECTIVO`. Test: bisoprolol no; carvedilol/propranolol sí. |
| A7 | STOPP-B6 no es solo amiodarona | BUG | Restringir lógica a fármaco Amiodarona (sin operador nuevo si hay patrón). Test: flecainida no; amiodarona sí. |
| A8 | Checkbox prostatismo inerte | BUG | Decisión: conectar `prostatismo_retencion_urinaria` al `or` de D1 y D4. Test: ADT + ese dx dispara D1. |
| A9 | Sección K códigos caídas | BUG | Decisión: `or` uniforme de ambos códigos (no unificar ids). Test de datos: ningún K referencia solo uno. |
| A10 | STOPP-C4 exclude incorrecto | BUG | `excludes.drugClasses`: `ANTICOAGULANTE` → `ANTIAGREGANTE` (patrón C5). Test greying. |
| A11 | extractReferences incompleto | BUG | Enseñar operadores custom en `system-relevance.ts`; quitar parches `relevance.medicationClasses` de E1/F2/F4/L6. |
| A12 | Guard catálogo↔criterios | BUG | Spec integridad: excludes huérfanos (quitar Paroxetina/Fluvoxamina), clases vacías, dx/clases sin criterio + whitelist. |
| A13 | START-H2 sin duración | BUG | Añadir `medicationClassDurationAbove` CORTICOIDE_SISTEMICO >90d (como H4). Test 5d vs 91d. |
| A14 | STOPP-I7 solo duloxetina | BUG | Decisión: restringir a Duloxetina + añadir `excludes.medications`. Test: venlafaxina no; duloxetina sí. |
| A15 | Código muerto normalizeCriterion | BUG | Eliminar `normalizeCriterion`/`normalizeLogic`; suite debe seguir verde. |
| A16 | Specs I/J/K/M ausentes | BUG | Crear `criteria-{i,j,k,m}.spec.ts` (mín. dispara/no por criterio). |
| A20 | Política variantes HTA | BUG | Documentar en `docs/motor-criterios.md` + assert en spec de datos (A12). |

### Notas de agrupación

- A7 y A14 comparten mecanismo «restringir a fármaco concreto».
- A11 y limpieza de parches en JSON van juntos.
- A12 + A20 comparten la spec de integridad de datos.
- A16 (specs nuevas) puede absorber tests de A6/A9/A14.

## Reglas de la ronda

- Corregir con TDD; no tocar UI/Sección B ni mover `.md` ajenos al encargo.
- Informe de sección → `docs/proceso/informe-revision-seccion-a-motor.md`.
- Resultado final del orquestador → `docs/revision-seccion-a-motor-criterios-resultado.md`
  (el prompt original pedía también `docs/revision-seccion-a-motor-resultado.md`;
  el orquestador consolidará ahí al cerrar).
- No cerrar dudas de producto como resueltas (en esta ronda las decisiones
  A4/A8/A9/A14/A20 ya vienen tomadas).
