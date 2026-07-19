# Propuesta P14 — Unificar la orientación de las opciones (medicamentos vs. diagnósticos)

> Documento de propuesta. **No** introduce cambios de código.
> Análisis basado únicamente en el código (la carpeta `docs/` enlazada en las
> cabeceras `@linked` no está disponible en esta copia; los punteros a
> `docs/flujo-pasos.md` se ignoran).

## 1. Síntoma observado

- En **Medicamentos** las opciones crecen **en vertical**: cada grupo es una
  columna estrecha de ancho fijo y los fármacos se apilan hacia abajo; cuando
  hay varios grupos, las columnas se colocan una al lado de otra y **envuelven
  en horizontal** (estilo "periódico").
- En **Diagnósticos** las opciones crecen **a lo ancho**: cada grupo ocupa el
  ancho completo y sus diagnósticos fluyen como "chips" que **envuelven en
  filas** de izquierda a derecha.

## 2. Causa exacta de la diferencia

**No es estructura de datos ni decisión de lógica: es exclusivamente CSS.**
Ambos pasos comparten la misma estructura de plantilla (grupo → ítems) y los
mismos nombres de clase base (`.cols-flex`, `.drug-col`, `.drug-row`). La
divergencia está en cómo cada hoja de estilos configura esos contenedores.

### 2.1 Plantillas (idénticas en estructura)

- `src/app/steps/meds-step/meds-step.component.html:141-227`
  → `.cols-wrap > .cols-flex > .drug-col > .drug-row` (un `.drug-col` por grupo,
    un `.drug-row` por fármaco).
- `src/app/steps/diagnosis-step/diagnosis-step.component.html:140-223`
  → misma jerarquía, pero los diagnósticos van dentro de un `.dx-list`
    intermedio: `.cols-flex > .drug-col > .dx-list > .drug-row`.

La única diferencia estructural real es ese `.dx-list` envolviendo las filas en
diagnósticos. Es el "gancho" que permite que los ítems fluyan en horizontal
**dentro** de un grupo a ancho completo.

### 2.2 CSS — Medicamentos (orientación "columnas verticales")

`src/app/steps/meds-step/meds-step.component.css`

```css
.cols-flex {            /* :374 */
  display: flex;
  flex-wrap: wrap;      /* dirección por defecto = row → columnas en horizontal */
  align-content: start;
}
.drug-col {             /* :409 */
  flex-shrink: 0;
  width: calc(170px * var(--font-scale, 1));   /* ANCHO FIJO por columna */
  flex-direction: column;                       /* fármacos apilados vertical */
  min-height: 280px;
}
```

→ Contenedor en `row` + columnas de ancho fijo (170px) ⇒ las columnas se
colocan en línea y envuelven; dentro de cada una los fármacos bajan en vertical.

### 2.3 CSS — Diagnósticos (orientación "filas a lo ancho")

`src/app/steps/diagnosis-step/diagnosis-step.component.css`

```css
.cols-flex {                 /* :360 */
  display: flex;
  flex-direction: column;    /* grupos apilados en vertical */
  width: 100%;
}
.drug-col { width: 100%; }   /* :418 — cada grupo ocupa todo el ancho */
.dx-list {                   /* :437 */
  display: flex;
  flex-wrap: wrap;           /* diagnósticos fluyen en horizontal y envuelven */
}
.drug-row {                  /* :524 */
  flex: 0 0 calc(220px * var(--font-scale, 1));  /* cada ítem ocupa ~220px */
  min-width: 0;
}
```

→ Grupos a ancho completo, apilados; dentro de cada grupo los diagnósticos se
reparten en filas de "tarjetas" de ~220px que envuelven.

### 2.4 Prueba de que es presentación pura: el tab "Otros"

El propio paso de diagnósticos **ya alterna** a un layout tipo-medicamentos solo
con una clase CSS, sin tocar datos ni TS:

- Plantilla: `[class.cols-wrap--cols]="activeTabId() === 'otros'"` y
  `[class.cols-flex--cols]="activeTabId() === 'otros'"`
  (`diagnosis-step.component.html:140,143`).
- CSS: `.cols-flex--cols` (`diagnosis-step.component.css:410`) cambia a
  `display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr))`
  y `.cols-flex--cols .dx-list { flex-direction: column }` (`:443`).

Es decir: el tab "Otros" de diagnósticos ya se ve como medicamentos (rejilla de
columnas autollenado). **La capacidad de unificar ya está medio implementada**;
es un precedente directo que reutilizar.

### 2.5 Resumen de la causa

| Aspecto | Medicamentos | Diagnósticos (tabs normales) |
|---|---|---|
| `.cols-flex` dirección | `row` + `wrap` | `column` |
| `.drug-col` ancho | fijo `170px` | `100%` |
| Capa intermedia de ítems | — (filas directas) | `.dx-list` con `flex-wrap` |
| `.drug-row` ancho | natural (apilado) | fijo `220px` |
| Resultado | columnas verticales que envuelven | grupos a lo ancho con chips |

La columna de resultados de la derecha tiene **ancho fijo de 590px**
(`grid-template-columns: minmax(0, 1fr) 590px` en ambos
`*.component.css:136/127`). Cualquier cambio de layout vive en la columna
izquierda `minmax(0, 1fr)`; mientras no se toque la rejilla raíz, los 590px no
se ven afectados.

## 3. Opciones de unificación

> En las tres, el motor de criterios, el store, la exportación y el PDF quedan
> **intactos**: son cambios de CSS (y, en una, una pequeña reorganización de
> plantilla). **Cero impacto en lógica.**

### Opción A — Todo "columnas verticales" (diagnósticos adoptan el patrón de medicamentos)

Llevar diagnósticos al layout de medicamentos: grupos como columnas de ancho
fijo que envuelven, diagnósticos apilados en vertical dentro de cada columna.

- **Ficheros a tocar:** `diagnosis-step.component.css` (convertir `.cols-flex`,
  `.drug-col`, `.dx-list`, `.drug-row` al modelo de medicamentos). En la práctica
  es **generalizar lo que ya hace `.cols-flex--cols`** a todos los tabs y retirar
  la rama condicional del tab "Otros" en `diagnosis-step.component.html:140,143`.
  HTML casi sin cambios.
- **Riesgo de responsividad:** **Bajo.** El patrón de columnas autollenado
  (`repeat(auto-fill, minmax(170px, 1fr))`) ya está probado en el tab "Otros" y
  se adapta solo al ancho disponible. No depende de los 590px. En `<1024px` la
  columna izquierda pasa a ancho completo (`grid-template-columns: 1fr`) y el
  autollenado simplemente cabe más columnas; sin desbordes.
- **Afecta a:** solo presentación.
- **Nota clínica:** algunos textos de diagnóstico son largos (p.ej.
  *"Fibrilación auricular crónica con mal control de frecuencia cardíaca"*). En
  columnas estrechas de 170px envolverán a 3-4 líneas. Hay que validar
  legibilidad o subir el `minmax` (p.ej. 200-210px).

### Opción B — Todo "a lo ancho" (medicamentos adoptan el patrón de diagnósticos)

Llevar medicamentos al layout de diagnósticos: grupos a ancho completo, fármacos
como chips que envuelven en filas.

- **Ficheros a tocar:** `meds-step.component.css` (`.cols-flex` → `column`,
  `.drug-col` → `width:100%`, introducir un envoltorio de filas equivalente a
  `.dx-list`). Requiere **añadir un `.dx-list`/`.drug-list` en
  `meds-step.component.html`** alrededor de las `.drug-row` (cambio de plantilla
  pequeño, no de lógica).
- **Riesgo de responsividad:** **Medio.** Los fármacos como chips de ancho fijo
  pierden el agrupamiento visual "en tarjeta-columna" que hoy ayuda a escanear
  por grupo farmacológico. Con muchos grupos la página crece mucho en vertical.
- **Afecta a:** solo presentación (más el pequeño wrapper de plantilla).
- **Contra:** va en dirección contraria al uso tipo tablet (ver §4): filas de
  chips obligan a más scroll vertical y dianas más juntas.

### Opción C — Rejilla adaptativa única compartida (recomendada, ver §4)

Definir **un único** patrón de rejilla responsiva y aplicarlo a los dos pasos:
columnas de ancho mínimo cómodo que se autollenan según el espacio, ítems
apilados en vertical dentro de cada columna. Es la Opción A "elevada" a patrón
común y extraído para que ambos pasos lo compartan.

- **Ficheros a tocar:**
  - `meds-step.component.css` y `diagnosis-step.component.css`: unificar
    `.cols-flex`/`.drug-col` a `display: grid; grid-template-columns:
    repeat(auto-fill, minmax(Npx, 1fr))`.
  - Opcional (calidad): extraer las reglas comunes a un CSS compartido o a
    `styles.css` global para no duplicar (hoy `.cols-flex`, `.drug-col`,
    `.cbx`, `.drug-row`, etc. están **duplicadas** entre los dos componentes).
  - Retirar la rama condicional del tab "Otros" (ya redundante).
- **Riesgo de responsividad:** **Bajo**, mismo argumento que A (patrón ya
  validado). Un solo punto donde ajustar el `minmax` controla ambos pasos.
- **Afecta a:** solo presentación. Beneficio extra: elimina la divergencia y la
  duplicación de CSS, y unifica el comportamiento del tab "Otros" con el resto.

## 4. Recomendación

**Opción C** (rejilla adaptativa compartida), con `minmax` en torno a
**190-210px** y diagnósticos/fármacos apilados en vertical dentro de cada
columna.

Razones, pensando en **uso tipo tablet con pulsado rápido**:

1. **Dianas grandes y regulares.** Filas a ancho de columna completo (no chips
   de 220px embutidos) dan áreas de toque amplias y alineadas verticalmente: el
   dedo recorre una lista, no una retícula irregular. Es el patrón con mejor
   ergonomía táctil.
2. **Menos scroll y mejor escaneo.** El autollenado aprovecha el ancho del
   tablet en horizontal (varias columnas) en vez de crecer indefinidamente hacia
   abajo (problema de la Opción B).
3. **Coherencia entre pasos.** Hoy el usuario cambia de modelo mental entre
   Medicamentos y Diagnósticos. Unificar reduce carga cognitiva.
4. **Riesgo mínimo y precedente probado.** El tab "Otros" ya demuestra que el
   patrón funciona y es responsive sin tocar los 590px de la derecha.
5. **Deuda técnica a la baja.** De paso se elimina CSS duplicado y la rama
   especial del tab "Otros".

Compromiso a vigilar: los **textos largos de diagnóstico** en columnas estrechas.
Mitigación: `minmax` ~200px y permitir 2-3 líneas por ítem (ya soportado por
`line-height` actual). Validar con el caso real "Fibrilación auricular crónica…".

> **ASUNCIÓN:** que no existe una razón clínica/documental (en `docs/`, no
> disponible aquí) para que diagnósticos vayan "a lo ancho" a propósito. Todo en
> el código apunta a que es una divergencia de estilo acumulada, no deliberada
> (lo confirma que el tab "Otros" ya rompe esa orientación).

## 5. Decisiones que necesitas tomar (P14)

- **D14.1** ¿Unificamos hacia columnas verticales (A/C) o hacia filas a lo ancho
  (B)? Recomendado: columnas (C).
- **D14.2** Si C: ¿extraemos el CSS común a un fichero compartido/global (más
  limpio, algo más de trabajo) o duplicamos el patrón en cada `*.css` (rápido,
  mantiene la duplicación actual)?
- **D14.3** Valor del `minmax` de columna (170 actual vs. 200-210 propuesto para
  textos largos de diagnóstico).
- **D14.4** ¿Retiramos la rama especial del tab "Otros" al quedar redundante?
