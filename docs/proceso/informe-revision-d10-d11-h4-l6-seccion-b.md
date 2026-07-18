# Informe de sección: Ubicación de fármacos (H4, L6)

**Ronda:** `docs/revision-d10-d11-h4-l6-campos-multitab.md`  
**Sección:** B — Ubicación de fármacos en tabs (H4 corticoide, L6 analgésicos)  
**Orquestador:** `orquestador-seccion`  
**Fecha:** 2026-07-18  
**Estado:** pendiente de aprobación por `orquestador-revision` (no cerrado)

## Routing aplicado

| ID | Decisión | Resolutor | Modelo |
|----|----------|-----------|--------|
| B1 | DUDA de producto/UX → siempre profundo; solo investigación | `resolutor-profundo` (`generalPurpose`) | `composer-2.5-fast` (único slug permitido en Task; rol profundo sin implementación) |
| B2 | BUG acotado de taxonomía/relevancia | `resolutor-rapido` (`generalPurpose`) | `composer-2.5-fast` |

Nota: no se usó Sonnet. No se implementó decisión de producto en B1 ni el patrón multi-tab de campos (Sección C / C1–C2).

## Informe de sección: Ubicación de fármacos (H4, L6)

### Corregidos (bug confirmado y arreglado)

- **B2** [resuelto por: rápido]: En tab Osteo no se veía «Analgésicos simples» / Paracetamol; el usuario lo encontraba en el tab virtual «Otros».
  - **Causa:** el grupo `paracetamol` / `ANALGESICO_SIMPLE` **ya** estaba en `medications-taxonomy.ts` bajo `osteo`, pero un grupo unitario solo se muestra si la clase entra en `specificClassesByTab`. L6 usaba `medicationClassDoseMgAbove` (no extraído por `extractReferences`) y `system: "Analgésicos"` (transversal), así que `ANALGESICO_SIMPLE` no llegaba a relevancia específica de Osteo.
  - **Fix (patrón E1/Digoxina):** en `STOPP-L6-PARACETAMOL-DOSIS-ALTA-HEPATOPATIA`: `system` → `"Sistema musculoesquelético"` + `"relevance": {"medicationClasses":["ANALGESICO_SIMPLE"]}`. Sin cambiar lógica ni umbrales 3000/2999.
  - Ficheros: `src/assets/data/criteria.json`, `src/app/core/data/medications-taxonomy.spec.ts`, `src/app/core/group-visibility.spec.ts`
  - Tests: Paracetamol en Osteo bajo «Analgésicos simples»; no se relega a «Otros»; L6 en `criteria-l.spec.ts` intacto.

### Verificados (no era bug / no reproducible)

- Ninguno como descarte. Hallazgo colateral de B2: la taxonomía Osteo ya era correcta; el síntoma era de **relevancia/visibilidad**, no de catálogo ausente.

### Pendientes de decisión humana (duda)

- **B1** [investigado por: profundo]: H4 = AR + corticoide > 90 días. El motor no conoce tabs; la duda es 100 % taxonomía/UX.
  - **Estado actual:** `CORTICOIDE_SISTEMICO` es grupo propio en Respiratorio y Endocrino; en Osteo puede aparecer vía «Relevantes de otros sistemas» (foreign, por H5/H7/START-H2). El campo «(días)» está hardcodeado a `activeCategoryId === 'osteo'` (síntoma C2; causa estructural C1). H4 no aporta la clase a relevancia por sí solo (`medicationClassDurationAbove` no lo extrae `walk()`).
  - **Opción 1 — Añadir corticoide también como grupo propio en Osteo:** +1 copia en taxonomía (Resp+Endo+Osteo). Gana coherencia con flujo AR/osteo; pierde triple presencia y no elimina C2 si el usuario marca en Resp/Endo. Requiere validación dominio/producto.
  - **Opción 2 — Mantener solo Resp/Endo; no exigir Osteo; resolver desalineación con C1 (campos en todos los tabs del fármaco):** sin cambio de taxonomía; C2 se resuelve en raíz. Gana respeto a clase transversal (muchos criterios en otros sistemas); pierde grupo nativo osteo. Validación producto/UX.
  - **Opción 3 — Split intencional (marca en Resp/Endo, días en Osteo) con hints:** cero duplicación; peor UX si no hay C1; riesgo de falsos negativos H4 si el usuario no descubre el campo. Validación producto/UX obligatoria.
  - **No se eligió ganadora.** Acoplamiento con C1/C2 documentado; umbrales 91/90 → Sección C3.

### Bloqueados

- Ninguno. B2 no requirió escalado a profundo.

### Estado de tests

| Alcance | Resultado |
|---------|-----------|
| Antes (B2) | Paracetamol no visible como propio en Osteo → tab Otros |
| Tras B2: `medications-taxonomy.spec.ts` + `group-visibility.spec.ts` + `criteria-l.spec.ts` | **47 SUCCESS** |
| Suite completa | no re-ejecutada en esta sección (solo specs de alcance B2) |
| B1 | sin cambios de código |

### Fuera de alcance (no tocado)

- Campos dosis/duración multi-tab (C1), campo «(días)» del corticoide (C2), verificación umbrales post-UI (C3)
- Decisión de producto sobre ubicación del corticoide (B1)
- Diagnósticos bloqueados D10/D11 (Sección A)
