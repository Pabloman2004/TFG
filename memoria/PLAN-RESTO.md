# Contrato de redacción — capítulos restantes (ESEI Tipo I)

No reescribir caps. 1–3. Cuerpo ≤ 50 páginas. Español académico, tono de
`01-introduccion.tex` / `02-objetivos.tex` / `03-solucion-metodologia.tex`.
Citar con `\cite{...}` (IEEE/biblatex). Referencias cruzadas con `\cref{...}`.
Diagramas TikZ en escala de grises (estilo cap. 3). No inventar features.

## Hechos del sistema (no contradecir)

- SPA Angular 20, sin backend. Persistencia `localStorage`.
- Flujo real: `/medicaciones` → `/diagnosticos`. Resultados en las propias pestañas.
- Analítica: panel fijo en pestaña «Otros» de diagnósticos (`lab-capture.ts`).
- No hay historial (eliminado). No hay paso dedicado de datos del paciente.
- Dosis/duración: umbrales en el `summary` del criterio, no se editan en UI.
- Catálogo: ~215 criterios implementados (subcriterios) / 13 sistemas.
  Guía oficial STOPP/START v3: 190 (133 STOPP + 57 START).
- Motor: `json-logic-js` + operadores custom. Reglas en `criteria.json`.
- Salidas: PDF (pdfmake), JSON v1.0 (Zod), texto plano al portapapeles.
- Tests: Karma + Jasmine, TDD. ~800–1000 specs (contar `it(` reales).
- Tutores: Martín Pérez Pérez (informático) + cotutora clínica Raquel.
- Cronograma git: 2026-03 inicial; 04 reunión; 05 layout/CV; 06 UI+TDD;
  07 auditoría STOPP/START; 08 memoria.
- ECTS TFG: 12 → 300 h planificadas.

## Qué YA cubren los caps. 1–3 (NO repetir)

- Cap. 1: polimedicación, qué es STOPP/START v3, justificación, abordaje, no hay trabajos previos de otras materias.
- Cap. 2: objetivo principal, OE1–OE7 con alcance, fuera de alcance (HCE, juicio clínico, catálogo acotado, sin servidor, no ensayo clínico).
- Cap. 3: visión de la solución, diagrama de flujo usuario/motor, metodología iterativa, ciclo TDD, git y cuarentena de ideas.

Usar `\cref{cap:...}` para remitir, no reexplicar.

## Reparto (un tema = un capítulo)

| Cap | Archivo | Presupuesto | Debe incluir | Prohibido |
|-----|---------|-------------|--------------|-----------|
| 4 | `04-planificacion.tex` | 3–4 p | Plan + Gantt TikZ + horas est/real + desviaciones justificadas + puntos críticos | Explicar TDD o arquitectura |
| 5 | `05-arquitectura.tex` | 4 p | Módulos, directorios, dependencias, pipeline a nivel componentes, decisiones (SPA, JSON vs código, signals) | Operadores json-logic, RGPD, requisitos, clases UML detalladas |
| 6 | `06-tecnologias.tex` | 3 p | Versiones, justificación, licencias, fuente clínica no propia | Redibujar arquitectura |
| 7 | `07-requisitos.tex` | 4 p | Actor, RF/RNF verificables, casos de uso TikZ, análisis de dominio breve | Diseño de clases, persistencia detallada |
| 8 | `08-diseno.tex` | 4–5 p | Estático (clases/tipos) + dinámico (secuencia) + UI/iteraciones tutor | Listar RF, campos de criteria.json |
| 9 | `09-gestion-datos.tex` | 3–4 p | Catálogo, PatientCase, localStorage, RGPD, composición PDF | Algoritmo del motor |
| 10 | `10-pruebas.tex` | 3–4 p | Estrategia, conteos, validación vs guía, errores hallados (criterios inventados B) | Filosofía TDD (remitir cap. 3) |
| 11 | `11-manual-usuario.tex` | 4 p | Requisitos, install, uso. Wireframes TikZ (sin capturas aún) | Arquitectura |
| 12 | `12-aportaciones.tex` | 2 p | Tabla OE1–OE7 ↔ aportación | Nuevo contenido técnico |
| 13 | `13-conclusiones.tex` | 2 p | Técnicas ≠ personales (secciones separadas) | Repetir aportaciones |
| 14 | `14-trabajo-futuro.tex` | 2 p | Líneas concretas (qué, por qué, qué haría falta) | Repetir fuera de alcance como si fuera nuevo hallazgo |
| 15 | `15-anexos.tex` | sin límite | A: comandos; B: resumen sistemas/criterios; C: reserva diagramas | Material que deba estar en el cuerpo |

## Horas cap. 4 (reconstruidas; marcar como tales)

| Fase | Estimado (h) | Real (h) | Desviación |
| Análisis y documentación | 40 | 35 | −5 |
| Diseño | 45 | 62 | +17 |
| Implementación | 120 | 148 | +28 |
| Pruebas | 50 | 72 | +22 |
| Redacción de la memoria | 45 | 28 | −17 (en curso) |
| **Total** | **300** | **345** | **+45** |

Desviaciones a justificar: rondas UI con tutor (jun/jul); auditoría clínica (9 criterios inventados/redundantes en STOPP-B; revisión STOPP+START); TDD+guardas de catálogo; historial implementado y luego eliminado.

Puntos críticos: formalización de 190 criterios → reglas; motor declarativo; validación contra guía (falso negativo).

## Bibliografía

Puede añadirse a `referencias.bib` con claves nuevas únicas. Reutilizar:
`maher2014polypharmacy`, `omahony2023stopp`, `beck2002tdd`, `sacyl2023stopp`.

Claves reservadas sugeridas (no chocar):
`angular2026`, `jsonlogic`, `pdfmake`, `zod`, `material`, `rxjs`,
`iso25010`, `rgpd2016`, `aepdsalud`, `sommerville2016`, `cockburn2001`.

## Estilo LaTeX

- Conservar `\chapter`, `\label{cap:...}` existentes.
- Tablas `booktabs` / `longtable`. Figuras `[H]` con `\caption` y `\label{fig:...}`.
- No `any` conceptual: no afirmar features inexistentes.
- Compilar-safe: solo paquetes ya en `main.tex` (tikz, booktabs, longtable, cleveref, biblatex).
