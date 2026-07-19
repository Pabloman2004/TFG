# Manifiesto de revisión — Revisión general del proyecto (2026-07-17)

Ronda de revisión global solicitada por el usuario: (1) buscar bugs,
contradicciones y mejoras en todo el proyecto; (2) inventariar y proponer una
reorganización de todos los `.md` (cuáles borrar, cuáles conservar, en qué
carpetas); (3) entregar un informe final consolidado con bugs + plan de acción
+ propuesta de reorganización documental.

Contexto: app Angular 20 standalone (`stopp-start-app`) que implementa los
criterios STOPP/START. Código en `src/app` (core/data, core/services, steps,
historial, shared). 54 ficheros `.md` fuera de `node_modules`.

## Sección A — Motor de criterios y datos clínicos

Alcance: `src/app/core/services/criteria-engine.service.ts`,
`src/app/core/data/*` (taxonomías, diagnósticos, medicamentos,
`system-relevance`, `dx-dependencies`), `criteria-groups.ts` y el JSON de
criterios que consuman.

1. Bugs y contradicciones lógicas en la evaluación de criterios (operadores
   json-logic, `excludes`, negaciones, umbrales de TFGe/edad).
2. Incoherencias entre catálogo de medicamentos/diagnósticos y las referencias
   usadas por los criterios (ids huérfanos, clases sin miembros, duplicados).
3. Incoherencias en relevancia por sistema y visibilidad multiclase tras los
   últimos commits (1a49c0b, 54f29f4).
4. Mejoras concretas (simplificación, tipos, datos muertos como
   `additionalCategories` si sigue sin uso).

## Sección B — Servicios de aplicación y UI

Alcance: `case-store`, `case-io`, `report.service`, `display-settings`,
`group-visibility`, `group-checked`, `clipboard-text`, componentes de
`steps/`, `historial/`, shell (`app.ts`, rutas, diálogos), `tooltip.directive`.

1. Bugs de estado y persistencia (localStorage, import/export de casos,
   historial, reset).
2. Bugs de UI/flujo (navegación entre pasos, visibilidad de grupos, informe
   PDF con pdfmake, portapapeles).
3. Mutabilidad, `any`/asserts, huecos de test evidentes contra CLAUDE.md.
4. Mejoras concretas priorizadas.

## Sección C — Coherencia documental y contradicciones docs↔código

Alcance: todos los `.md` de raíz, `docs/`, `plans/`, `analysis/`, `.cursor/`.

1. Contradicciones entre documentos y el código actual (docs que describen
   comportamiento ya cambiado, planes marcados pendientes ya ejecutados,
   checklists obsoletos).
2. Duplicados byte a byte o casi (p. ej. `STOPP_START_CRITERIOS_CONTEXTO.md`,
   `RALPH.md`, `VERIFICATION.md`, `dudas-raquel-pendientes.md` en raíz vs
   `docs/`): confirmar cuál es la copia viva.
3. Documentos que contradicen a otros documentos.

## Sección D — Inventario y reorganización de `.md`

Alcance: los 54 `.md` del proyecto (fuera de `node_modules`).

1. Inventario completo: propósito de cada fichero en una línea, si está vivo,
   obsoleto o duplicado.
2. Propuesta de estructura de carpetas (p. ej. `docs/clinico/`,
   `docs/proceso/`, `docs/revisiones/`, `plans/` solo con planes activos) y
   destino de cada fichero: CONSERVAR (con ruta destino), FUSIONAR o BORRAR,
   con justificación de una línea.
3. Ficheros de operación del agente (CLAUDE.md, AGENTS.md, MEMORY.md,
   TASKS.md, scratchpad.md): marcar como intocables o proponer destino sin
   romper el tooling.

## Reglas de la ronda

- Solo análisis: **no se cambia código ni se mueve/borra ningún fichero** en
  esta ronda; todo queda como propuesta en los informes.
- Cada sección entrega un informe con hallazgos verificados con
  `fichero:línea`, severidad (alta/media/baja) y comprobación reproducible.
- El orquestador de revisión aprueba cada informe de sección antes de cerrar
  la ronda y consolida el resultado en
  `docs/revisiones/revision-general-2026-07-17-resultado.md`.

## Estado (actualizado 2026-07-18)

- Ronda **cerrada**: los 4 informes de sección fueron revisados y aprobados
  por el orquestador; consolidado en
  `docs/revisiones/revision-general-2026-07-17-resultado.md` (48 hallazgos: 6 altas,
  19 medias, 23 bajas + inventario de `.md`).
- **Posterior al cierre**, la ronda correctiva
  `docs/revisiones/revision-d10-d11-h4-l6-campos-multitab.md` aplicó fixes de UI clínica
  (D10/D11 dx bloqueados, L6 en Osteo, campos dosis/duración multi-tab vía
  `clinical-capture.ts`). El orquestador verificó su diff y la suite completa
  (**669 SUCCESS**) y añadió una **adenda fechada 2026-07-18** a cada informe
  de sección (a: A11 mitigado parcialmente; b: B12 9→2 `$any`, helpers
  muertos nuevos, líneas desplazadas; c: C13 ampliado; d: +7 `.md`, totales
  62) y al consolidado. Las adendas registran el impacto sin reescribir los
  hallazgos originales.
