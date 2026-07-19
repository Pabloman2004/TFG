# Propuesta P15 — Selector en árbol para diagnósticos jerárquicos con variantes mutuamente excluyentes

> Documento de propuesta. **Iteración 1 IMPLEMENTADA** (solo familia HTA).
> Estado detallado en §7. Análisis original basado únicamente en el código.

> **Estado de un vistazo:** pasos 1-5 del plan §5 implementados con TDD (familia
> HTA). Paso 6 (resto de familias) y paso 7 (integración P14) **pendientes**.
> Suite global en verde: **506 tests**.

Ejemplo del tutor: raíz **HTA** con hijos **grave / moderada / no complicada**,
donde marcar uno **desmarca los demás** (radio-behavior).

## 1. Cómo se modelan hoy estos diagnósticos "variantes"

### 1.1 Son entradas planas e independientes

Cada diagnóstico es una **cadena suelta** en tres mapas paralelos de
`src/app/core/data/diagnoses.ts`:

- `DIAGNOSIS_GROUPS` (`:6`): label → sistema (tab). P.ej. `"HTA": "Cardiovascular"`.
- `DIAGNOSIS_MAP` (`:231`): label → **código interno** usado por el motor.
- `DIAGNOSIS_SUBGROUPS` (`:456`): label → subgrupo dentro del tab (hoy **solo
  cardiovascular**).

Para HTA hoy existen **cuatro entradas planas, totalmente independientes**:

| Label | Código interno (`DIAGNOSIS_MAP`) | Subgrupo |
|---|---|---|
| HTA | `hta` | Hipertensión |
| HTA no complicada | `hta_no_complicada` | Hipertensión |
| HTA moderada | `hipertension_moderada` | Hipertensión |
| HTA grave | `hipertension_grave` | Hipertensión |

> ⚠️ **Nota de naming:** los códigos **no** están prefijados de forma
> consistente (`hta`, `hta_no_complicada`, pero `hipertension_moderada/grave`).
> No se puede inferir el grupo a partir del prefijo del código. Cualquier modelo
> debe declarar la pertenencia explícitamente, no derivarla del string.

### 1.2 ¿Puede el usuario marcar hoy "grave Y moderada" a la vez? **Sí.**

La selección se guarda en `CaseStoreService.diagnoses` como un **`string[]` de
códigos** (`case-store.service.ts:11`). El toggle es independiente por ítem:

```ts
// diagnosis-step.component.ts:209
toggleDiagnosis(label) {
  const code = normalizeDiagnosis(label);
  // añade o quita SOLO ese código; no toca a sus "hermanos"
}
```

No existe ninguna noción de exclusividad. Hoy nada impide tener
`["hta", "hipertension_grave", "hipertension_moderada"]` simultáneamente — un
estado clínicamente incoherente que el motor además evaluaría como verdadero en
las ramas `or` correspondientes.

### 1.3 Cómo lo consume el motor (clave para el impacto)

El motor hace **match exacto de cada código por separado** vía JsonLogic
`{"in": ["<codigo>", {"var":"diagnoses"}]}` y **ya agrupa las variantes con
`or`** en cada criterio. Ejemplos reales de `src/assets/data/criteria.json`:

```jsonc
// :152  (diurético de asa + cualquier HTA, salvo IC)
{"or":[{"in":["hta",...]},{"in":["hta_no_complicada",...]},
       {"in":["hipertension_moderada",...]},{"in":["hipertension_grave",...]}]}

// :1631 (EPOC GOLD 1-2 / asma crónica / EPOC)
{"or":[{"in":["epoc_gold_1_2",...]},{"in":["asma_cronica",...]},{"in":["epoc",...]}]}
```

**Consecuencia central de toda esta propuesta:** la exclusividad mutua es un
problema de **entrada de datos en la UI**, no del motor. El motor ya trata cada
código de variante como un código independiente y sabe combinarlos. Si la UI
garantiza que solo coexiste una variante, el motor sigue funcionando sin cambios
(simplemente recibe arrays con menos códigos simultáneos).

## 2. Catálogo: qué familias encajan en "raíz + variantes excluyentes"

Recorriendo `DIAGNOSIS_GROUPS`/`DIAGNOSIS_MAP`, estas son las familias candidatas.
Se distingue **escala de gravedad limpia** (exclusividad clara) de **mezcla de
ejes** (tipo + gravedad → exclusividad parcial, requiere criterio clínico).

### 2.1 Candidatas con exclusividad clínica clara (recomendadas)

1. **HTA** (Cardiovascular) — *el ejemplo del tutor.*
   Variantes: `hta_no_complicada`, `hipertension_moderada`, `hipertension_grave`.
   Raíz/ambigua: `hta`. Eje único = gravedad. Un paciente tiene **una** HTA.

2. **EPOC** (Respiratorio).
   Variantes: `epoc_gold_1_2`, `epoc_gold_3_4`, `epoc_grave`.
   Raíz/ambigua: `epoc`. Eje = estadiaje GOLD. *(Solapan `epoc_grave` con
   `epoc_gold_3_4`; ver §2.3.)*

3. **Dolor** (Sintomático).
   Variantes: `dolor_leve`, `dolor_leve_moderado`, `dolor_moderado_grave`.
   Eje = intensidad. `dolor_neuropatico` es **otro tipo**, NO entra en esta
   escala. Sin código raíz genérico.

4. **Bloqueo AV** (Cardiovascular).
   Variantes: `bloqueo_av_grado_2`, `bloqueo_av_completo`. Eje = grado. Sin raíz
   genérica. *(`bradicardia` está en el mismo subgrupo pero es un dx distinto.)*

5. **Osteopenia / Osteoporosis** (Reumatológico).
   `osteopenia` → `osteoporosis` (continuo de densidad ósea, excluyentes).
   `fractura_fragilidad` es un **evento**, NO una variante de gravedad.

### 2.2 Candidatas con mezcla de ejes (exclusividad PARCIAL — validar clínicamente)

6. **Insuficiencia cardíaca** (subgrupo ya existente "Insuficiencia cardíaca").
   `insuficiencia_cardiaca`, `ic_funcion_sistolica_conservada` (HFpEF),
   `insuficiencia_cardiaca_fe_reducida` (HFrEF), `ic_nyha_3_4` (gravedad),
   `insuficiencia_cardiaca_grave`. **Dos ejes mezclados**: tipo (FEr vs FEc) y
   gravedad (NYHA/grave). FEr y FEc sí son excluyentes entre sí, pero la
   gravedad es ortogonal. **No es un árbol radio simple.** ⚠️ ASUNCIÓN.

7. **Asma** (Respiratorio). `asma_cronica`, `asma_moderada_grave`. "Crónica" vs
   "moderada-grave" no son una escala limpia (una es temporalidad, otra
   gravedad). ⚠️ ASUNCIÓN.

8. **Fibrilación auricular** (Cardiovascular). `fibrilacion_auricular` (FA),
   `fibrilacion_auricular_paroxistica`, `fa_mal_control_frecuencia`. Paroxística
   vs crónica/permanente son patrones temporales excluyentes; "mal control de
   frecuencia" es un modificador ortogonal. ⚠️ ASUNCIÓN.

9. **Gota** (Reumatológico). `gota_activa`, `antecedentes_gota`, `gota_recurrente`.
   Estados (activa / antecedente / recurrente) con solapamiento. ⚠️ ASUNCIÓN.

### 2.3 No encajan (descartadas)

- **Artritis/Artrosis** (`artritis`, `artritis_reumatoide`,
  `artritis_reumatoide_activa`, `artrosis`): enfermedades distintas, no variantes
  de una raíz; un paciente puede tener artrosis Y artritis reumatoide.
- **Demencias, ictus, bloqueos vs bradicardia, etc.**: diagnósticos distintos
  agrupados por subgrupo, no escalas de un mismo eje.

> ⚠️ **ASUNCIÓN global:** la asignación "exclusivas vs. parciales" es mi lectura
> de los labels; la lista definitiva (y si la raíz genérica es seleccionable o
> solo un encabezado) **debe validarla Raquel**. Conecta con
> [[dudas-raquel-pendientes]].

## 3. Propuesta de modelo de datos

### 3.1 Principio rector

**Conservar los códigos internos existentes** (`hta`, `hipertension_grave`, …)
para no tocar el motor ni romper JSON antiguos. La jerarquía + exclusividad se
añade como **metadato declarativo nuevo**, encima del modelo plano actual.

### 3.2 Opción de modelado recomendada — nueva tabla declarativa de familias

Añadir en `diagnoses.ts` (o un fichero hermano `diagnosis-variants.ts`):

```ts
export interface DiagnosisVariantFamily {
  id: string;            // 'hta'
  rootLabel: string;     // 'HTA'  (encabezado del árbol)
  rootSelectable: boolean; // ¿la raíz genérica es a su vez seleccionable?
  variants: string[];    // labels hijos: ['HTA no complicada','HTA moderada','HTA grave']
}

export const DIAGNOSIS_VARIANT_FAMILIES: DiagnosisVariantFamily[] = [
  { id: 'hta', rootLabel: 'HTA', rootSelectable: true,
    variants: ['HTA no complicada', 'HTA moderada', 'HTA grave'] },
  // ... resto de §2.1, y §2.2 cuando Raquel confirme
];
```

Y un índice derivado para consulta O(1) en la UI (qué hermanos desmarcar):

```ts
// label de variante -> labels hermanos (mismo family) a desmarcar al elegirla
export const MUTEX_SIBLINGS: Record<string, string[]> = /* derivado del array */;
```

**Por qué este enfoque y no "extender `DIAGNOSIS_SUBGROUPS`":**
`DIAGNOSIS_SUBGROUPS` agrupa **para mostrar** (todas las HTA bajo "Hipertensión"),
pero un subgrupo contiene a veces ítems que **no** son mutuamente excluyentes
(p.ej. el subgrupo "Arritmias y conducción" mezcla FA, bradicardia, QTc…).
Exclusividad ≠ subgrupo. Por eso conviene un mapa propio y ortogonal, no
sobrecargar el de subgrupos. El árbol visual puede seguir anidándose **dentro**
del subgrupo existente.

**Alternativa descartada (campo `variants` en la taxonomía construida):** obliga
a cambiar `DiagnosisGroup`/`buildGroupsForSystem` en `diagnoses-taxonomy.ts` y
mezcla el "qué es variante de qué" con el "cómo se agrupa por sistema". Más
acoplado y más difícil de testear de forma aislada.

### 3.3 UI — árbol con radio-behavior en los hijos

- Render: dentro de cada grupo, si un ítem es `rootLabel` de una familia, pintar
  un **encabezado de árbol** (icono ▸ / sangría) y debajo sus `variants`
  indentadas, con control tipo **radio** (círculo) en vez de checkbox.
- Interacción: al marcar un hijo, **desmarcar sus hermanos** (consultando
  `MUTEX_SIBLINGS`) y volver a marcar el mismo lo deja en "ninguna variante"
  (radios des-seleccionables, comportamiento clínico habitual "no especificado").
- Raíz: si `rootSelectable`, ofrecer también la opción "HTA (sin especificar
  gravedad)" como una entrada más del grupo radio; si no, la raíz es solo
  encabezado.
- Reutiliza la maquinaria existente: el toggle seguiría llamando a
  `store.diagnoses.set(...)`; solo se intercala una función
  `selectVariant(label)` que, además de añadir el código, **filtra** los códigos
  hermanos del array. Cambio localizado en `diagnosis-step.component.ts`
  (`toggleDiagnosis`).

> Combinar con **P14**: el árbol encaja en cualquiera de las dos orientaciones;
> si se aprueba la rejilla vertical de P14, el árbol indentado dentro de la
> columna queda especialmente limpio.

## 4. Impacto

### 4.1 Motor de criterios — **sin cambios**

Ya referencia cada código por separado y los agrupa con `or`
(`criteria.json:152, 200, 208, 1295, 1631, 1639`, etc.). Al conservar los códigos
y limitar la UI a una variante simultánea, el motor recibe entradas **más
limpias**, nunca incompatibles. **No hay criterio que dependa de que coexistan
dos variantes** (las usan en `or`, no en `and`). ✔️ Riesgo nulo si los códigos no
cambian.

> ⚠️ Si en el futuro se **renombran/unifican** códigos (p.ej. colapsar
> `hipertension_grave`→`hta_grave`), eso **sí** tocaría el motor y los tests
> `criteria-*.spec.ts`. **Recomendación: NO renombrar; solo añadir metadato.**

### 4.2 Exportación / importación de casos (JSON) — compatible

- Formato sin cambios: `PatientCase.diagnoses` sigue siendo `string[]`
  (`types.ts:62`); `CaseExport` mantiene `version` (`types.ts:77`).
- **JSON antiguos** que contengan dos variantes a la vez (estado hoy posible)
  **siguen cargando** sin error: `loadCase` (`case-store.service.ts:131`) solo
  hace `set`. El motor los evalúa igual.
- ⚠️ **Decisión:** ¿saneamos al importar (dejar solo una variante por familia) o
  los respetamos tal cual? Recomendado: **respetar** el JSON al cargar (no perder
  datos del usuario silenciosamente) y aplicar la exclusividad solo a partir de
  la siguiente interacción en la UI. ASUNCIÓN: no hay validación de esquema que
  rechace combos "imposibles" (no la hay hoy).

### 4.3 PDF e historial — sin cambios

- PDF (`onExportPdf` → `report.exportCase`) y el historial renderizan labels
  desde códigos vía `resolveDiagnosisLabel` (`diagnoses.ts:516`), que no depende
  de jerarquía. Si en el PDF coexistieran dos variantes (caso antiguo) se
  listarían ambas, igual que hoy. ✔️

### 4.4 Otros efectos a vigilar

- `cardiovascular-dx-dependencies.ts`: usa **labels** como clave para habilitar/
  deshabilitar dx según medicación (`HTA grave`, `HTA moderada`, etc.). El árbol
  debe respetar `isDiagnosisEnabled`: un hijo deshabilitado no debe poder
  seleccionarse (ya lo cubre `toggleDiagnosis`+`isDxEnabled`). Verificar que el
  radio también respeta el estado disabled.
- `group-visibility.ts` / buckets "Relevantes de otros sistemas": el árbol vive
  dentro de un grupo; comprobar que el conteo (`groupSelectionCount`,
  `tabSelectionCount`) sigue contando bien cuando una familia aporta como máximo
  1 selección.
- Tests existentes: `cardiovascular-dx-dependencies.spec.ts`,
  `group-visibility.spec.ts`, `criteria-*.spec.ts` no deberían cambiar si no se
  tocan códigos; servirían de red de seguridad (regresión).

## 5. Plan de implementación en pasos pequeños (TDD)

Cada paso deja el código en verde y es un incremento independiente.

1. ✅ **Datos: definir las familias (solo §2.1 al principio).** — `diagnosis-variants.ts`
   - RED: test sobre `DIAGNOSIS_VARIANT_FAMILIES`/`MUTEX_SIBLINGS` (toda variante
     mapea a sus hermanos; todo código referenciado existe en `DIAGNOSIS_MAP`).
   - Verificación: `npm test` del nuevo spec en verde; sin tocar UI todavía.

2. ✅ **Lógica de exclusividad pura (función sin UI).** — `applyMutex` en `diagnosis-variants.ts`
   - RED: `applyMutex(selected, chosenCode)` → array resultante con hermanos
     eliminados y el elegido presente; toggle-off si ya estaba.
   - Función pura y testeable aislada (estilo funcional del repo).
   - **Ajuste:** opera sobre **códigos** (no labels) porque es lo que persiste el
     store; toggle-off **no** arrastra hermanos coexistentes (solo seleccionar colapsa).

3. ✅ **Cablear en `toggleDiagnosis`.** — `diagnosis-step.component.ts`
   - RED: test de componente — al seleccionar `HTA grave` con `HTA moderada`
     activa, queda solo `hipertension_grave`.
   - Verificación: `criteria-*.spec.ts` siguen verdes (motor intacto). ✔️

4. ✅ **UI del árbol (presentación).** — `diagnosis-variant-view.ts` + plantilla/CSS
   - Render de raíz/encabezado + hijos indentados con control radio (`.rbx`).
   - Verificación: pruebas de render (Karma) marcar/desmarcar; `isDxEnabled` en
     hijos; conteos de tab/grupo intactos. ✔️ (aplicado en bucket propio y foráneo)

5. ✅ **Compatibilidad import/PDF/historial.** — `diagnosis-step.component.spec.ts`
   - RED: test que carga un JSON antiguo con `hipertension_grave` +
     `hipertension_moderada` a la vez y comprueba que no rompe, que se **respetan**
     (D15.5) y que `resolveDiagnosisLabel` las lista para PDF/historial. ✔️

6. ⏳ **Extender a las familias §2.2 (una a una) tras validación de Raquel.** — PENDIENTE
   - Añadir cada familia al array + su test; sin tocar pasos 2-4. Las candidatas
     §2.1 restantes (EPOC, Dolor, Bloqueo AV, Osteopenia/Osteoporosis) quedan
     documentadas como comentario en `diagnosis-variants.ts`.

7. ⏳ **(Opcional) Integrar con P14** si se aprueba la rejilla vertical. — PENDIENTE

## 6.bis Comprobaciones visuales manuales (iteración 1)

Validar en `npm start`, tab **Cardiovascular** → grupo **Hipertensión**:

1. La familia HTA aparece como un bloque con encabezado "HTA" y borde/sangría
   izquierda, separada de los diagnósticos planos del grupo.
2. Las cuatro opciones usan **círculo (radio)**, no cuadrado: "HTA (sin
   especificar)", "HTA no complicada", "HTA moderada", "HTA grave".
3. "Intolerancia/fallo a otros antihipertensivos" sigue siendo un **checkbox**
   plano (no entra en el árbol).
4. **Exclusividad:** marcar "HTA grave" y luego "HTA moderada" deja solo una
   marcada; volver a pulsar la marcada la deja en "ninguna".
5. **Raíz:** marcar "HTA (sin especificar)" desmarca cualquier variante y viceversa.
6. **Dependencias (`isDxEnabled`):** sin diurético de asa / antihipertensivo
   central, "HTA grave" y "HTA moderada" se ven **atenuadas** y no se pueden
   marcar (tooltip al pasar el cursor). Añadir Furosemida (diurético de asa) las
   habilita. "HTA (sin especificar)" no tiene dependencia → siempre marcable.
7. **Conteos:** el badge del grupo "Hipertensión" y el contador de la tab
   Cardiovascular muestran **1** con una sola variante marcada (no se descuadran).
8. **Bucket foráneo:** en una tab donde HTA aparezca como "Relevante de otros
   sistemas", el árbol se renderiza igual (radio + encabezado).
9. **Importar** un caso antiguo con dos variantes HTA: ambas aparecen marcadas al
   cargar; al tocar cualquier variante, colapsa a una.
10. **PDF / historial:** exportar con una variante marcada la lista con su nombre
    legible ("HTA grave", etc.).

## 6. Decisiones (P15) — resueltas en esta iteración

- **D15.1** ✅ Iteración 1 = **solo familia HTA**, con **raíz seleccionable**
  ("HTA (sin especificar)"). Resto de familias → para Raquel; ver
  [[dudas-raquel-pendientes]].
- **D15.2** ✅ Solo §2.1 (exclusividad clara). De hecho, solo HTA por ahora; las
  demás §2.1 quedan como comentario "pendiente validación clínica" en
  `diagnosis-variants.ts`. Mixtas §2.2 → fase posterior.
- **D15.3** ⏳ Insuficiencia cardíaca: **sin tocar** en esta iteración (sigue plana).
- **D15.4** ✅ **Tabla declarativa nueva** (`DIAGNOSIS_VARIANT_FAMILIES` en
  `diagnosis-variants.ts`), sin extender `DIAGNOSIS_SUBGROUPS` ni la taxonomía.
- **D15.5** ✅ **Respetar** el JSON antiguo al cargar (no sanear); la exclusividad
  solo aplica desde la siguiente interacción en la UI. (test en §5/paso 5)
- **D15.6** ✅ **No se renombra ningún código interno**; solo metadato declarativo.
  Motor y `criteria-*.spec.ts` intactos.
