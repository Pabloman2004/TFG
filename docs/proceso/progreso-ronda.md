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
