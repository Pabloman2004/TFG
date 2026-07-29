# Accesibilidad UI

## Qué hace

Este concepto agrupa las utilidades transversales de UI que afectan a toda la aplicación de forma ortogonal al flujo clínico:

1. **Escala de fuente** (`DisplaySettingsService` + `DisplayOptionsDialogComponent`): permite al clínico elegir entre tres tamaños de texto (pequeño / mediano / grande, equivalentes a factores `1`, `1.15` y `1.3`). La preferencia se guarda en `localStorage` y sobrevive recargas. El cambio se propaga inmediatamente a toda la UI mediante la variable CSS `--font-scale` en `document.documentElement`.

2. **Orientación de las pestañas** (`DisplaySettingsService` + `DisplayOptionsDialogComponent`): permite elegir entre pestañas **verticales** (raíl lateral, por defecto) y **horizontales** (barra superior clásica) en los dos pasos del flujo. La preferencia se guarda en `localStorage` y sobrevive recargas. A diferencia de la escala, no se propaga por variable CSS: los pasos leen la señal y aplican la clase `.card-body--vertical`.

3. **Tooltip custom** (`TooltipDirective` + `.app-tooltip` en `styles.css`): directiva standalone que muestra un globo flotante sobre cualquier elemento al pasar el ratón. El tooltip se crea en el `<body>`, se posiciona con `getBoundingClientRect` y se destruye al salir. Una flecha apunta siempre al centro del elemento disparador aunque el globo esté desplazado horizontalmente para no salirse de la ventana.

Ambas utilidades son transversales: las usan los pasos del flujo clínico (`flujo-pasos`) y el shell de navegación (`navegacion-y-shell`).

## Cómo está implementado

### Escala de fuente

**`src/app/core/display-settings.service.ts`**

- Exporta la tupla `FONT_SCALES = [1, 1.15, 1.3]` y el tipo `FontScale`.
- La función de módulo `loadScale()` lee `localStorage` con la clave `font-scale` en tiempo de carga del módulo (antes de que se construya la clase). Si el valor almacenado no pertenece a `FONT_SCALES`, devuelve `1`.
- El servicio es `providedIn: 'root'` (singleton). Expone la señal `fontScale` (solo lectura desde fuera) y la array `scales`.
- En el constructor: aplica la escala inicial de inmediato y registra un `effect()` que vuelve a aplicarla cada vez que cambia.
- `apply(scale)` hace dos cosas atómicamente: `document.documentElement.style.setProperty('--font-scale', ...)` y `localStorage.setItem(...)`.
- El único punto de escritura público es `setFontScale(scale)`.

### Orientación de las pestañas

**`src/app/core/display-settings.service.ts`** (mismo servicio que la escala)

- Exporta la tupla `TABS_ORIENTATIONS = ['vertical', 'horizontal']` y el tipo `TabsOrientation`.
- `loadOrientation()` lee `localStorage` con la clave `tabs-orientation`. Si el valor no pertenece a `TABS_ORIENTATIONS` (o `localStorage` lanza), devuelve `'vertical'`, el valor por defecto.
- Expone la señal `tabsOrientation`, la array `orientations` y el único punto de escritura `setTabsOrientation(orientation)`.
- Un `effect()` en el constructor persiste cada cambio (`persistOrientation`). No escribe nada en el DOM: la orientación no es una variable CSS heredada, sino una clase que aplican los pasos.

**`meds-step` / `diagnosis-step`**

- Ambos componentes inyectan el servicio y exponen `tabsVertical = computed(() => tabsOrientation() === 'vertical')`.
- El marcado es **el mismo en las dos orientaciones**: dentro de `.panel-card` hay un `.card-body` (que recibe `.card-body--vertical` cuando corresponde) con dos hijos, `.tabs-bar` y `.card-main` (barra de "revisado" + columnas). Toda la diferencia visual está en CSS:
  - horizontal: `.card-body` es `column`, `.tabs-bar` es la barra superior con `overflow-x: auto`.
  - vertical: `.card-body` es `row`, `.tabs-bar` pasa a `flex-direction: column` con ancho fijo, los tabs se alinean a la izquierda y el indicador `::after` se convierte en una barra vertical a la izquierda (`scaleY` en vez de `scaleX`).
- El ancho del raíl **se midió, no se estimó**: es la etiqueta más larga de cada paso más el hueco del badge de conteo, escalado con `--font-scale` para que ninguna etiqueta se parta en dos líneas a ninguna escala de fuente. Sale distinto en cada paso: `208px` en medicación («Endocrino/Metabólico», 147 px de texto) y `166px` en diagnósticos («Gastrointestinal», 104 px). El badge de conteo y el check de "revisado" son mutuamente excluyentes (`isTabExplicitlyReviewed` exige que no haya selección), así que solo hay que reservar hueco para uno.
- Por debajo de 768 px la barra de pestañas se oculta en ambas orientaciones y se muestra el `<select>` de `.tabs-select-wrap`, que ya existía.

**`src/app/display-options-dialog.component.ts`**

- Diálogo Angular Material standalone que inyecta `DisplaySettingsService`.
- Expone `fontScale` / `scales` y `tabsOrientation` / `orientations` directamente en el template para sendos `mat-button-toggle-group`.
- `onScaleChange(change)` delega en `settings.setFontScale(change.value as FontScale)`; `onOrientationChange(change)` en `settings.setTabsOrientation(change.value as TabsOrientation)`.
- Las miniaturas de las dos orientaciones (`.prev-tabs`) son puramente CSS (dos `<span>`: raíl + panel), sin iconos ni SVG.
- Usa `ViewEncapsulation.None` para que los estilos inline del componente puedan afectar a las clases de Material.
- Lo abre `AppComponent` (en `src/app/app.component.ts`) desde la barra de herramientas global.

### Tooltip custom

**`src/app/shared/tooltip.directive.ts`**

- Directiva `[appTooltip]` standalone. Acepta el texto a mostrar como `@Input('appTooltip')`.
- En `mouseenter` crea un `<div class="app-tooltip">` en el `document.body`, lo inserta y en el siguiente frame de animación (`requestAnimationFrame`) llama a `reposition()` y añade la clase `app-tooltip--visible`.
- `reposition(target)` calcula:
  - `top`: encima del trigger con 10 px de separación (flecha + espacio).
  - `left`: centrado sobre el trigger, luego clampeado con márgenes de 6 px respecto a los bordes de la ventana.
  - `--arrow-x`: posición horizontal de la flecha en coordenadas relativas al globo, para que apunte siempre al centro del trigger aunque el globo esté desplazado.
- En `mouseleave` y `ngOnDestroy` retira el elemento del DOM mediante `remove()`.
- Inyecta `DOCUMENT` (token Angular) en lugar de usar `document` directamente.

**`src/styles.css`**

- Define `:root { --font-scale: 1; }` como valor por defecto de la variable de escala.
- Define las clases `.app-tooltip` y `.app-tooltip--visible` que la directiva crea y activa:
  - `.app-tooltip`: posicionamiento `fixed`, opacidad inicial `0`, transición de opacidad, `z-index: 9999`, y la variable local `--arrow-x: 50%` con valor por defecto.
  - `.app-tooltip--visible`: opacidad `1` (activa la transición).
  - `::after`: flecha visible (blanca, borde superior).
  - `::before`: contorno externo de la flecha (gris `#e5e7eb`), desplazado 1 px hacia abajo.

## Decisiones de diseño

- **Variable CSS como canal de comunicación**: en lugar de propagar la escala con Input/Output o con un observable, `DisplaySettingsService` escribe directamente en `document.documentElement`. Esto hace que cualquier componente pueda usar `calc(... * var(--font-scale))` sin saber nada del servicio. Es simple y eficaz para una SPA de uso interno.
- **Tooltip en el `<body>` con posición `fixed`**: evita problemas de `overflow: hidden` en contenedores intermedios. La directiva asume que nada forzará un contexto de apilamiento por encima de `z-index: 9999`.
- **Contrato implícito directiva–estilos**: la directiva escribe el nombre de clase `app-tooltip` y la variable `--arrow-x`; los estilos los consumen. No hay ninguna importación TypeScript entre ambos. El contrato es puramente por convención de nombre.
- **`requestAnimationFrame` antes de reposicionar**: necesario porque el `<div>` recién creado tiene dimensiones `0` hasta que el navegador hace un layout. Sin el RAF, `offsetWidth`/`offsetHeight` serían `0` y el tooltip quedaría mal posicionado.
- **Orientación como clase de componente, no como variable CSS**: la escala afecta a cualquier componente que se apunte, así que una variable CSS global es lo correcto. La orientación solo afecta al layout de los dos pasos, así que se resuelve con una clase (`.card-body--vertical`) sobre un marcado único. Así no hay dos plantillas que mantener en paralelo y el cambio es instantáneo, sin recrear el DOM ni perder la selección.
- **Vertical por defecto**: con 11 categorías de medicación y 13 sistemas de diagnóstico, la barra horizontal siempre desbordaba y obligaba a hacer scroll lateral para ver los últimos tabs (los tabs no visibles se olvidan). El raíl vertical los muestra todos a la vez. Se mantiene la opción horizontal por si en pantallas anchas y poco altas resulta preferible.
- **`loadScale()` como función de módulo**: la lectura de `localStorage` ocurre en tiempo de módulo, antes de que Angular haya iniciado la inyección de dependencias, para tener el valor disponible como argumento de `signal()` sin necesidad de actualizarlo después de la construcción.

## Invariantes

- `fontScale` es siempre uno de los tres valores de `FONT_SCALES` (`1`, `1.15` o `1.3`). Nunca un número arbitrario.
- `tabsOrientation` es siempre `'vertical'` u `'horizontal'`. Un valor corrupto en `localStorage` se descarta y cae a `'vertical'`.
- Cambiar de orientación **no altera el estado clínico**: no cambia el tab activo, ni las selecciones, ni las marcas de "revisado". Solo cambia el layout.
- Cada vez que `fontScale` cambia, `--font-scale` en `document.documentElement` y el ítem `font-scale` de `localStorage` se actualizan de forma síncrona dentro del mismo `apply()`.
- El tooltip nunca se superpone a sí mismo: `show()` llama a `remove()` antes de crear el nuevo `<div>`.
- El elemento `<div class="app-tooltip">` siempre se elimina del DOM cuando el ratón abandona el trigger o cuando la directiva se destruye (`ngOnDestroy`).
- La flecha del tooltip (`--arrow-x`) apunta siempre al centro horizontal del trigger, independientemente del clamping horizontal del globo.

## Si cambias esto…

### Si cambias los niveles de escala (`FONT_SCALES`)
- Actualiza `display-options-dialog.component.ts`: el template tiene tres `<mat-button-toggle>` con índices `[0]`, `[1]`, `[2]` hardcodeados.
- Actualiza todos los usos de `calc(... * var(--font-scale))` en los templates o estilos de componentes que hayan optado a la escala.
- Actualiza los tests en `src/app/core/display-settings.service.spec.ts`.
- Actualiza este documento.

### Si cambias la clave de `localStorage`
- Cambia `STORAGE_KEY` (escala) u `ORIENTATION_KEY` (orientación) en `display-settings.service.ts`. Los usuarios con el valor antiguo no migrarán automáticamente y volverán al valor por defecto.

### Si cambias la orientación por defecto o añades una tercera orientación
- `DEFAULT_ORIENTATION` en `display-settings.service.ts` es el único sitio donde vive el valor por defecto.
- El template de `display-options-dialog.component.ts` referencia `orientations[0]` y `orientations[1]` por índice: añadir una orientación exige añadir su `<mat-button-toggle>`.
- El CSS vive **duplicado** en `meds-step.component.css` y `diagnosis-step.component.css` (bloque «Cuerpo de la tarjeta»). Si tocas uno, toca el otro: son estilos de componente encapsulados, no compartidos.
- Actualiza los tests de `display-settings.service.spec.ts` y los bloques «orientación de las pestañas» de los spec de ambos pasos.

### Si cambias el nombre de clase `app-tooltip` o la variable `--arrow-x`
- Actualiza simultáneamente `tooltip.directive.ts` (que escribe el nombre de clase y la variable) y `src/styles.css` (que los consume). Son un contrato implícito: si cambia uno sin el otro, el tooltip dejará de funcionar visualmente sin ningún error en consola.

### Si cambias la posición o el tamaño de la flecha del tooltip
- La flecha se construye con dos pseudo-elementos CSS (`::before` para el borde, `::after` para el relleno). La separación entre el tooltip y el trigger está hardcodeada como `10` px en `reposition()` (`tr.top - th - 10`). Si cambias el tamaño de la flecha, actualiza también ese offset.

### Si añades un nuevo diálogo de opciones de visualización
- El servicio es el punto de entrada correcto. No crees señales de escala en los componentes: `DisplaySettingsService` es el único dueño.

### Otros ficheros que tocar
- `src/app/app.component.ts`: abre el diálogo `DisplayOptionsDialogComponent` y tiene `DisplaySettingsService` inyectado (aunque no lo usa directamente).
- `src/app/core/display-settings.service.spec.ts`: cubre el ciclo completo del servicio; actualízalo si cambias la lógica de `apply()` o `loadScale()`.
- Este documento (`docs/accesibilidad-ui.md`).

## Asunciones

- Los componentes que quieran escalar con `--font-scale` deben hacerlo explícitamente en sus estilos con `calc(... * var(--font-scale))`. No se ha auditado qué componentes ya lo hacen.
- `localStorage` está disponible en el entorno de ejecución. `loadScale()` se ejecuta en tiempo de módulo y fallaría en SSR o en tests que no inicialicen `localStorage` antes del primer import del módulo.
- `DisplaySettingsService` está inyectado en `AppComponent` pero no se usa desde él (ver análisis `app-shell.md`, sección Problemas). Se asume que la inyección fue una precarga intencional para que el servicio se inicialice y aplique la escala al arrancar, antes de que se abra cualquier diálogo.
- No existe cobertura de tests para `DisplayOptionsDialogComponent` ni para `TooltipDirective`. La lógica de posicionamiento del tooltip (clamping, cálculo de `--arrow-x`) y la reactividad del diálogo (`onScaleChange`, `onOrientationChange`) solo se verifican manualmente.
- El ancho del raíl vertical está calibrado para las etiquetas actuales (verificado en navegador con las tres escalas de fuente). Si se añade un tab con etiqueta más larga que la actual más larga de su paso, `white-space: normal` + `overflow-wrap: anywhere` hacen que se parta en dos líneas en vez de desbordar el raíl — se ve algo peor, pero nunca se sale de la caja. En ese caso hay que recalcular el ancho.
- El tooltip asume que no hay ningún contenedor con `position: fixed` o `transform` que altere el sistema de coordenadas entre el trigger y el `<body>`. Si en el futuro se introduce un layout con `transform` a nivel de contenedor, `getBoundingClientRect()` podría dar resultados incorrectos.
