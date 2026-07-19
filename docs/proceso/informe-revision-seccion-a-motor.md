# Informe de sección: A — Motor de criterios

**Rama:** `fix/seccion-a-motor-criterios`  
**Ronda:** corrección A1–A20 (manifiesto `docs/revision-seccion-a-motor-criterios.md`)  
**Orquestador:** `orquestador-seccion` (retomas #1 y #2)  
**Resolutores:** `resolutor-rapido` (composer-2.5-fast) · `resolutor-profundo` (Grok 4.5 heredado del orquestador; slug `cursor-grok-4.5-high-fast` no disponible en allowlist Task)  
**Push:** no  
**Cierre de ronda:** no (pendiente de `orquestador-revision`)

## Resumen

Todas las incidencias del manifiesto de corrección de la sección A quedaron **corregidas** con TDD, commits incrementales y suite final **805 SUCCESS**. No hay bloqueados ni dudas pendientes de decisión humana en esta ronda (las decisiones A4/A8/A9/A14/A20 venían tomadas en el plan).

## Corregidos (bug confirmado y arreglado)

### Ronda previa / retoma #1 (ya hechos al inicio de retoma #2)

- **A1** [rápido] `0690750`: STOPP-C12 exige `inDrugClass(ISRS)` además de anticoagulante + sangrado grave. Test en `criteria-c.spec.ts`. Suite tras fix: 670.
- **A2** [rápido] `97a1318`: `normalizeCase` normaliza `info.sex` a minúsculas para START-I3/I4. Spec inicial `criteria-i.spec.ts`. Suite: 676.
- **A5** [rápido] `fed7436`: STOPP-C16 niega también `cardiopatia_isquemica` e `ictus_previo`. Suite: 679.
- **A10** [rápido] `eeb7406`: STOPP-C4 `excludes.drugClasses` `ANTICOAGULANTE` → `ANTIAGREGANTE` (patrón C5). Suite: 680.

### Retoma #2 — rápido

- **A13** [rápido] `d90febe`: START-H2 usa `medicationClassDurationAbove(CORTICOIDE_SISTEMICO, 90)` como H4. Tests 5d vs 91d en `criteria-h.spec.ts`. Suite: 682.
- **A3** [rápido] `fcd06d7`: STOPP-B20 `or` sobre 4 clases (asa, tiazida, central, alfabloqueante). Evaluate + greying en `criteria-b.spec.ts`. Suite: 687.
- **A6** [rápido] `9c5c41a`: STOPP-J3 → `BETABLOQUEANTE_NO_CARDIOSELECTIVO`. Spec `criteria-j.spec.ts` (bisoprolol no; carvedilol/propranolol sí). Suite: 690.
- **A8** [rápido] `8f9a2b5`: `prostatismo_retencion_urinaria` en `or` de D1 y D4. Tests en `criteria-d.spec.ts`. Suite: 692.
- **A15** [rápido] `d2ac74b`: eliminados `normalizeCriterion`/`normalizeLogic` (código muerto). Suite: 692 (sin cambio de conteo).

### Retoma #2 — profundo

- **A7** [profundo] `80349b4`: STOPP-B6 restringe a Amiodarona vía `ANTIARITMICO_CLASE_III` (sin operador nuevo). Excludes de clase intactos. Tests en `criteria-b.spec.ts`.
- **A14** [profundo] `6860a91`: STOPP-I7 solo Duloxetina (clase singleton `DULOXETINA` + `excludes.medications`). Tests en `criteria-i.spec.ts`. Suite tras A7+A14: 697.
- **A4** [profundo] `b569b87`: STOPP-D12 exime quetiapina/clozapina (`some` + negación por `id`); summary/excludes coherentes. Tests en `criteria-d.spec.ts`. Doc mecanismo en `docs/motor-criterios.md`. Suite: 700.
- **A9** [profundo] `bd8b39b`: 14 STOPP-K aceptan `or` de `caidas_repeticion` y `riesgo_caidas_repeticion`. Spec `criteria-k.spec.ts` (datos + comportamiento). Suite: 707.
- **A11** [profundo] `cd52822`: `extractReferences` indexa `medicationClass*`, `multiple*`, `digoxinaDosisAlta`; retirados parches `relevance.medicationClasses` de E1/F2/F4/L6. Suite: 712.
- **A12** [profundo] `98b82bf`: guard `criteria-data-integrity.spec.ts`; eliminadas Paroxetina/Fluvoxamina de excludes A3-ISRS/C12/D7; whitelists dx/clases.
- **A20** [profundo] (mismo `98b82bf` + heartbeat `b8e3e4f`): política HTA documentada en `docs/motor-criterios.md` + assert en la spec de integridad. Suite: 717.
- **A16** [profundo] `f5bdbc2`: cobertura fire/no-fire I/J/K/M (amplía i/j/k; crea `criteria-m.spec.ts`). +88 specs. Suite: **805 SUCCESS**.

## Verificados (no era bug / no reproducible)

_Ninguno en esta ronda._

## Pendientes de decisión humana (duda)

_Ninguno. Decisiones A4/A8/A9/A14/A20 ya venían en el plan._

**Nota fuera de alcance (no bloquea cierre técnico de A):** START-I3/I4 y STOPP-B16 siguen dependiendo de `info` de paciente; la UI no captura edad/sexo (señalado en revisión general / Sección B). El motor ya normaliza `sex` (A2).

## Bloqueados

_Ninguno._

## Estado de tests

| Momento | Resultado |
|---------|-----------|
| Baseline al retomar #2 | ~680 SUCCESS |
| Tras A13–A15 (rápido) | 692 SUCCESS |
| Tras A7/A14/A4/A9/A11/A12+A20 | 717 SUCCESS |
| Tras A16 (final sección) | **805 SUCCESS** |

Comando: `npx ng test --watch=false --browsers=ChromeHeadless`

## Lista de commits (orden cronológico)

| Hash | Mensaje |
|------|---------|
| `0690750` | fix(A1): exigir ISRS en STOPP-C12 antes de disparar |
| `97a1318` | fix(A2): normalizar info.sex en el motor para START-I3/I4 |
| `fed7436` | fix(A5): ampliar negaciones de STOPP-C16 para prevención secundaria |
| `eeb7406` | fix(A10): corregir exclude de STOPP-C4 para no greyar anticoagulantes en FA |
| `d90febe` | fix(A13): START-H2 exige corticoide >90 dias como STOPP-H4 |
| `fcd06d7` | fix(A3): STOPP-B20 evalúa las 4 clases antihipertensivas en estenosis aórtica |
| `9c5c41a` | fix(A6): STOPP-J3 restringe a betabloqueantes no cardioselectivos |
| `8f9a2b5` | fix(A8): conectar prostatismo_retencion_urinaria a criterios D1 y D4 |
| `d2ac74b` | refactor(A15): eliminar normalizeCriterion/normalizeLogic muertos |
| `80349b4` | fix(A7): STOPP-B6 restringe a Amiodarona via ANTIARITMICO_CLASE_III |
| `6860a91` | fix(A14): STOPP-I7 solo Duloxetina y añade excludes |
| `b569b87` | fix(A4): STOPP-D12 exime quetiapina y clozapina (STOPP v3) |
| `bd8b39b` | fix(A9): criterios K aceptan ambos códigos de caídas con or |
| `cd52822` | fix(A11): extractReferences ve clases en operadores custom |
| `98b82bf` | fix(A12)+docs(A20): guard catálogo↔criterios y política variantes HTA |
| `b8e3e4f` | chore: heartbeat A12+A20 en progreso-ronda |
| `f5bdbc2` | test(A16): cobertura fire/no-fire de criterios I/J/K/M |

## Ficheros clave tocados (agregado)

- `src/assets/data/criteria.json` — lógica/excludes de criterios afectados
- `src/app/core/services/criteria-engine.service.ts` — A2, A15
- `src/app/core/services/system-relevance.ts` — A11
- `src/app/core/data/medications.ts` — clase singleton Duloxetina (A14)
- Specs: `criteria-{b,c,d,h,i,j,k,m}.spec.ts`, `criteria-data-integrity.spec.ts`, `system-relevance.spec.ts`
- Docs: `docs/motor-criterios.md`, `docs/proceso/progreso-ronda.md`

## Entrega a orquestador-revision

- Informe de sección: este fichero.
- Heartbeats: `docs/proceso/progreso-ronda.md`.
- **No** se ha escrito el resultado consolidado de ronda (`docs/revision-seccion-a-motor-criterios-resultado.md`); eso corresponde a `orquestador-revision` al cerrar.
