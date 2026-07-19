# Informe de sección: C — Campos dosis/duración multi-tab

Ronda: revisión D10/D11/H4/L6/campos multi-tab (2026-07-18).  
Orquestador: `orquestador-seccion`.  
**No cerrado por este agente** — pendiente aprobación de `orquestador-revision`.

## Routing aplicado

| IDs | Resolutor | Modelo | Motivo |
|-----|-----------|--------|--------|
| C1+C2 | `resolutor-profundo` | (delegación Task; rigor profundo) | BUG con causa compartida: UI hardcodeada por tab |
| C3 | `resolutor-rapido` | `composer-2.5-fast` | VERIFICAR umbrales post-fix |

## Informe de sección: C

### Corregidos (bug confirmado y arreglado)

- **C1** [resuelto por: profundo]: Campos de dosis/duración estaban acoplados a `activeCategoryId()` fijo en `meds-step.component.html`. Se generalizó a captura data-driven por clase de fármaco, visible en **todos** los tabs donde el med está presente (propia o foránea relevante).
  - Ficheros: `src/app/core/clinical-capture.ts` (+ `.spec.ts`), `meds-step.component.ts` / `.html` / `.spec.ts`, docs `@linked` (`docs/flujo-pasos.md`, `docs/_map.md`).
  - Tests: RED→GREEN DOM multi-tab (Digoxina cardio, corticoide Resp/Endo, etc.) + módulo puro; suite **669 SUCCESS**.

- **C2** [resuelto por: profundo, vía C1]: Campo «(días)» del corticoide ya no vive solo en Osteo; aparece en Respiratorio/Endocrino al marcar el corticoide ahí. **Taxonomía B1 no movida.**

### Verificados (no era bug / no reproducible)

- **C3** [resuelto por: rápido]: Umbrales del motor OK tras C1/C2; sin cambios de código.
  - D10/D11: 14 sí / 13 no; sin Insomnio no dispara (`criteria-d.spec.ts`).
  - H4: 91 sí / 90 no; H5 separado por presencia (`criteria-h.spec.ts`).
  - L6: 3000 sí / 2999 no; con hepato/malnutrición (`criteria-l.spec.ts`).
  - Suite focalizada D/H/L: **118 SUCCESS**.

### Pendientes de decisión humana (duda)

- Ninguna en esta sección. **B1** sigue abierta en Sección B (ubicación corticoide); fuera de alcance de C.

### Bloqueados

- Ninguno.

### Estado de tests

| Momento | Resultado |
|---------|-----------|
| Tras C1+C2 | Suite completa **669 SUCCESS** |
| Tras C3 | Focalizada criteria-d/h/l **118 SUCCESS** (sin cambios de código) |

### Notas para orquestador-revision

- Causa raíz C1=C2 confirmada (UI, no motor ni taxonomía).
- B1 permanece DUDA abierta; no se tomó decisión de producto.
- Informe listo para aprobación; **ronda no cerrada**.
