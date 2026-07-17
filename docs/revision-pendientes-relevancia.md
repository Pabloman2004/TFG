# Revisión — pendientes de relevancia visual y taxonomía

Manifiesto redactado a partir de las aclaraciones del usuario sobre
`docs/proceso/informe-revision-pendientes-relevancia.md` (fichero no presente
en el repo; el contenido se toma del texto aportado en la ronda).

## Sección: Relevancia diagnóstica

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| R1 | Transversales sin filtro de especificidad en diagnósticos | BUG | En el paso Diagnósticos, tab Renal, el bloque «Relevantes de otros sistemas» muestra Artrosis, Dolor neuropático, Caídas, HBP, HTA… sin relación renal. Llegan porque los sistemas transversales (Analgésicos, Caídas, Anticolinérgicos, Indicación) se expanden a todos los tabs. Para clases de medicamentos ya existe un filtro de especificidad; para diagnósticos no. Aplicar la misma idea al índice/visibilidad de diagnósticos. |
| R2 | Expansiones multi-tab demasiado amplias (SNC, urogenital) | BUG | `SYSTEM_TO_TABS` mapea un sistema a varios tabs: SNC → Neurológico+Psiquiátrico; urogenital → Urológico+Ginecológico. Consecuencia: «Psicosis» (solo STOPP-D21, neurolépticos/psiquiátrico) aparece también como relevante en Neurológico; «Vaginitis atrófica» (START-I3, solo mujeres) aparece en Urológico incluso con paciente varón porque el índice no mira el sexo. Afinar el mapeo o hacerlo por criterio. Comparte causa con R1: el índice de relevancia diagnóstica es demasiado amplio. |
| R3 | `egfrBelow` no indexa diagnósticos sustitutos | BUG | El motor (`criteria-engine.service.ts:254-269`) trata «Enfermedad renal grave» ≡ TFGe &lt; 30 e «Insuficiencia renal terminal» ≡ TFGe &lt; 15 y dispara E1–E10 correctamente. El extractor del índice de relevancia visual no entiende `egfrBelow`, así que esos dos diagnósticos nunca aparecen como relevantes foráneos. Hoy no se nota (ambos son nativos de Renal): deuda de integridad del índice. Completar el extractor/metadato para que el índice conozca esa dependencia. |

## Sección: Taxonomía de medicamentos

| ID | Item | Estado | Detalle |
|----|------|--------|---------|
| T1 | Renombrar tab «Antibióticos» → «Antiinfecciosos» | BUG | Decisión confirmada (ya no es DUDA). El nombre no viene de `criteria.json` (no existe sistema «Antibióticos»; los criterios de antibióticos caen bajo «Indicación de la medicación»). Es solo la etiqueta del tab de Medicamentos; el tab contiene también Antifúngicos y Antipalúdicos. El id interno `antibioticos` no cambia; solo el rótulo visible. |
| T2 | Eliminar `additionalCategories` obsoleto | BUG | Campo añadido a 17 grupos para forzar visibilidad en otros tabs. La visibilidad ahora se calcula desde criterios; ningún código de la app lo lee. Borrar el campo y sus usos en datos/docs sin efecto funcional. |
