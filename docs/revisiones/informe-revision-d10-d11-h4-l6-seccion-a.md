# Informe de sección: Diagnósticos bloqueados (D10, D11)

**Ronda:** `docs/revisiones/revision-d10-d11-h4-l6-campos-multitab.md`  
**Sección:** A — Diagnósticos bloqueados con medicación (D10, D11)  
**Orquestador:** `orquestador-seccion`  
**Fecha:** 2026-07-18  
**Estado:** pendiente de aprobación por `orquestador-revision` (no cerrado)

## Routing aplicado

| ID | Decisión | Resolutor |
|----|----------|-----------|
| A1 + A2 | Misma causa raíz probable (bloqueo de Insomnio al marcar clase en SNC) → una sola delegación | `resolutor-profundo` (`generalPurpose`) |

## Informe de sección: Diagnósticos bloqueados (D10, D11)

### Corregidos (bug confirmado y arreglado)

- **A1** [resuelto por: profundo]: Insomnio no se habilitaba al marcar benzodiacepina (SNC). Causa: `extractDrugClasses` en `dx-dependencies.ts` solo reconocía `inDrugClass`; D10 usa `medicationClassDurationAbove`, así que `BENZODIACEPINA` no entraba en los triggers de Insomnio y `isDiagnosisEnabled` devolvía `false`. Fix: reconocer también `medicationClassDurationAbove` (1.er arg = clase).
  - Ficheros: `src/app/core/data/dx-dependencies.ts`, `src/app/core/data/dx-dependencies.spec.ts`
  - Tests: extracción de clase desde el operador; `Insomnio` incluye `BENZODIACEPINA`; benzo habilita Insomnio; sin med relevante sigue deshabilitado.

- **A2** [resuelto por: profundo]: Misma causa raíz que A1 con `HIPNOTICO_Z` (D11 / Zolpidem–Zopiclona). Corregido en el mismo cambio.
  - Tests: extracción de `HIPNOTICO_Z`; hipnótico-Z habilita Insomnio.

**Comportamiento esperado tras fix:** benzo o Z en SNC → Insomnio seleccionable (tab Psiquiátrico) → Insomnio + duración 14 dispara D10/D11; 13 no; ≥14 sin Insomnio no dispara (umbrales del motor ya en `criteria-d.spec.ts`; UI de campos duración = Sección C, no tocada).

### Verificados (no era bug / no reproducible)

- Ninguno en esta sección.

### Pendientes de decisión humana (duda)

- Ninguno en esta sección.

### Bloqueados

- Ninguno. No hubo escalado fallido.

### Estado de tests

| Alcance | Resultado |
|---------|-----------|
| Antes | Bug reproducible en gating de dx (Insomnio sombreado con benzo/Z) |
| `dx-dependencies.spec.ts` | **72 SUCCESS** |
| Suite completa (`ng test --watch=false --browsers=ChromeHeadless`) | **655 SUCCESS** |
| `scripts/check-links.sh` | 12 problemas **preexistentes** (docs de revisión huérfanos / fuera de `_map.md`); no introducidos por este cambio |

### Evidencia de causa raíz (resumen)

Cadena: Insomnio gateado (`doubtful`) → `isDiagnosisEnabled` usa deps derivadas de `criteria.json` → D10/D11 referencian clase vía `medicationClassDurationAbove` → walker no extraía esa clase → triggers de Insomnio incompletos.

Nota para el orquestador de revisión: `system-relevance.ts` tiene un patrón análogo (ignora `medicationClassDurationAbove`) que afecta relevancia de tabs, no seleccionabilidad de dx — **fuera de alcance Sección A**; puede cruzar con otras rondas/secciones si se prioriza.

### Fuera de alcance (no tocado)

- Taxonomía de tabs / ubicación de fármacos (Sección B)
- Campos dosis/duración multi-tab (Sección C / C1–C3)
