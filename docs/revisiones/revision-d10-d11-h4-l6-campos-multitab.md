# Revisión — D10/D11 diagnósticos bloqueados, H4/L6 ubicación, campos dosis/duración multi-tab

Ronda solicitada por el usuario (2026-07-18). Corregir bugs de UI clínica
reportados al probar criterios D10, D11, H4 y L6, más el patrón general de
campos de dosis/duración que solo aparecen en un tab aunque el fármaco se
pueda marcar en varios.

Contexto: SPA Angular STOPP/START (`stopp-start-app`). Al cerrar, generar
informe resultado (`.md`) con qué se solucionó y cómo.

## Sección A — Diagnósticos bloqueados con medicación (D10, D11)

Alcance probable: dependencias diagnóstico↔medicamento, relevancia/visibilidad
de diagnósticos en el paso de diagnósticos (p. ej. `dx-dependencies`,
`system-relevance`, UI de diagnósticos).

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| A1 | D10 · Benzodiacepina en insomnio (>13 días = ≥2 semanas) | BUG | Al seleccionar benzodiacepina (tab SNC), el diagnóstico Insomnio sigue sombreado / no se puede seleccionar. Comprobación esperada: Insomnio + benzo → duración 14 aparece D10; duración 13 no; benzo ≥14 sin insomnio no aparece D10. Posible causa compartida con A2. |
| A2 | D11 · Hipnótico-Z en insomnio (>13 días = ≥2 semanas) | BUG | Igual que A1 con Zolpidem/Zopiclona (tab SNC): Insomnio permanece no seleccionable. Comprobación: Insomnio + Z → 14 días aparece D11; 13 no. Posible causa compartida con A1 (bloqueo de dx al marcar la clase/fármaco). |

## Sección B — Ubicación de fármacos en tabs (H4 corticoide, L6 analgésicos)

Alcance probable: taxonomía/catálogo de medicamentos y agrupación por tab
(`medications-taxonomy`, catálogo de meds, grupos en `meds-step`).

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| B1 | H4 · Dónde vive el corticoide sistémico vs AR | DUDA | Hoy el corticoide se marca en tab Respiratorio o Endocrino, pero el criterio H4 es AR + corticoide (contexto Osteo). Decidir: ¿mover corticoide (también) a Osteo, o dejarlo en Resp/Endo y no exigir presencia en Osteo? No cerrar como bug unilateral: es decisión de modelo/UX. Relacionado con C1 (campo días). |
| B2 | L6 · Analgésicos simples ausentes en tab Osteo | BUG | En tab Osteo no se ve el grupo «Analgésicos simples»; el usuario lo encuentra en Otros. Esperado para L6: Hepatopatía crónica o Malnutrición + Paracetamol vía Osteo → Analgésicos simples, con campo «Paracetamol (mg/día)». Comprobación: 3000 → L6; 2999 → no; ≥3000 sin hepato/malnutrición → no. |

## Sección C — Campos dosis/duración en todos los tabs del fármaco

Alcance probable: UI hardcodeada de inputs numéricos en `meds-step` (y modelo
`Med` / operadores del motor si aplica). Cruce con B1 (H4) y con el patrón
Digoxina ya inventariado en rondas previas de dosis/duración.

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| C1 | Campos dosis/duración solo en un tab (patrón Digoxina → generalizar) | BUG | Digoxina (y el resto de fármacos con dosis/duración) se pueden seleccionar en varios tabs, pero los campos de duración/dosis solo aparecen hardcodeados en un tab (p. ej. Digoxina en Renal). Debe mostrarse el/los campo(s) en **todos** los tabs donde ese medicamento esté presente. Aplicar el mismo patrón a todos los medicamentos con captura numérica (incl. benzos/Z para D10/D11, corticoide días para H4, paracetamol mg/día para L6). |
| C2 | H4 · Campo «(días)» desalineado del tab donde se marca el corticoide | BUG | Síntoma reportado: corticoide se marca en Respiratorio/Endocrino; el campo «(días)» aparece en tab Osteo. No tiene sentido UX. Causa probable compartida con C1 (inputs atados a un tab concreto, no al fármaco seleccionado). Comprobación tras fix: duración 91 → H4; 90 → no; no confundir con H5 (presencia). Coordinar con decisión B1 sobre ubicación del corticoide. |
| C3 | Umbrales D10/D11/H4/L6 tras arreglar UI | VERIFICAR | Cuando A1/A2/B2/C1/C2 permitan el flujo, verificar umbrales: D10/D11 14 vs 13 días; H4 91 vs 90 días; L6 3000 vs 2999 mg/día y que sin diagnóstico asociado no disparen. |

## Reglas de la ronda

- Corregir bugs con TDD (tests primero) según `CLAUDE.md` / `AGENTS.md`.
- Las DUDA no se cierran como decisión tomada: investigar opciones y trade-offs.
- Cada sección entrega informe con Corregidos / Verificados / Dudas / Bloqueados / tests.
- El orquestador de revisión aprueba cada informe antes de cerrar y escribe
  `docs/revisiones/revision-d10-d11-h4-l6-campos-multitab-resultado.md`.
