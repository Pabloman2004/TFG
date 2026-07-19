
# TASKS — Ralph loop sobre docs/proceso/REVIEW.md

Reglas para el agente:
- Coge SIEMPRE la primera tarea [ ] de arriba a abajo (están ordenadas por prioridad).
- Antes de editar cualquier fichero, lee sus @linked y actualiza los docs si el cambio los afecta.
- Cada tarea termina con: su VERIFICAR en verde + `npm test` sin regresiones + `./scripts/check-links.sh` exit 0 + commit con mensaje `fix(tasks): T<n> <resumen>`.
- Apunta decisiones y aprendizajes en scratchpad.md.
- Si una tarea no se puede completar, márcala [E] con el motivo en scratchpad.md y pasa a la siguiente. NO la dejes a medias: revierte antes de pasar.
- Estados: [ ] pendiente · [/] en curso · [x] hecha · [E] atascada

---

## Críticos

[x] T1 — Registrar la ruta del historial. Añadir `{ path: ROUTES.HISTORIAL, component: HistorialComponent }` en `src/app/app.routes.ts` (el fix exacto está propuesto en docs/historial.md).
    VERIFICAR: test de routing que navega a '/historial' y comprueba que renderiza HistorialComponent (no redirige al wildcard). Escribe el test ANTES del fix y comprueba que falla.

[x] T2 — Corregir el CTA del estado vacío del historial: `routerLink="/paciente"` en `historial.component.html` debe apuntar a una ruta existente (usar la constante de ROUTES que corresponda al inicio del flujo, no un literal).
    VERIFICAR: test que comprueba que el routerLink del CTA coincide con una ruta registrada en app.routes.ts.

[x] T3 — `criteriaCache`: invalidar la caché en error en `criteria-engine.service.ts`. Si la carga HTTP de criteria.json falla, la promesa rechazada NO debe quedar cacheada; la siguiente llamada a loadCriteria() debe reintentar.
    VERIFICAR: test que simula fallo HTTP en la primera carga, comprueba el rechazo, luego simula éxito y comprueba que la segunda llamada carga bien.

## Altos

[x] T4 — Endurecer la validación de importación en `case-io.service.ts`: validar tipos internos de Med, PatientInfo y Labs (campos obligatorios y tipos primitivos). Un JSON con shape inválido debe rechazarse con error claro, no pasar silenciosamente.
    VERIFICAR: tests con al menos 4 fixtures corruptos (med sin id, labs con string donde va número, patient null, export sin version) → todos rechazados; y un fixture válido → aceptado.

[x] T5 — Crear suite de tests para `report.service.ts`: cubrir buildCriteriaContent, buildTwoColumnSection y buildHeader con un caso clínico de ejemplo. No cambiar la lógica del servicio salvo que un test revele un bug real (si lo revela: arreglar y documentarlo en scratchpad.md).
    VERIFICAR: nuevos specs en verde, cobertura sobre esas tres funciones, npm test global en verde.

[x] T6 — Arreglar `scripts/verify-pdf-e2e.js`: (a) re-guardar como UTF-8 sin bytes nulos; (b) revisar la API de pdf-parse contra la versión instalada en package.json y corregir el uso si `new PDFParse({data}).getText()` no es la API real.
    VERIFICAR: `file scripts/verify-pdf-e2e.js` no lo detecta como binario (sin bytes nulos) y el script se ejecuta end-to-end sin lanzar TypeError.
+
[x] T7 — Eliminar el componente raíz duplicado (stub del CLI): borrados `src/app/app.ts`, `app.html`, `app.css` y `app.spec.ts`. `app.config.ts` se conserva como fuente única de providers (`main.ts` → `AppComponent` + `appConfig`). Hecho en `f2e0311` (B5/B6).
    VERIFICAR: `npm run build` en verde, npm test en verde, grep confirma que nada importa los stubs borrados, check-links.sh exit 0.

## Medios

[x] T8 — Unificar el cálculo de visibilidad de grupos dentro de cada componente de paso: `groupBuckets` (computed) y `groupsVisibleInTab`/`dxGroupsVisibleInTab` deben compartir una única fuente (extraer la lógica común a una función pura, idealmente en group-checked.ts o un helper nuevo testeable).
    VERIFICAR: tests unitarios de la función extraída + los dos componentes la usan + comportamiento visible sin cambios (tests existentes en verde).

[x] T9 — `normalizeDiagnosis`: el fallback debe normalizar acentos (NFD) igual que la función `slug` de diagnoses-taxonomy.ts. Exportar/reutilizar slug en lugar de duplicar. Añadir tests directos de normalizeDiagnosis (con y sin acentos, con entrada ya mapeada en DIAGNOSIS_MAP).
    VERIFICAR: test "Ictús agudo" → clave sin acento; tests del mapa existente sin regresión.

[x] T10 — Confirmación al eliminar caso del historial: reutilizar el patrón del confirm-reset-dialog existente para `delete(id)` en historial.component.ts.
    VERIFICAR: test que comprueba que delete sin confirmar NO borra y con confirmación SÍ borra.

[x] T11 — Sustituir el cache-bust `?v=Date.now()` de loadCriteria() por una constante de versión (p.ej. importada de un fichero version.ts o de environment), de modo que criteria.json sea cacheable entre recargas dentro de una misma build.
    VERIFICAR: test/grep que confirma que la URL de fetch no contiene Date.now() y sí la constante.

[x] T12 — `formatDate` del historial: ante fecha no parseable devolver un fallback legible en lugar de "Invalid Date".
    Hecho en `bbc405a` (fallback `'Fecha desconocida'`); la feature historial se eliminó después en `63d175f` (B1), así que el código ya no está en el árbol.
    VERIFICAR: (histórico) test con savedAt corrupto → renderiza fallback.

## Bajos (limpieza)

[ ] T13 — Eliminar código muerto en los componentes de paso: `lastCriterionId` (declaración y cálculo en ambos) y el import sin uso de MEDICATIONS en diagnosis-step.component.ts.
    VERIFICAR: grep confirma cero referencias restantes; build y tests en verde.

[ ] T14 — `critCode(id)`: definir comportamiento para formatos inesperados (un solo guion, vacío) y testearlo. Mantener el contrato actual (devolver '') pero hacerlo explícito con tests y un comentario.
    VERIFICAR: tests de los casos borde en verde.

[ ] T15 — `criteria.json`: añadir campo `version` al JSON y comprobación en loadCriteria() que avise por consola si la versión no es la esperada.
    VERIFICAR: test de carga con versión incorrecta → warning; con versión correcta → silencio.

[ ] T16 — Ampliar cobertura de `getExcludedMedications()` a las secciones A, B y D usando criteria-test-helpers.ts (mover allí las factories locales de criteria-e.spec.ts en lugar de duplicarlas).
    VERIFICAR: nuevos specs en verde; criteria-e.spec.ts ya no define factories locales.

---

## FUERA DEL LOOP — decisiones humanas pendientes (NO tocar)

- #8 REVIEW: unificar MedsStepComponent/DiagnosisStepComponent (~800 líneas CSS duplicadas) — refactor grande, planificar aparte con su propio workflow.
- #10: los tres effect() encadenados con allowSignalWrites — revisar diseño reactivo aparte; tocarlo a ciegas es arriesgado.
- #11a (resuelto): `additionalCategories` sin consumidor — eliminado del taxonomy, del espejo en `scripts/gen-checklist-tabs.js` y cubierto por test de regresión en `medications-taxonomy.spec.ts`. La visibilidad cruzada sigue siendo por intersección de clases (`group-visibility.ts`).
- #11b: estrategia de duplicación física de grupos en medications-taxonomy (`diur_asa`, `antag_aldo`, `isglt2`…) — sigue pendiente, requiere decisión de diseño del autor.
- #16: separar estado UI/dominio en CaseStoreService — refactor estructural.
- #26: sexo binario hardcodeado — decisión de producto/datos.
- #28: ancho fijo 590px — decisión de diseño visual.
- #30: lazy loading de rutas — decisión de arquitectura (tolerable hoy).
- #32: DIAGNOSIS_SUBGROUPS solo cardiovascular — confirmar si es alcance previsto.
- #21, #22, #29, #31, #33: menores/informativos — revisar en una pasada manual.
