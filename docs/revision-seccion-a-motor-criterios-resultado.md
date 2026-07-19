# Resultado — Corrección Sección A (motor de criterios)

- **Manifiesto:** `docs/revision-seccion-a-motor-criterios.md`
- **Informe de sección (aprobado):** `docs/proceso/informe-revision-seccion-a-motor.md`
- **Rama:** `fix/seccion-a-motor-criterios` (sin push)
- **Fecha cierre:** 2026-07-19
- **Suite (orquestador-revision):** **805 SUCCESS**
  (`npx ng test --watch=false --browsers=ChromeHeadless`)

## Corregidos (17/17)

| ID | Commit | Qué se hizo |
|----|--------|-------------|
| A1 | `0690750` | STOPP-C12 exige ISRS |
| A2 | `97a1318` | `normalizeCase` normaliza `info.sex` |
| A3 | `fcd06d7` | STOPP-B20 `or` de 4 clases antihipertensivas |
| A4 | `b569b87` | STOPP-D12 exime quetiapina/clozapina |
| A5 | `fed7436` | STOPP-C16 niega CI e ictus previo |
| A6 | `9c5c41a` | STOPP-J3 → no-cardioselectivo |
| A7 | `80349b4` | STOPP-B6 vía `ANTIARITMICO_CLASE_III` (solo Amiodarona) |
| A8 | `8f9a2b5` | prostatismo conectado a D1/D4 |
| A9 | `bd8b39b` | STOPP-K: `or` de ambos códigos de caídas |
| A10 | `eeb7406` | STOPP-C4 exclude → `ANTIAGREGANTE` |
| A11 | `cd52822` | `extractReferences` + sin parches E1/F2/F4/L6 |
| A12 | `98b82bf` | guard catálogo↔criterios; Paroxetina/Fluvoxamina fuera |
| A13 | `d90febe` | START-H2 duración corticoide >90d |
| A14 | `6860a91` | STOPP-I7 solo Duloxetina + excludes |
| A15 | `d2ac74b` | eliminados `normalizeCriterion`/`normalizeLogic` |
| A16 | `f5bdbc2` | specs fire/no-fire I/J/K/M |
| A20 | `98b82bf` | política HTA en `docs/motor-criterios.md` + assert |

Commits auxiliares: `b8e3e4f` (heartbeat A12+A20).

## Verificados / descartados

Ninguno.

## Dudas pendientes

Ninguna en esta ronda (A4/A8/A9/A14/A20 venían decididas).

**Fuera de alcance (no bloquea):** captura UI de edad/sexo para I3/I4/B16 — Sección B / otra ronda.

## Spot-check orquestador-revision

- A7: solo Amiodarona porta `ANTIARITMICO_CLASE_III` en catálogo — OK.
- A14: clase singleton `DULOXETINA` + excludes — OK.
- A4: lógica `some` + negación por id; summary coherente — OK.
- A1/A10: ISRS en C12; exclude C4 = ANTIAGREGANTE — OK.
- Suite re-ejecutada: **805 SUCCESS**.

## Estado

Ronda **cerrada y aprobada**. Código listo en rama local para revisión humana / PR; sin push.
