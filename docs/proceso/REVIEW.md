# REVIEW — Problemas de código detectados en el análisis

Consolidado de los hallazgos de `analysis/*.md` (fase de análisis del patrón
Linked Chunks), ordenados por gravedad. Cada ítem indica el análisis de origen.
Este fichero solo reporta: no se ha corregido nada de lo listado.

---

## 🔴 Críticos (bugs funcionales visibles para el usuario)

1. **`HistorialComponent` no está registrado en `app.routes.ts` — la vista de
   historial es inaccesible.** `ROUTES.HISTORIAL = 'historial'` existe en
   `src/app/app.routes.constants.ts`, pero no hay entrada
   `{ path: ROUTES.HISTORIAL, component: HistorialComponent }` en
   `src/app/app.routes.ts`. Navegar a `/historial` cae en el wildcard `**` y
   redirige silenciosamente a `/medicaciones`. Todo el módulo
   `src/app/historial/` es hoy código muerto. *(analysis/historial.md,
   analysis/app-shell.md; el fix exacto está propuesto en docs/historial.md)*

2. **CTA del estado vacío del historial apunta a una ruta inexistente.**
   `routerLink="/paciente"` en `historial.component.html` no existe en la
   tabla de rutas (solo hay `diagnosticos`, `medicaciones` y `**`); redirige
   silenciosamente al wildcard. *(analysis/historial.md)*

3. **`criteriaCache` no se invalida en error.** En
   `criteria-engine.service.ts`, si la primera carga HTTP de `criteria.json`
   falla, la promesa rechazada queda cacheada y todas las llamadas
   posteriores a `loadCriteria()` reciben el mismo rechazo sin reintento: la
   evaluación de criterios queda inutilizada hasta recargar la página.
   *(analysis/core-services.md)*

---

## 🟠 Altos (riesgo de datos corruptos o regresiones sin red de seguridad)

4. **Validación de importación superficial en `case-io.service.ts`.**
   `isCaseExport`/`isPatientCase` solo comprueban que `diagnoses` y
   `medications` sean arrays y `version` string; no validan los tipos
   internos de `Med`, `PatientInfo` ni `Labs`. Un JSON corrupto pasa la
   validación y puede provocar errores silenciosos aguas abajo en el motor.
   *(analysis/core.md)*

5. **`report.service.ts` (≈280 líneas) sin ningún test.** Es el fichero más
   complejo del core (`buildCriteriaContent`, `buildTwoColumnSection`,
   `buildHeader`); un error en la generación del PDF clínico solo se
   detectaría en runtime. *(analysis/core.md)*

6. **Ausencia total de tests en `src/app/steps/` y `src/app/historial/`.**
   Los dos componentes de pasos concentran la lógica de UI más compleja
   (buckets foráneos, efectos en cadena, limpieza de tabs revisados) y no
   tienen ni un spec. Historial tampoco — relevante dado su bug de ruta.
   *(analysis/steps.md, analysis/historial.md)*

7. **`scripts/verify-pdf-e2e.js` usa una API de `pdf-parse` posiblemente
   incorrecta.** `new PDFParse({ data: ... }).getText()` no es la API pública
   habitual (`pdfParse(buffer)`); el script puede estar roto. Además el
   fichero contiene bytes nulos (codificación no estándar) que hacen que
   `grep` lo trate como binario. *(analysis/app-shell.md; codificación
   detectada por el verificador)*

---

## 🟡 Medios (deuda de diseño con riesgo de desincronía)

8. **Duplicación severa entre `MedsStepComponent` y
   `DiagnosisStepComponent`.** Replican casi toda la infraestructura (mismos
   efectos, señales, `saveCase`, `onFileLoad`, `resetCase`, `onExportPdf`,
   `copyCriteria`…) y ~800 líneas de CSS prácticamente idénticas. Candidato a
   componente base o servicio de UI compartido. *(analysis/steps.md)*

9. **Lógica duplicada dentro de cada componente de paso:** `groupBuckets`
   (computed) y `groupsVisibleInTab`/`dxGroupsVisibleInTab` (método privado)
   calculan casi lo mismo; modificar uno y no el otro produce inconsistencias
   de visibilidad. *(analysis/steps.md)*

10. **Tres `effect(..., { allowSignalWrites: true })` encadenados en
    `DiagnosisStepComponent`** que escriben en `store.diagnoses()` y en los
    tabs revisados; riesgo de ciclos reactivos difíciles de depurar si fallan
    las guardas. *(analysis/steps.md)*

11. **Duplicación de grupos en `medications-taxonomy.ts` sin estrategia
    uniforme.** Grupos repetidos a mano en varias categorías (`diur_asa`,
    `antag_aldo`, `isglt2`, `opioides`…). Editar un grupo en una categoría y
    olvidar su copia produce desincronías. *(analysis/core-data.md)*

12. **Componente raíz duplicado: `App` (stub) vs `AppComponent` (real).**
    `main.ts` arranca `AppComponent`; `src/app/app.ts`, `app.html`, `app.css`
    y `app.config.ts` son restos del scaffolding de Angular CLI que generan
    confusión sobre cuál es la raíz. Eliminarlos en bloque (incluido
    `app.spec.ts`). *(analysis/app-shell.md)*

13. **`normalizeDiagnosis` no normaliza acentos en su fallback.**
    `d.toLowerCase().replace(/\s+/g, "_")` genera claves inconsistentes para
    diagnósticos fuera de `DIAGNOSIS_MAP` (`"Ictús agudo"` → `"ictús_agudo"`).
    La función `slug` de `diagnoses-taxonomy.ts` sí normaliza NFD pero es
    interna. Además `normalizeDiagnosis` no tiene tests directos.
    *(analysis/core-data.md)*

14. **Cache-bust incondicional `?v=Date.now()` en `loadCriteria()`** impide
    cachear `criteria.json` entre recargas en producción; sustituir por hash
    de build o versión fija. *(analysis/core-services.md)*

15. **Eliminar caso del historial sin confirmación ni undo.** `delete(id)`
    borra permanentemente al primer clic. Contrasta con el reset de caso, que
    sí pide confirmación. *(analysis/historial.md)*

16. **`CaseStoreService` mezcla estado de UI con estado de dominio**
    (`activeSystem`, `activeSystemTab`, `collapsedSections` junto a
    `patient`/`meds`/`labs`), dificultando el test aislado y una futura
    extracción del store. *(analysis/core.md)*

---

## 🟢 Bajos (robustez, limpieza y cobertura menor)

17. **`lastCriterionId` se declara y calcula en ambos componentes de paso pero
    ningún template lo usa** — funcionalidad eliminada o pendiente
    (¿scroll-to-new-criterion?). *(analysis/steps.md)*

18. **Import residual de `MEDICATIONS` en `diagnosis-step.component.ts`** sin
    ningún uso en el componente. *(analysis/steps.md)*

19. **`critCode(id)` asume el formato `TYPE-CODE-REST`**; con un solo guion o
    formato distinto devuelve `''` sin aviso, y ese caso no está testeado.
    *(analysis/core.md)*

20. **Logo del PDF con ruta hardcodeada y fallo silencioso.**
    `loadLogoBase64()` hace `fetch('assets/logoTFG.png')` y devuelve `null`
    sin error visible si el asset se mueve o renombra. *(analysis/core.md)*

21. **`loadScale()` accede a `localStorage` en tiempo de carga del módulo**
    (`display-settings.service.ts`, función a nivel de módulo): frágil en SSR
    o en tests que no mockeen `localStorage` antes del import.
    *(analysis/core.md)*

22. **`registerCustomOperators()` muta el estado global de `json-logic-js`**
    en lugar de una instancia aislada; idempotente hoy, frágil si se
    necesitaran motores con operadores distintos. *(analysis/core-services.md)*

23. **`criteria.json` sin campo `version` ni `$schema`**: cambios de
    estructura en `Crit` no se detectarían hasta runtime.
    *(analysis/core-services.md)*

24. **Cobertura asimétrica de `getExcludedMedications()`**: testeada en la
    sección C (y puntualmente D), sin tests en A, B y resto de D, siendo la
    lógica más compleja del motor. `criteria-e.spec.ts` además define
    factories locales en vez de ampliar `criteria-test-helpers.ts`.
    *(analysis/core-services.md)*

25. **Sin tests:** `DisplayOptionsDialogComponent` (tiene lógica real),
    `QuickGuideDialogComponent`, `TooltipDirective` (posicionamiento con
    clamping), `diagnoses-taxonomy.ts` (`buildTabs`, agrupación "Otros") y
    `medications.ts` (integridad del catálogo). *(analysis/app-shell.md,
    analysis/core-data.md)*

26. **Sexo binario hardcodeado en la plantilla de historial** (`sex === 'F'`
    → "Mujer", resto → "Hombre"); alinear con el tipo `Sex` si este cambia.
    *(analysis/historial.md)*

27. **`formatDate` sin fallback ante fechas inválidas**: un `savedAt` no
    parseable pinta "Invalid Date" en la UI. *(analysis/historial.md)*

28. **Columna derecha de resultados con ancho fijo de 590px** en ambos pasos;
    en pantallas de ~800px la columna izquierda queda muy estrecha antes del
    breakpoint de 1024px. *(analysis/steps.md)*

29. **`DisplaySettingsService` inyectado en `AppComponent` sin usarse**
    (solo lo usa `DisplayOptionsDialogComponent`). *(analysis/app-shell.md)*

30. **Rutas con carga estática (no lazy)** de los dos componentes de paso;
    tolerable en uso interno, impide code-splitting. *(analysis/app-shell.md)*

31. **Contrato implícito directiva–CSS del tooltip** entre
    `tooltip.directive.ts` y `.app-tooltip` en `styles.css` — ya documentado
    explícitamente en `docs/accesibilidad-ui.md`, mantener sincronizado.
    *(analysis/app-shell.md)*

32. **`DIAGNOSIS_SUBGROUPS` solo cubre el sistema cardiovascular**; no está
    claro si es decisión permanente o limitación pendiente.
    *(analysis/core-data.md)*

33. **`CaseStoreService.persist` silencia errores de `localStorage`**
    (cuota, incógnito) sin notificar al usuario (ASUNCIÓN del análisis).
    *(analysis/core.md)*
