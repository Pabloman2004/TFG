# Resultado — revisión dosis y duración estructurada en criterios STOPP/START

Manifiesto: `docs/revisiones/revision-dosis-duracion-medicacion.md`.
Plan derivado: `docs/propuestas/plan-mejora-dosis-duracion-medicacion.md`.

Ronda de solo verificación e investigación — no se ha modificado ningún
fichero de producción, tal y como pidió explícitamente el usuario ("compruébamelo
y haz un plan de mejora", sin implementar todavía).

## Corregidos

Ninguno. No aplicaba: los 15 ítems del manifiesto eran de verificación de
hechos o de dudas de arquitectura/producto/clínica, no bugs a corregir en
esta ronda.

## Verificados (hueco confirmado con evidencia fichero:línea)

- **DD-01**: confirmado — solo Digoxina, Hierro oral e IBP tienen dato
  numérico estructurado hoy (`Med` en `types.ts:19-25`; 3 bloques hardcodeados
  en `meds-step.component.html:140-194`).
- **DD-02** AAS >100 mg/día, **DD-03** Paracetamol ≥3 g/día, **DD-04** IBP
  "dosis terapéutica plena", **DD-06** AAS+clopidogrel >4 semanas, **DD-08**
  antipsicóticos SCPD >12 semanas, **DD-09** benzodiacepinas ≥4/≥2 semanas,
  **DD-10** hipnóticos Z ≥2 semanas, **DD-11** corticoides AR >3 meses,
  **DD-12** AINE/colchicina gota crónica >3 meses: confirmado que ninguno
  comprueba el umbral numérico que su propio `summary` menciona — todos
  disparan solo por presencia de clase/diagnóstico.
- **DD-07** anticoagulantes tras 1ª TVP/TEP >6 meses: confirmado que el
  umbral está codificado implícitamente en el nombre del diagnóstico
  (`tvp_primer_episodio_sin_factores_persistentes`), no como duración
  numérica — patrón de diseño distinto, no un hueco idéntico a los demás.
- **DD-14**: confirmada la afirmación del usuario — el resto de la sección E
  (dabigatrán, inhibidores Xa, AINE, colchicina, metformina, antagonistas de
  aldosterona, nitrofurantoína, bisfosfonatos, metotrexato) usa únicamente
  `egfrBelow`; la única excepción con dosis+duración propia en la sección E
  es E1-Digoxina.

Hallazgo adicional no anticipado en el reporte original del usuario: el
`summary` de `STOPP-D8-BENZODIACEPINA-USO-PROLONGADO` se contradice a sí
mismo sobre el umbral de semanas — merece revisión de texto clínico
independientemente de la captura de duración.

## Pendientes de decisión humana (duda)

- **DD-05 / STOPP-B21-DIGOXINA-FA**: el campo `durationDays` de Digoxina ya
  se captura en UI pero solo lo usa `STOPP-E1` (renal, umbral >90 días junto
  con dosis). `B21` (digoxina en FA, ">3 meses" en su summary) no comprueba
  duración. Reutilizar sin más el mismo dato mezclaría dos racionales
  clínicos distintos (toxicidad renal por acumulación vs. adecuación
  terapéutica en FA a largo plazo) bajo el mismo número. Requiere que el
  usuario decida si aplicar `durationDays > 90` también a B21, dejarlo como
  está, o documentar la coincidencia numérica como no intencional.
- **DD-13 / STOPP-H9-OPIOIDE-ARTROSIS**: el STOPP original no da un umbral
  numérico ("tratamiento prolongado" es cualitativo) — a decidir si merece
  capturar duración con un umbral arbitrario o dejarlo como está.
- **PLAN-01**: elección de arquitectura para escalar la captura de
  dosis/duración — Opción A (config data-driven), Opción B (componente
  `<med-dose-input>` reutilizable, complementaria a A) u Opción C (mantener
  el patrón manual, documentado). Ver `docs/propuestas/plan-mejora-dosis-duracion-medicacion.md`
  para el detalle completo, incluida la recomendación condicionada al volumen
  final de criterios que se decida implementar, y la tabla de priorización de
  los 8 criterios candidatos restantes (excluyendo IBP, ya resuelto).

## Bloqueados

Ninguno.

## Estado de tests

Antes y después de la ronda: `627 SUCCESS` (`npx ng test --watch=false
--browsers=ChromeHeadless`), sin fallos. No se modificó ningún fichero de
producción — coherente con no haber tocado tests tampoco.

## Ficheros modificados/creados en esta ronda

- `docs/revisiones/revision-dosis-duracion-medicacion.md` (manifiesto, creado)
- `docs/propuestas/plan-mejora-dosis-duracion-medicacion.md` (plan de mejora, creado)
- `docs/revisiones/revision-dosis-duracion-medicacion-resultado.md` (este documento, creado)

Ningún fichero de código de producción fue tocado.
