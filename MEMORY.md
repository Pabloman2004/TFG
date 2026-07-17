# MEMORY — TFG STOPP/START Angular App

> Documento de estado del proyecto. Última actualización: 2026-06-14 (tras dx-dependencies).

---

## Estado actual

### Generalización dx-dependencies ✅ (2026-06-14)

Sustituido el mapa manual `cardiovascular-dx-dependencies.ts` por derivación desde `criteria.json`:

- **`buildDxDependencies()`** — STOPP med+dx + `excludes.drugClasses`; merge con overrides piloto CV.
- **`diagnosis-family.ts`** — colapso padre/variante en OR (fix J2 / TIAZOLIDINDIONA en IC FE conservada).
- **`dx-anchor-labels-candidate.ts`** — 41 anclas aplicadas en demo; 21 dudosas pendientes Raquel.
- **`hasEffectiveDxTriggers()`** — labels sin triggers no se bloquean (p. ej. IC con FE reducida).
- **`CriteriaEngineService.dxDependencies`** — signal calculado en `loadCriteria()`.
- **Tests**: `dx-dependencies.spec.ts`, `diagnosis-family.spec.ts`; suite **532** tests en verde.
- **Rama**: `dx-dependencies` (2 commits). Docs: `docs/catalogo-clinico.md`, `docs/motor-criterios.md`, `docs/flujo-pasos.md`, `docs/uml-diagrams.md`, `dudas-raquel-pendientes.md` §9–10.

### Prompts completados

- **PROMPT 2 — Reestructuración por relevancia automática** ✅
  Pantallas de medicaciones y diagnósticos refactorizadas a layout de 2 buckets (propio + relevante de otros sistemas), con la relevancia derivada automáticamente de `criteria.json`.
- **PROMPT 3 — Corrección de bugs en STOPP cardiovascular** ✅
  Auditoría de los 49 sub-criterios STOPP-B contra la guía oficial STOPP/START v3 (fuente: `STOPP_START_CRITERIOS_CONTEXTO.md`). Eliminados 9 criterios inventados/redundantes. 404/404 tests en verde.
- **PROMPT 4 — Medicamentos faltantes en STOPP cardiovascular** ✅
  Hallazgo clave: el grueso del trabajo planificado ya estaba cubierto en el modelo de datos (Diltiazem en `CALCIOANTAGONISTA_NO_DHP`, todos los meds B15 con clase `PROLONGADOR_QTC`). Trabajo real: 1 sub-criterio nuevo + consolidación de B15 + bug menor en Proclorperazina. 402/402 tests en verde.
- **PROMPT 5 — Diagnósticos del sistema cardiovascular** ✅
  Subgrupos en tab Cardiovascular (6 subgrupos vía nuevo `DIAGNOSIS_SUBGROUPS`), split de IC grave + hipotensión y actualización de B14 (AND estricto), nuevo dx "Antecedentes de gota" y B9 extendido (OR de 3 variantes), rename del label de antecedentes vasculares. 408/408 tests en verde.
- **PROMPT 6 — START cardiovascular** ✅
  Cambios reales aplicados:
  1. **START-B1**: umbral PAS bajado de >150 a >140 + añadido `labs.pad_mmhg > 90`. Nuevo campo `pad_mmhg` en `types.ts:55` y en factory `makeLabs()` de `criteria-test-helpers.ts`.
  2. **START-B6**: ya usaba clase `BETABLOQUEANTE_CARDIOSELECTIVO`. Solo cosmético: enriquecido el `fullName` del grupo "Betabloqueantes" en `medications-taxonomy.ts:30` con listado oficial cardioselectivos (bisoprolol, nebivolol, metoprolol, carvedilol) para tooltip.
  3. **START-B7**: sin cambios (ya modelaba "sin deterioro grave de función renal" vía `labs.egfr_ml_min_173 > 30`, lógica permisiva intencionada). Apuntada duda menor en `dudas-raquel-pendientes.md`.
  4. **Antagonistas aldosterona**: ya estaba como opción genérica vía clase `ANTAGONISTA_ALDOSTERONA`. Sin cambios.
  5. **START-B8**: ya usaba clase `ISGLT2` con 4 meds (Canagliflozina, Dapagliflozina, Empagliflozina, Ertugliflozina). Solo cosmético: añadida ertugliflozina al `summary`.
  6. **Rename**: "FA con mal control de frecuencia cardíaca" → "Fibrilación auricular crónica con mal control de frecuencia cardíaca" (3 líneas en `diagnoses.ts`: DIAGNOSIS_GROUPS L179, DIAGNOSIS_MAP L404, DIAGNOSIS_SUBGROUPS L461). Código interno `fa_mal_control_frecuencia` intacto.
  7. **Déficit de hierro**: falso positivo del tutor. Ya existía en sistema Hematológico (`diagnoses.ts:180,405`) y B11 lo referenciaba correctamente. Tras la relevancia automática del PROMPT 2 aparece en bucket B del tab Cardiovascular cuando hay IC con FE reducida.
  8. **Unificación variantes IC**: ampliada duda #6 en `dudas-raquel-pendientes.md`, no aplicada.

  Tests: 408/408 en verde (sin nuevos, no se requería TDD: cambios cosméticos + rename + extensión de OR en B1 que no rompe nada).

### Prompts pendientes

- **PROMPT 1 — Cambios UI generales** (diferido). Incluye:
  - Añadir opción "Otro" en grupos Quinolonas y Macrólidos del meds-step.
  - Orden alfabético dentro de cada grupo (parcialmente cubierto ya en PROMPT 5 para el tab Cardiovascular).
- **UI para `pas_mmhg` / `pad_mmhg`**: el modelo de datos los soporta pero no hay aún un formulario de constantes vitales en `lab-values-step` (o equivalente). Pendiente decidir si se añade UI para PA o se asume que la relevancia automática + diagnósticos discretos basta. Si se añade UI, también añadir tests E2E con umbrales 140/90.

---

## Decisiones estructurales (PROMPT 2)

- **2 buckets en UI, no 3**. Bucket A = clases/dxs propios del tab. Bucket B = clases/dxs *relevantes* de otros sistemas (con badge de origen). Eliminada la idea de un tercer bucket "no relevante".
- **Relevancia automática**: derivada al cargar `criteria.json` en `CriteriaEngineService` vía `buildRelevance(criteria, allTabIds)` (módulo nuevo `src/app/core/data/system-relevance.ts`). NO se mantiene a mano.
- **Mapping `SYSTEM_TO_TABS` con arrays** (opción B): un mismo sistema clínico puede mapear a varios tabs (cubre tanto el espacio de medicaciones como el de diagnósticos).
- **Sistemas transversales** (`Analgésicos`, `Riesgo de caídas`, `Carga antimuscarínica/anticolinérgica`, `Indicación de la medicación`) expanden a `allTabIds`.
- **Eliminado** el concepto `additionalCategories` (campo manual obsoleto), incluidos los rastros en `medications-taxonomy.ts` y en el espejo de `scripts/gen-checklist-tabs.js`.
- **Deduplicación en buckets**: la taxonomía duplica grupos en varias categorías (p.ej. `isglt2` en cardiovascular/renal/endocrino). El `groupBuckets()` computed mantiene Sets `ownClasses` y `seenForeign` para no repetir clases.
- **Divisor visual entre buckets**: estilo fieldset-legend con `::before/::after` y `<span class="bucket-divider-label">`. Aplicado en meds-step y diagnosis-step.
- **Mismo patrón en ambos steps**: lo que aplica a `meds-step` aplica a `diagnosis-step` (foreign dxs van con id `foreign__${tabId}` para que la lógica de "Otro" y `customDx` los ignore).

---

## Limpieza taxonómica (PROMPT 2)

- **6 sinónimos eliminados** y **4 pares padre/hijo consolidados** en `medications-taxonomy.ts`.
- **`ANTIANGINOSO` conservado** pese a parecer huérfano (decidido mantener por uso clínico aunque no aparezca en lógica de criterios actualmente).
- **Grupo C de 8 etiquetas de clases sin uso**: pendiente de decisión clínica (ver dudas Raquel).

---

## Bugs arreglados (PROMPT 3)

Auditoría contra `STOPP_START_CRITERIOS_CONTEXTO.md`. **9 eliminaciones** en `src/assets/data/criteria.json`:

**LOTE 1 — Inventados (5)**:
- `STOPP-B2-DRONEDARONA-IC-NYHA`
- `STOPP-B2-ITRACONAZOL-IC`
- `STOPP-B4-AMIODARONA-PROLONGA-QTC`
- `STOPP-B6-DRONEDARONA-FA-PERMANENTE`
- `STOPP-B15-AMIODARONA-HTA-QTC`

**LOTE 2 — Redundantes / fuera de oficial (4)**:
- `STOPP-B6-ANTIARITMICO-PRIMERA-LINEA-FA`
- `STOPP-B12-ANTAGONISTA-ALDOSTERONA-HIPERPOTASEMIA` (B12 oficial es solo IECA/ARA-II)
- `STOPP-B12-DIURETICO-AHORRADOR-POTASIO-HIPERPOTASEMIA` (idem)
- `STOPP-B13-ANTAGONISTA-ALDOSTERONA-HIPERPOTASEMIA` (B13 oficial requiere combinación)

**Colateral en tests**: `criteria-b.spec.ts` perdió 2 describe-blocks (4 tests) y un import. Estado: **404/404 SUCCESS**.

**B7 y B11** investigados, NO modificados — lógica correcta a nivel motor.

---

## Cambios aplicados (PROMPT 4)

### 1. Nuevo sub-criterio `STOPP-B19-CORTICOIDE-SISTEMICO-IC`

Añadido inmediatamente después de `STOPP-B19-AINE-INSUFICIENCIA-CARDIACA` en `criteria.json`. Misma lógica que el AINE pero con clase `CORTICOIDE_SISTEMICO`. La guía oficial B19 dice "AINE **o corticoides** en IC con diur.asa" — el AINE ya estaba, ahora la rama corticoides también.

### 2. Consolidación de B15 — eliminación de sub-criterios específicos

**Eliminados** (4): `STOPP-B15-ADT-QTC-PROLONGADO`, `STOPP-B15-DIGOXINA-QTC-PROLONGADO`, `STOPP-B15-ISRS-QTC-PROLONGADO`, `STOPP-B15-NEUROLEPTICO-QTC-PROLONGADO`.

**Mantenido**: `STOPP-B15-PROLONGADOR-QTC-INTERVALO-PROLONGADO` (paraguas).

**REVERSIÓN explícita de decisión previa**: en PROMPT 3 LOTE 2 se decidió mantener B15-ISRS y B15-NEUROLEPTICO por trazabilidad clínica. En PROMPT 4 se reconsideró tras el análisis del modelo de datos: como **todos** los meds prolongadores del QT (citalopram, escitalopram, haloperidol, fenotiazinas, ATC, digoxina, quinolonas, macrólidos, ondansetrón, litio, tizanidina, astemizol, mirabegrón, amiodarona, dronedarona, ranolazina, tamoxifeno, quinina) ya llevan la clase `PROLONGADOR_QTC`, el paraguas cubre todo y los específicos generaban **warnings duplicados** por la misma situación clínica. Decisión alineada con la indicación expresa del tutor de "opción genérica".

**Test eliminado**: `criteria-b.spec.ts` perdió el bloque `describe('B15-ISRS-QTC-PROLONGADO')` (2 tests) y el import `isrs`. Los otros 3 sub-IDs no tenían tests.

### 3. Bug menor — Proclorperazina sin `PROLONGADOR_QTC`

`medications.ts:97`: Proclorperazina es fenotiazina y la guía cita expresamente fenotiazinas como prolongadoras del QT. Las otras 3 fenotiazinas (Clorpromazina, Levomepromazina, Tioridazina) ya tenían la clase. Olvido evidente. Añadida `PROLONGADOR_QTC` a sus drugClasses.

### 4. Hallazgos del análisis previo (sin cambios)

- **DILTIAZEM en B2/B3/B4**: ya cubierto. Los criterios usan `inDrugClass: CALCIOANTAGONISTA_NO_DHP`, no nombres concretos; Diltiazem está en esa clase desde el inicio. Summaries ya mencionan "verapamilo/diltiazem".
- **Meds B15** (ondansetrón, litio, tizanidina, astemizol, mirabegrón, quinolonas, macrólidos, fenotiazinas): los 16 ya estaban en `medications.ts` con clase `PROLONGADOR_QTC`. Nada que añadir.

---

## Tareas pendientes para próximos prompts

### PROMPT 1 — Cambios UI generales

- **NUEVO**: añadir opción "Otro" en grupos `Quinolonas` y `Macrólidos` del meds-step (petición del tutor). Mecanismo de "fármaco libre no listado" — no toca criteria.json/medications.ts, es cambio puro de UI.
- Mejora menor: feedback de diagnósticos bloqueados accesible en táctil/móvil (sin hover).

### PROMPT 6 — START cardiovascular
(Pendiente de detallar al iniciar.)

### B16 (pendiente menor)
Modelar "esperanza de vida <3 años" si Raquel rechaza la opción de usar `fragilidad` como proxy.

### Antiarrítmicos clase Ia
Decidido NO añadir ahora (procainamida, quinidina, disopiramida no están en `medications.ts`). Apuntado como duda para Raquel.

---

## Cambios aplicados (PROMPT 5)

### 1. Subgrupos en el tab Cardiovascular — mecanismo nuevo

Añadido `DIAGNOSIS_SUBGROUPS: Record<string, string>` en `diagnoses.ts` (label → nombre de subgrupo). `buildTabs()` en `diagnoses-taxonomy.ts` lee este Record y, si hay entradas para diagnósticos del sistema, genera múltiples grupos ordenados alfabéticamente (con diagnósticos también ordenados alfabéticamente dentro de cada grupo). Si un sistema no tiene entradas en `DIAGNOSIS_SUBGROUPS`, se mantiene el comportamiento anterior (un único grupo por tab). Patrón pensado para escalar a otros tabs sin tocar el resto.

**Subgrupos del tab Cardiovascular (6)**:
- Arritmias y conducción (9 dxs)
- Enfermedad vascular (10 dxs)
- Estenosis y valvulopatía (3 dxs)
- Hipertensión (5 dxs)
- Hipotensión y síncope (3 dxs)
- Insuficiencia cardíaca (5 dxs)

**Divergencia respecto al tutor**: el tutor pidió 7 grupos: Bloqueo AV, Enfermedad vascular, Estenosis, FA, Hipertensión, Hipotensión, IC. Se consolidó en 6 reagrupando Bloqueo AV + FA + Bradicardia + QTc + Trastornos de conducción en "Arritmias y conducción" por coherencia clínica (todos son trastornos del ritmo o de la conducción cardíaca) y para evitar grupos con 1-2 elementos. Si el tutor prefiere desglosar a 7, se ajusta en una iteración posterior.

### 2. Split del diagnóstico compuesto "IC grave con hipotensión"

- **Eliminado** label `"Insuficiencia cardíaca grave con hipotensión (PAS < 90 mmHg)"` y su código `insuficiencia_cardiaca_grave_hipotension`.
- **Añadido** `"Insuficiencia cardíaca grave"` → código `insuficiencia_cardiaca_grave` (subgrupo IC).
- `"Hipotensión sintomática"` ya existía.
- **B14-INHIBIDOR-PDE5-INSUFICIENCIA-CARDIACA-HIPOTENSION** reescrito a AND estricto: requiere `INHIBIDOR_PDE5` + `insuficiencia_cardiaca_grave` + (`hipotension_sintomatica` OR `labs.pas_mmhg<90`).
- `cardiovascular-dx-dependencies.ts` actualizado (entry renombrada al nuevo label, mismas classes PDE5+NITRATO).

### 3. Nuevo diagnóstico "Antecedentes de gota"

- Añadido en `diagnoses.ts` con sistema Reumatológico, código `antecedentes_gota`.
- **B9-TIAZIDA-GOTA** extendido a OR de `gota_activa`, `gota_recurrente`, `antecedentes_gota`. Cualquier antecedente de gota contraindica tiazidas, según guía oficial B9.
- H6 y H7 NO se tocaron — esos sí son específicos de gota activa/recurrente.
- Como STOPP-B9 tiene `system: "Sistema cardiovascular"`, el nuevo dx aparece automáticamente en bucket B del tab Cardiovascular vía relevancia automática.

### 4. Renombrado de "Antecedentes de enfermedad coronaria o vascular"

- Nuevo label: `"Antecedentes de enfermedad coronaria, cerebrovascular o vascular periférica"`.
- **Código interno mantenido**: `enfermedad_coronaria_vascular` (regla de no renombrar IDs).
- Lógica de criterios sin cambio (J6, J7 siguen funcionando).

---

## Histórico de decisiones revertidas

- **PROMPT 3 LOTE 2 → PROMPT 4 (B15)**: se mantuvieron B15-ISRS y B15-NEUROLEPTICO como específicos por trazabilidad. En PROMPT 4 se eliminaron al adoptar Opción A (solo paraguas). Razón: warnings duplicados + petición expresa del tutor.
- **Consecuencia**: dudas para Raquel sobre B15-ISRS (citalopram >20/escitalopram >10 mg/d) y B15-NEUROLEPTICO (haloperidol+fenotiazinas) quedan **obsoletas** — ya no aplican porque solo queda el paraguas genérico.

---

## Decisiones de diseño (PROMPT 6 verificación)

### Tooltip de cardioselectivos solo en Betabloqueantes
El `fullName` enriquecido con listado oficial (bisoprolol, nebivolol, metoprolol, carvedilol) **solo se aplicó al grupo Betabloqueantes** (`medications-taxonomy.ts:30`), NO al resto de grupos. Decisión consciente: solo Betabloqueantes tiene el problema clínico de que "betabloqueante genérico" y "cardioselectivo para HFrEF (START-B6)" no son lo mismo, y el tutor pidió expresamente este tooltip. Otros grupos (IECA, ARA-II, etc.) no necesitan distinción equivalente. **No replicar este patrón a todos los grupos** salvo petición explícita.

### Fármacos primarios en múltiples sistemas (no duplicación visual)
Algunos fármacos aparecen como "primarios" (bucket A) en varios tabs distintos por **intención clínica deliberada**, no por bug ni por duplicación accidental:

- **Opioides** → SNC (sedación, depresión respiratoria, riesgo de caídas) **y** Osteomuscular (analgesia en dolor crónico). Ambos contextos son indicaciones primarias reales.
- **iSGLT2** → Cardiovascular (START-B8: IC con FE reducida) **y** Renal (nefroprotección) **y** Endocrino (diabetes tipo 2). Tres indicaciones primarias de la guía.
- **Gabapentinoides** → SNC (epilepsia, neuralgia, ansiedad) **y** Osteomuscular (dolor neuropático).
- **Tricíclicos** → SNC (depresión) **y** Osteomuscular (dolor crónico, fibromialgia).

La taxonomía declara estos grupos en múltiples `DrugCategory`. El `groupBuckets()` computed deduplica por clase (Sets `ownClasses` y `seenForeign`) para que un fármaco no aparezca dos veces en el mismo tab. **Esta multiindicación NO es un bug y NO debe "limpiarse".** Si el tutor o Raquel lo cuestionan, la respuesta es: refleja la realidad clínica de uso multipropósito de estas familias.

### Comportamiento de IC con variantes (clínicamente correcto, por diseño)
Los criterios START disparan según la variante de IC marcada:
- `Insuficiencia cardíaca` (genérica) → activa START-B8 (iSGLT2).
- `Insuficiencia cardíaca con FE reducida` → activa START-B5/B6/B7/B8/B9/B11 (IECA, BB, antag. aldosterona, iSGLT2, sacubitrilo, hierro IV).
- `Insuficiencia cardíaca con función sistólica conservada` → no activa los específicos de FE reducida (correcto: la evidencia clínica difiere).
- `Insuficiencia cardíaca grave` / `NYHA III-IV` → activan STOPP-B14, B2, B7-neg, B8-neg, B19 según corresponda.

Esto es **por diseño**. Ver [duda #6 en dudas-raquel-pendientes.md](dudas-raquel-pendientes.md): el tutor propone unificar las 5 variantes en una sola con subopciones combinables (Estable/Sintomática/FE preservada/FE reducida). Si Raquel lo aprueba sería un refactor estructural que afectaría a ~12 criterios. Hasta entonces, **mantener el comportamiento actual**, no es bug.

---

## Bugs detectados (PROMPT 6 verificación) — pendientes

### BUG bloqueante: sección de datos del paciente NO existe en UI
El modelo de datos soporta `PatientInfo` (edad, sexo, peso…) y `Labs` (PAS, PAD, TFGe, K, Na, Ca, QTc, FC, glucosa, INR…), pero **no hay componente UI** que los edite:
- Rutas (`app.routes.ts`): solo `medicaciones` y `diagnosticos`.
- No existe `patient-info-step/` ni `lab-values-step/`.
- Única vía actual de poblar `patient` y `labs`: import de caso JSON vía `case-io.service.ts`.

**Impacto**: criterios que dependen de edad o labs no se pueden activar manualmente desde la UI. Afectados: STOPP-B7/B8/B9/B14/B15/B16, START-B1/B7, y casi todos los criterios con prerrequisito edad ≥65.

**Pendiente**: planificar PROMPT 7 con nuevo step `patient-info-step/` (datos demográficos + bloque colapsable de labs) añadido como **primer paso** en la navegación. Esfuerzo estimado: ~1 día.

---

## Breakpoints CSS (responsive)

Definidos en `meds-step.component.css:760-782` y `diagnosis-step.component.css:804-818`:

| Breakpoint | Comportamiento |
|---|---|
| `max-width: 1024px` | `main-grid` pasa de 2 columnas a 1 columna (resultados debajo). Tablet horizontal. |
| `max-width: 768px` | `.tabs-bar` se oculta, aparece `.tabs-select-wrap` (select). Tablet portrait / móvil. **Estándar Tailwind `md` / Bootstrap `md` / Material tablet portrait.** |
| `max-width: 600px` | Reducción de padding en `top-nav` y `main-grid`. Móvil pequeño. |

---

## Convenciones a respetar

- **No renumerar IDs internos** de criterios tras eliminaciones. Los IDs (`STOPP-B2-DRONEDARONA-IC-NYHA`, etc.) son estables y rompen trazabilidad con tests/specs si se cambian. Renombrar etiquetas visibles al usuario es otra cuestión (vía `critCode()` en `criteria-groups.ts`).
- **No añadir clases huérfanas** a `medications-taxonomy.ts` sin que haya un criterio en `criteria.json` que las use (o se vaya a añadir en el mismo PR).
- **No eliminar clases legítimas sin uso** sin validar con Raquel (ej. `ANTIANGINOSO`).
- **Una sola fuente de verdad para STOPP/START**: `STOPP_START_CRITERIOS_CONTEXTO.md`. No usar conocimiento externo del modelo ni buscar online sin pedir permiso.
- **No tocar nada sin aprobación**: en sesiones de auditoría/refactor, mostrar análisis y propuesta antes de aplicar.
- **TDD obligatorio**: cualquier código de producción nuevo va precedido de test que falla.
- **Tests en verde tras cada cambio**: lanzar `npx ng test --watch=false --browsers=ChromeHeadless` antes de cerrar tarea.
