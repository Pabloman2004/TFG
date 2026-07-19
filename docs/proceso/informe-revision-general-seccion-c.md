# Informe de revisión — Sección C: Coherencia documental y contradicciones docs↔código

- **Ronda**: Revisión general del proyecto (manifiesto: `docs/proceso/manifiesto-revision-general-2026-07-17.md`)
- **Fecha**: 2026-07-17
- **Modo**: solo análisis; ningún fichero movido, borrado ni modificado (salvo este informe).
- **Ficheros revisados** (54 `.md` fuera de `node_modules`): raíz (`AGENTS.md`, `CLAUDE.md`, `RALPH.md`, `REVIEW.md`, `VERIFICATION.md`, `STOPP_START_CRITERIOS_CONTEXTO.md`, `dudas-raquel-pendientes.md`, `TASKS.md`, `MEMORY.md`, `scratchpad.md`), `docs/**` (incl. `docs/proceso/`), `plans/**`, `analysis/**`, `.cursor/plans/**`. Afirmaciones verificables muestreadas contra `src/`, `scripts/` y `git log`.

Convención: severidad **alta** = puede inducir a decisiones erróneas o pérdida de información; **media** = contradicción confirmada docs↔código o doc↔doc; **baja** = obsolescencia inocua / limpieza.

---

## Hallazgos

### C1 (alta) — TASKS.md marca T7 como hecha, pero nunca se ejecutó

`TASKS.md:36` marca `[x] T7 — Eliminar el componente raíz duplicado: borrar src/app/app.ts, app.html, app.css, app.config.ts y app.spec.ts`. Los cinco ficheros **siguen existiendo** y no se han tocado desde el commit inicial:

- `src/app/app.ts` declara `export class App` (stub del CLI); `git log -- src/app/app.ts` devuelve un único commit: `1f4a28a 2026-03-24 initial commit`.
- `src/app/app.config.ts` sigue presente; `src/main.ts` arranca `AppComponent` sin usarlo.
- Coherentemente, `docs/_map.md:209-211` sigue listándolos como «stub residual… candidato a eliminación, ver REVIEW.md» — es decir, los docs vivos contradicen el estado `[x]` de TASKS.

**Comprobación**: `ls src/app/app.*` (5 ficheros) + `git log --oneline -- src/app/app.ts` (solo initial commit) + leer `TASKS.md:36`.
**Riesgo**: el loop Ralph y cualquier lector asumen una limpieza que no ocurrió.

### C2 (alta) — `dudas-raquel-pendientes.md`: la copia canónica (docs/) está desactualizada respecto a la raíz

Las dos copias han **divergido**, no son duplicado:

- Raíz `dudas-raquel-pendientes.md` (hash `f961252`, 11.702 bytes, último commit `c9ed64d` 2026-06-14): cabecera «Última actualización: 2026-06-14 (tras generalización dx-dependencies)» e incluye las secciones §9 (Diagnósticos-ancla, `dx-anchor-labels-candidate.ts`) y §10 (Overrides piloto CV).
- `docs/dudas-raquel-pendientes.md` (hash `3fea4fc`, 9.267 bytes, último commit `79a2bb5` 2026-06-12): cabecera «Última actualización: 2026-05-22» y **sin** §9–§10.

Sin embargo, la copia designada como canónica por el patrón es la de `docs/` (`docs/_map.md:244-245`), mientras que `MEMORY.md:19` referencia «`dudas-raquel-pendientes.md` §9–10», secciones que **solo existen en la raíz**. Si en la reorganización (Sección D) se borra «la duplicada de la raíz», se pierden las dos preguntas abiertas para Raquel sobre anclas de diagnóstico y overrides CV.

**Comprobación**: `git hash-object dudas-raquel-pendientes.md docs/dudas-raquel-pendientes.md` (hashes distintos); `diff` muestra §9–§10 solo en la raíz.
**Propuesta**: fusionar §9–§10 en `docs/dudas-raquel-pendientes.md` antes de eliminar la copia raíz.

### C3 (media) — `REVIEW.md` raíz afirma que `additionalCategories` existe; fue eliminado del código

`REVIEW.md:83-86` (raíz, último commit `c9ed64d` 2026-06-14): «conviven con el mecanismo `additionalCategories`, que además **se declara y asigna pero no tiene consumidor visible**». El campo fue **eliminado por completo** en `2eb03bf` (2026-07-17, punto T2 de la ronda de relevancia): hoy no existe en `src/app/core/data/medications-taxonomy.ts` y hay test de regresión que lo prohíbe (`medications-taxonomy.spec.ts:16` «ningún grupo declara additionalCategories»). La copia `docs/proceso/REVIEW.md` **sí** fue corregida en ese mismo commit (por eso ya no son idénticas: 9.657 vs 9.482 bytes).

**Comprobación**: `git grep additionalCategories -- src/` (solo el spec de regresión); `git show 2eb03bf --stat` incluye `docs/proceso/REVIEW.md` pero no `REVIEW.md`.
**Conclusión**: la copia viva es `docs/proceso/REVIEW.md`; la raíz quedó huérfana de mantenimiento.

### C4 (media) — `docs/historial.md` se contradice a sí mismo sobre la ruta `/historial`

El doc fue actualizado a medias tras el fix T1 (`3cc1d7e` 2026-06-11 «registrar ruta historial»):

- Cabecera (actualizada): «El componente es accesible en la ruta `/historial` registrada en `app.routes.ts`».
- Tabla de ficheros (obsoleta): `app.routes.constants.ts` → «constante presente pero **sin ruta activa**»; `app.routes.ts` → «**no incluye** la entrada para `historial`».

La realidad del código: `src/app/app.routes.ts:14` registra `{ path: ROUTES.HISTORIAL, component: HistorialComponent }`.

**Comprobación**: leer `docs/historial.md` (líneas ~11 y ~25-26) vs `src/app/app.routes.ts:14`.

### C5 (media) — `docs/navegacion-y-shell.md` describe la tabla de rutas antigua y mantiene como «pendiente» un fix ya hecho

Mismo patrón de actualización parcial (último commit del doc: `79a2bb5` 2026-06-12, posterior al fix, pero con restos):

- Línea ~13: «`app.routes.ts` declara las **tres** rutas de la SPA (`medicaciones`, `diagnosticos`, wildcard → `medicaciones`)» — hoy son cinco entradas, incluida `historial`.
- Sección «Si cambias esto…» (líneas ~102-105): «**Añadir la ruta `historial`**: registrarla en `app.routes.ts`… Actualizar `docs/historial.md` (que documenta este bug conocido)» — el bug ya no existe.
- Contradicción interna: las líneas ~42 y ~98 del mismo doc muestran la ruta ya registrada.

**Comprobación**: `grep -n historial docs/navegacion-y-shell.md` y comparar con `src/app/app.routes.ts`.

### C6 (media) — `docs/_map.md` conserva descripciones de bugs ya corregidos pese a haberse editado después

`docs/_map.md` fue modificado en `2eb03bf` (2026-07-17) sin corregir dos afirmaciones falsas desde 2026-06-11:

- Doc historial (líneas ~129-131): «el estado actual del **bug de ruta no registrada** (`/historial` cae en el wildcard; el componente es **hoy inaccesible**)».
- Doc navegación (líneas ~145-148): «la ruta `historial` **declarada pero sin componente**».

Ambas contradicen `src/app/app.routes.ts:14`. Como `_map.md` es «la fuente de verdad del patrón» (línea 3), su desactualización se propaga como instrucción de qué deben cubrir los docs.

**Comprobación**: `git log -1 -- docs/_map.md` (2eb03bf) vs `git log -1 -- src/app/app.routes.ts` (3cc1d7e, anterior).

### C7 (media) — `MEMORY.md` desactualizado en cabecera y en el «BUG bloqueante»

- Cabecera (`MEMORY.md:3`): «Última actualización: 2026-06-14» — pero el fichero se tocó en `2eb03bf` (2026-07-17).
- Sección «BUG bloqueante» (`MEMORY.md:216-224`): afirma «Rutas (`app.routes.ts`): **solo** `medicaciones` y `diagnosticos`» (falso: existe `historial` desde 2026-06-11) y «**Única vía actual** de poblar `patient` y `labs`: import de caso JSON» (parcialmente falso: desde `1a49c0b` 2026-07-17 el tab Renal del meds-step tiene inputs de TFGe y dosis de Digoxina — `meds-step.component.html:140-194`, panel «Datos para criterios renales»). El fondo del bug (no hay step de datos del paciente con edad/sexo/constantes) sigue siendo cierto, pero la evidencia citada ya no lo es.
- Contradicción interna: «PROMPT 6 — START cardiovascular ✅» en «Prompts completados» (línea 31) y a la vez «PROMPT 6 … (Pendiente de detallar al iniciar.)» en «Tareas pendientes para próximos prompts» (líneas 131-132).

**Comprobación**: `git log -1 --format=%ad -- MEMORY.md`; `sed -n '140,160p' src/app/steps/meds-step/meds-step.component.html`.

### C8 (media) — TASKS.md T12 marcada pendiente pero ya implementada (con contrato distinto)

`TASKS.md:53` deja `[ ] T12 — formatDate del historial: ante fecha no parseable devolver un fallback ('—')`. El fix existe desde `bbc405a` (2026-06-12, «fix(historial): fallback legible cuando savedAt no es parseable (#1)»): `historial.component.ts:42-46` devuelve `'Fecha desconocida'` si `Number.isNaN(date.getTime())`. Matiz: el fallback implementado es `'Fecha desconocida'`, no `'—'` — si el contrato exacto importa, la tarea debería reescribirse; si no, marcarse `[x]`.

**Comprobación**: `sed -n '42,46p' src/app/historial/historial.component.ts`; `git show bbc405a --stat`.

### C9 (baja) — Los snapshots de `analysis/` describen código que ya cambió

Documentos fechados ~2026-06-12, sin marcar como históricos:

- `analysis/core-data.md:43-44`: describe `additionalCategories` como mecanismo vigente («declarado pero sin consumidor visible», con ASUNCIÓN de que meds-step lo lee) — eliminado en `2eb03bf`.
- `analysis/historial.md:8`: «incluye estado vacío con CTA a `/paciente`» — corregido en T2; hoy `historial.component.html:10` usa `routerLink="/medicaciones"`.

**Comprobación**: `git grep additionalCategories -- src/`; `grep routerLink src/app/historial/historial.component.html`.
**Propuesta**: añadir cabecera «snapshot histórico a fecha X» o moverlos a una carpeta de revisiones (decisión de Sección D).

### C10 (baja) — `AGENTS.md` cita un tamaño de suite obsoleto

`AGENTS.md` (~línea 19): «The full suite (**~509 specs**) passes». El último estado registrado es **636 SUCCESS** (`docs/revision-pendientes-relevancia-resultado.md:26` y mensaje del commit `2eb03bf`). Inocuo pero desorienta al agente de Cursor Cloud.

### C11 (baja) — Enlaces rotos en el plan de `.cursor/plans/`

`.cursor/plans/dx_deps_generalizadas_31e1e000.plan.md` contiene 7 enlaces markdown a ficheros inexistentes:

- `src/app/core/data/cardiovascular-dx-dependencies.ts` y `.spec.ts` (líneas 48, 63, 146, 147, 159, 186) — eliminados justamente al ejecutar ese plan (sustituidos por `dx-dependencies.ts` + `dx-dependencies-overrides.ts`, commits `888b3a3`/`f749968`).
- `src/app/core/data/group-visibility.ts` (línea 81) — la ruta real es `src/app/core/group-visibility.ts`.

Es un plan **ya ejecutado**; los enlaces rotos confirman su condición de histórico. Fue el único resultado del escaneo de enlaces markdown relativos en los 54 `.md` (script sobre `[texto](ruta)`; el resto de referencias usa backticks, muestreadas manualmente sin más rotas relevantes).

### C12 (baja) — Duplicados idénticos raíz vs docs sin referencias que los distingan

`RALPH.md` y `VERIFICATION.md` son byte a byte idénticos a sus copias de `docs/proceso/` y **ningún fichero del repo referencia a ninguna de las dos copias** (`git grep "RALPH.md\|VERIFICATION.md"` → 0 resultados fuera de sí mismos). `STOPP_START_CRITERIOS_CONTEXTO.md` también es idéntico a `docs/STOPP_START_CRITERIOS_CONTEXTO.md`; aquí hay referencias cruzadas divergentes: `docs/_map.md:242` apunta a la copia de `docs/`, mientras `MEMORY.md:245` («una sola fuente de verdad para STOPP/START») apunta a la raíz. Nota menor: `VERIFICATION.md` es un snapshot de ejecución del 2026-06-11 en otra máquina (`C:\Users\pablo.freire\...`), valor puramente histórico.

**Comprobación**: ver tabla de duplicados (hashes `git hash-object`).

### C13 (baja) — Ronda de relevancia cerrada en git, pero su manifiesto e informe siguen sin trackear

El commit `2eb03bf` dice «Cierra los 5 puntos de la ronda `docs/proceso/informe-revision-pendientes-relevancia.md`» y committea `docs/revision-pendientes-relevancia-resultado.md`; sin embargo `docs/proceso/informe-revision-pendientes-relevancia.md` y `docs/proceso/manifiesto-revision-pendientes-relevancia.md` están **untracked** (`git status` → `??`). Un `clean` agresivo o un clon nuevo pierde la trazabilidad que el propio commit cita.

**Comprobación**: `git status --short docs/proceso/`.

---

## Verificaciones sin hallazgo (coherencias confirmadas)

- **`criteria.json`**: 216 criterios y 13 sistemas — coincide exactamente con lo afirmado en `docs/_map.md:68` y `docs/motor-criterios.md` (verificado con Node sobre `src/assets/data/criteria.json`).
- **P15** (`docs/propuesta-p15.md`): declara «Iteración 1 IMPLEMENTADA (solo familia HTA), paso 6 (resto de familias) pendiente» — coincide con el código: `DIAGNOSIS_VARIANT_FAMILIES` solo contiene la familia `hta` (`src/app/core/data/diagnosis-variants.ts:22-24`).
- **P14** (`docs/propuesta-p14.md`): sigue siendo propuesta no implementada — los CSS de meds-step (columnas verticales) y diagnosis-step (chips con wrap) siguen divergiendo, tal como describe; coherente con `docs/_map.md:222-223` («sin ficheros de código asignados todavía»).
- **`docs/plan-visibilidad-medicamentos-multiclase.md`**: ejecutado (commits `fea4420`, `1a49c0b`) y así lo registra `docs/_map.md:227-229`.
- **`docs/plan-mejora-dosis-duracion-medicacion.md`** y los cuatro `docs/revision-dosis-duracion-*.md`: ronda nueva (untracked), internamente consistente (manifiesto → resultado → plan derivado, referencias cruzadas correctas).
- **`docs/motor-criterios.md`, `docs/catalogo-clinico.md`, `docs/flujo-pasos.md`, `docs/caso-clinico.md`**: actualizados en los commits de 2026-07-17; el muestreo no encontró afirmaciones contradichas por el código.

---

## Tabla de duplicados confirmados

| Par | ¿Idénticos? (git hash-object) | Copia recomendada como viva | Justificación |
|---|---|---|---|
| `STOPP_START_CRITERIOS_CONTEXTO.md` ↔ `docs/STOPP_START_CRITERIOS_CONTEXTO.md` | **Sí** (`80e1ed1`, 31.857 B) | `docs/STOPP_START_CRITERIOS_CONTEXTO.md` | Es la referenciada por `docs/_map.md:242`; al retirar la raíz, actualizar la mención de `MEMORY.md:245` |
| `RALPH.md` ↔ `docs/proceso/RALPH.md` | **Sí** (`d05c757`, 3.185 B) | `docs/proceso/RALPH.md` | Sin referencias en el repo a ninguna copia; encaja en `docs/proceso/` con el resto de docs de workflow |
| `VERIFICATION.md` ↔ `docs/proceso/VERIFICATION.md` | **Sí** (`b4ef5fa`, 4.230 B) | `docs/proceso/VERIFICATION.md` | Ídem; además es snapshot histórico (2026-06-11, otra máquina) |
| `REVIEW.md` ↔ `docs/proceso/REVIEW.md` | **No** (raíz `bd871b4` 9.657 B vs `6b5781d` 9.482 B) | `docs/proceso/REVIEW.md` | Única copia mantenida: corregida en `2eb03bf` (2026-07-17); la raíz conserva la afirmación obsoleta de `additionalCategories` (C3) |
| `dudas-raquel-pendientes.md` ↔ `docs/dudas-raquel-pendientes.md` | **No** (raíz `f961252` 11.702 B vs `3fea4fc` 9.267 B) | **Fusionar**: contenido vivo en la raíz (§9–§10, 2026-06-14), ubicación canónica en `docs/` | La raíz es más reciente y completa; `_map.md` canoniza la de `docs/`. Portar §9–§10 antes de borrar (C2) |
| `analysis/historial.md` ↔ `docs/historial.md` | **No — no son duplicados** | Ambas (documentos distintos) | `analysis/` es snapshot de análisis de código (2026-06-12, hoy parcialmente obsoleto — C9); `docs/` es el doc Linked Chunks del módulo |

---

## Adenda (2026-07-18) — tras la ronda d10-d11-h4-l6-campos-multitab

- **Coherencia docs↔código de la ronda nueva: verificada, sin hallazgos.**
  `docs/flujo-pasos.md` (párrafo de campos clínicos contextuales y tabla de
  ficheros) y `docs/_map.md` (sección "Debe cubrir" y "Ficheros que enlazan")
  fueron actualizados en el mismo cambio que introdujo
  `src/app/core/clinical-capture.ts`, y lo que afirman coincide con el código
  (comprobado contra el diff y el comentario `@linked` de
  `clinical-capture.ts:1`). Es el patrón correcto que C4–C6 echaban en falta.
- **C13 (ampliado):** a los dos ficheros de la ronda de relevancia sin
  trackear se suman ahora, también `??` en git: el manifiesto e informes de la
  ronda general (`docs/proceso/manifiesto-revision-general-2026-07-17.md`,
  `informe-revision-general-seccion-{a,b,c,d}.md`,
  `docs/revision-general-2026-07-17-resultado.md`) y toda la ronda
  d10-d11-h4-l6 (`docs/revision-d10-d11-h4-l6-campos-multitab{,-resultado}.md`,
  `docs/proceso/informe-revision-d10-d11-h4-l6-seccion-{a,b,c}.md`,
  `docs/proceso/progreso-ronda.md`), además de los cambios de código de esa
  ronda aún sin commitear. Riesgo creciente de pérdida de trazabilidad:
  conviene commitear en cuanto se decida la organización (Sección D).
- **C7 (sin cambios, sigue abierto):** `MEMORY.md` no fue actualizado por la
  ronda nueva; su "BUG bloqueante" sigue citando evidencia parcialmente
  obsoleta, ahora un punto más (los campos de dosis/duración ya no viven solo
  en Renal tras `clinical-capture.ts`).

---

## Adenda (2026-07-19) — correcciones aplicadas (Fase 4 del consolidado)

Tras la eliminación del historial (`63d175f`) y la unificación del shell
(`f2e0311`), se aplicaron las correcciones documentales pendientes:

| Id | Acción |
|----|--------|
| C1 | T7 en `TASKS.md` actualizada: stubs borrados; `app.config.ts` vive como providers |
| C2 | `docs/dudas-raquel-pendientes.md` recibe §9–§10; borrada la copia raíz |
| C3+C12 | Borrados duplicados raíz: `REVIEW.md`, `RALPH.md`, `VERIFICATION.md`, `STOPP_START_CRITERIOS_CONTEXTO.md` |
| C4–C6 | Cerrados por B1 (sin `docs/historial.md` ni ruta `/historial`); `navegacion-y-shell.md`/`_map.md` ya coherentes |
| C7 | `MEMORY.md` actualizado (cabecera, BUG paciente, PROMPT 6, rutas canónicas `docs/`) |
| C8 | T12 marcada `[x]` (fix previo + feature eliminada) |
| C9 | Cabecera «Snapshot histórico» en `analysis/*.md` |
| C10 | `AGENTS.md`: suite ~807 specs |
| C11 | Nota de plan ejecutado en `.cursor/plans/dx_deps_generalizadas_*.plan.md` |
| C13 | Sigue pendiente: conviene **commitear** informes/manifiestos de ronda |

`check-links.sh` sigue reportando 20 `DOC_HUERFANO`/`FUERA_DE_MAPA` previos
(docs de revisión fuera de whitelist) — fuera del alcance C; ver Sección D.
