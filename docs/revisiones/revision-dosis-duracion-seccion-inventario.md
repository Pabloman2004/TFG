# Informe de sección: Inventario y verificación

Manifiesto: `docs/revisiones/revision-dosis-duracion-medicacion.md`  
Worktree: `C:\Users\jcarl\orca\workspaces\TFG\tarpon`  
Rama: `fix/diagnosticosComplex`  
Routing: D1 y D3 (`VERIFICAR`) → **`resolutor-rapido`** (protocolo aplicado por orquestador-seccion sin spawn anidado).  
Sin cambios de lógica de producción.

## Informe de sección: Inventario y verificación

### Corregidos (bug confirmado y arreglado)

_(ninguno)_

### Verificados (no era bug / no reproducible)

- **D1** [resuelto por: rápido]: La afirmación del manifiesto se **confirma**. Hoy solo Digoxina, Hierro oral e IBP capturan y evalúan umbrales numéricos de dosis/duración.
  - **Modelo `Med`** (`src/app/core/types.ts`): únicos campos numéricos opcionales `doseMcgDay`, `doseMgDay`, `durationDays`.
  - **UI** (`meds-step.component.html`): panel renal muestra Digoxina (`doseMcgDay` + `durationDays`) y `HIERRO_ORAL` (`doseMgDay`); panel gastrointestinal muestra `IBP` (`durationDays`). No hay otros inputs numéricos de dosis/duración.
  - **Motor** (`criteria-engine.service.ts`): operadores `digoxinaDosisAlta` (≥125 µg/día y >90 días), `medicationClassDurationAbove`, `medicationClassDoseMgAbove`.
  - **Criterios en `criteria.json`**: únicos usos — E1 (`digoxinaDosisAlta`), F2 (`medicationClassDurationAbove` IBP >56 días), F4 (`medicationClassDoseMgAbove` HIERRO_ORAL >200 mg).
  - **Tests existentes** que documentan el comportamiento: `meds-step.component.spec.ts`, `criteria-engine.service.spec.ts` (operador digoxina), `criteria-f.spec.ts` (IBP/hierro), `criteria-e.spec.ts` (E1).

- **D3** [resuelto por: rápido]: La afirmación del manifiesto se **confirma**. E2–E10 no dependen de dosis/duración de fármaco.
  - Lógica en `criteria.json`: patrón `inDrugClass` + `egfrBelow` (umbrales 10–50 según criterio). Sin `digoxinaDosisAlta`, `medicationClassDurationAbove` ni `medicationClassDoseMgAbove`.
  - En sección E, solo **E1** combina TFGe (`egfrBelow`) con umbral de dosis/duración de Digoxina.
  - `egfrBelow` admite TFGe analítica o diagnósticos equivalentes (`enfermedad_renal_grave` / `insuficiencia_renal_terminal`); no consulta campos de dosis/duración.
  - Specs E2–E10 en `criteria-e.spec.ts` ejercitan clase + TFGe/diagnóstico; solo E1 usa `doseMcgDay`/`durationDays`.

### Pendientes de decisión humana (duda)

_(ninguno en esta sección)_

### Bloqueados

_(ninguno)_

### Estado de tests

- Suite completa **no ejecutada** en esta ronda: evidencia por lectura estática de modelo, UI, operadores, `criteria.json` y specs ya existentes (`criteria-e`, `criteria-f`, `meds-step`, operadores del motor).
- No se escribió código de producción ni tests nuevos (ítems `VERIFICAR` confirmados; no hay síntoma que corregir).

---

## Anexos — reportes `resolutor-rapido`

### D1: Solo Digoxina, Hierro oral e IBP tienen dato numérico estructurado

Estado recibido: VERIFICAR  
Resultado: descartado (afirmación de inventario confirmada; no es bug)

Causa / hallazgo: captura UI y evaluación de umbrales numéricos de dosis/duración limitada a Digoxina (`doseMcgDay`/`durationDays` → E1), Hierro oral (`doseMgDay` → F4), IBP (`durationDays` → F2).  
Ficheros clave: `types.ts`, `meds-step.component.html`, `criteria-engine.service.ts`, `criteria.json` (E1/F2/F4).  
Suite: no re-ejecutada; specs existentes alineados con el hallazgo.

### D3: Resto de la sección E usa solo TFGe

Estado recibido: VERIFICAR  
Resultado: descartado (afirmación de inventario confirmada; no es bug)

Causa / hallazgo: E2–E10 = `inDrugClass` + `egfrBelow` únicamente. Sin dependencia de dosis/duración.  
Ficheros clave: `criteria.json` (STOPP-E2…E10), `criteria-e.spec.ts`, operador `egfrBelow` en `criteria-engine.service.ts`.  
Suite: no re-ejecutada; specs E2–E10 alineados con el hallazgo.
