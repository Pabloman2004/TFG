# Progreso de ronda â€” CorrecciÃ³n SecciÃ³n A motor de criterios (2026-07-18)

## 20:43 Â· orquestador-revision Â· arranque
- estado: routing
- detalle: Manifiesto en docs/revision-seccion-a-motor-criterios.md (17 Ã­tems BUG, 1 secciÃ³n). Lanzo orquestador-seccion A con modelo Cursor Grok 4.5. Resolutores: rÃ¡pido=composer-2.5-fast, profundo=cursor-grok-4.5-high-fast (sin Sonnet).

## 20:46 · orquestador-seccion · A — Motor de criterios
- estado: routing
- detalle: A1,A2,A3,A5,A6,A8,A10,A13,A15?rápido | A4,A7+A14,A9,A11,A12+A20,A16?profundo. Rama fix/seccion-a-motor-criterios. Orden: A1?A2?A5?A10?A13?A3?A6?A8?A7+A14?A4?A9?A15?A11?A12+A20?A16.

## 20:49 · resolutor-rapido · A1
- estado: investigando
- detalle: STOPP-C12 dispara con anticoagulante + antecedentes_sangrado_grave sin ISRS; lógica en criteria.json:456 carece de inDrugClass(ISRS).

## 20:52 · resolutor-rapido · A1
- estado: causa
- detalle: and solo exige ANTICOAGULANTE + antecedentes_sangrado_grave; falta inDrugClass(ISRS) coherente con summary y excludes.

## 20:52 · resolutor-rapido · A1
- estado: RED
- detalle: test nuevo en criteria-c.spec.ts falla (1 resultado donde se esperaban 0).

## 20:53 · resolutor-rapido · A1
- estado: GREEN
- detalle: añadida inDrugClass(ISRS) al and de STOPP-C12; suite 670 SUCCESS.

## 20:53 · resolutor-rapido · A1
- estado: listo
- detalle: fix A1 commiteado en fix/seccion-a-motor-criterios; sin push.

## 20:52 · orquestador-seccion · A — Motor de criterios
- estado: agregando
- detalle: A1 CORREGIDO por rápido (0690750). Suite 670 SUCCESS. Siguiente A2.

## 20:56 · resolutor-rapido · A2
- estado: investigando
- detalle: START-I3/I4 comparan info.sex con "f" pero el tipo almacena 'F'|'M'; normalizeCase no normaliza info.

## 21:00 · resolutor-rapido · A2
- estado: causa
- detalle: normalizeCase normaliza diagnoses/medications pero no info.sex; json-logic compara con "f" literal.

## 21:00 · resolutor-rapido · A2
- estado: RED
- detalle: criteria-i.spec.ts ? I3/I4 no disparan con sex:'F' (2 fallos).

## 21:08 · resolutor-rapido · A2
- estado: GREEN
- detalle: normalizeCase pasa info.sex a minúsculas; criteria-i.spec.ts 6 SUCCESS.

## 21:09 · resolutor-rapido · A2
- estado: listo
- detalle: suite completa 676 SUCCESS; fix A2 commiteado; sin push.

## 20:58 · orquestador-seccion · A — Motor de criterios
- estado: agregando
- detalle: A2 CORREGIDO por rápido (97a1318). Suite 676. criteria-i.spec.ts creado (A16 lo ampliará). Siguiente A5.

## 21:12 · resolutor-rapido · A5
- estado: investigando
- detalle: STOPP-C16 dispara con ictus_previo + AAS; faltan cardiopatia_isquemica e ictus_previo en negaciones.

## 21:16 · resolutor-rapido · A5
- estado: causa
- detalle: negaciones incompletas en STOPP-C16; faltan cardiopatia_isquemica e ictus_previo en el and.

## 21:16 · resolutor-rapido · A5
- estado: RED
- detalle: 2 tests C16 fallan (ictus_previo y cardiopatia_isquemica + AAS disparan indebidamente).

## 21:17 · resolutor-rapido · A5
- estado: GREEN
- detalle: añadidas negaciones cardiopatia_isquemica e ictus_previo en STOPP-C16; suite 679 SUCCESS.

## 21:17 · resolutor-rapido · A5
- estado: listo
- detalle: fix A5 commiteado en fix/seccion-a-motor-criterios; sin push.

## 21:05 · orquestador-seccion · A — Motor de criterios
- estado: agregando
- detalle: A5 CORREGIDO por rápido (fed7436). Suite 679. Siguiente A10.

## 21:26 · orquestador-revision · retoma
- estado: routing
- detalle: Usuario confirma retoma. Hechos A1/A2/A5 (0690750, 97a1318, fed7436; suite 679). Relanzo orquestador-seccion A desde A10. Modelo Grok 4.5; sin Sonnet.

## 21:27 · orquestador-seccion · A — Motor de criterios
- estado: routing
- detalle: Retoma post A1/A2/A5. Pendientes: A10?A13?A3?A6?A8 (rápido) | A7+A14?A4?A9 (profundo) | A15 (rápido) | A11?A12+A20?A16 (profundo). Sin Sonnet.

## 21:28 · orquestador-seccion · A — Motor de criterios
- estado: esperando-resolutor
- detalle: A10 ? resolutor-rapido (composer-2.5-fast)

## 21:29 · resolutor-rapido · A10
- estado: investigando
- detalle: STOPP-C4 excludes.drugClasses tiene ANTICOAGULANTE; greya anticoagulantes con FA+antiagregante sin combo activa.

## 21:29 · resolutor-rapido · A10
- estado: causa
- detalle: excludes debe ser ANTIAGREGANTE (patrón C5); probe anticoagulante dispara lógica pero no debe greyar ACOD.

## 21:30 · resolutor-rapido · A10
- estado: RED
- detalle: test C4 getExcludedMedications FA+antiagregante falla (apixaban excluido indebidamente).

## 21:31 · resolutor-rapido · A10
- estado: GREEN
- detalle: excludes.drugClasses ANTICOAGULANTE ? ANTIAGREGANTE en STOPP-C4; criteria-c.spec.ts verde.

## 21:32 · resolutor-rapido · A10
- estado: listo
- detalle: suite 680 SUCCESS; fix A10 commiteado (eeb7406); sin push.

## 21:35 · orquestador-seccion · A — Motor de criterios
- estado: agregando
- detalle: A10 CORREGIDO por rápido (eeb7406). Suite 680 SUCCESS. Siguiente A13.

## 21:35 · orquestador-seccion · A — Motor de criterios
- estado: esperando-resolutor
- detalle: A13 ? resolutor-rapido (composer-2.5-fast)

## 21:37 · orquestador-revision · retoma 2
- estado: routing
- detalle: Relanzo desde A13. Hechos A1/A2/A5/A10 (suite 680). Sin cambios a medias de código. Grok 4.5; sin Sonnet.

## 21:38 Â· orquestador-seccion Â· A â€” Motor de criterios
- estado: routing
- detalle: RETOMA #2. Hechos A1/A2/A5/A10. Pendientes rÃ¡pido A13â†’A3â†’A6â†’A8â†’A15; profundo A7+A14â†’A4â†’A9â†’A11â†’A12+A20â†’A16. Suite ~680. Sin cÃ³digo a medias.

## 21:38 Â· orquestador-seccion Â· A â€” Motor de criterios
- estado: esperando-resolutor
- detalle: A13 â†’ resolutor-rapido (composer-2.5-fast)

## 21:40 · resolutor-rapido · A13
- estado: investigando
- detalle: START-H2 usa inDrugClass sin medicationClassDurationAbove; patrón en STOPP-H4 (>90d).

## 21:43 · resolutor-rapido · A13
- estado: causa
- detalle: falta medicationClassDurationAbove CORTICOIDE_SISTEMICO >90 en START-H2; prednisona 5d dispara indebidamente.

## 21:43 · resolutor-rapido · A13
- estado: RED
- detalle: criteria-h.spec.ts START-H2 corto plazo falla (1 resultado esperado 0).
