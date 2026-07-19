# Informes y exportación

## Qué hace

Este concepto agrupa las tres salidas del caso clínico hacia el exterior:

1. **Informe PDF** (`ReportService`): genera y descarga un documento PDF con el
   logo de la aplicación, la fecha, la lista de diagnósticos y medicaciones del
   paciente, y las tablas de criterios STOPP y START aplicables. Utiliza la
   librería `pdfmake`.

2. **Exportación/importación de caso en JSON** (`CaseIoService`): serializa el
   estado completo del caso activo (`PatientCase`) en un fichero `.json`
   versionado (`1.0`) para que el clínico pueda guardarlo localmente, compartirlo
   o cargarlo de vuelta en otra sesión.

3. **Texto plano para portapapeles** (`buildCriteriaText`): formatea la lista de
   criterios activos como texto legible (agrupado por sistema orgánico) para
   copiar al portapapeles desde la UI.

Estas tres salidas no comparten estado ni dependen entre sí; cada una se
desencadena por una acción explícita del usuario en `AppComponent`.

---

## Cómo está implementado

### Ficheros clave

| Fichero | Rol |
|---|---|
| `src/app/core/report.service.ts` | Servicio Angular que construye y descarga el PDF |
| `src/app/core/case-io.service.ts` | Servicio Angular para exportar e importar el caso en JSON |
| `src/app/core/case-export.schema.ts` | Schema Zod de `CaseExport` (frontera de confianza del import) |
| `src/app/core/clipboard-text.ts` | Función pura que genera el texto plano de criterios |
| `src/types/pdfmake-browser.d.ts` | Declaraciones de tipo ambient para `pdfmake` y `vfs_fonts` |
| `scripts/verify-pdf-e2e.js` | Script Node.js de verificación e2e de ligaduras tipográficas |

### Flujo del informe PDF (`ReportService`)

```
AppComponent.onExportPdf()
  └─► ReportService.exportCase({ patient, diagnoses, meds, results })
        ├─► loadLogoBase64()      // fetch('assets/logoTFG.png') → base64 DataURL
        ├─► buildHeader()         // logo + nombre de la app
        ├─► buildTwoColumnSection() // diagnósticos y medicaciones en dos columnas
        └─► buildCriteriaContent()
              ├─► buildCriteriaBlock(stoppCriteria)  // tabla con filas alternas
              └─► buildCriteriaBlock(startCriteria)
        └─► pdfMake.createPdf(docDefinition).download(fileName)
```

El `docDefinition` incluye `defaultStyle: { fontFeatures: { liga: false } }` en
todo el documento para evitar que las ligaduras tipográficas de Roboto
(`fi`/`fl`) aparezcan como erratas en los visores PDF.

### Flujo exportación JSON (`CaseIoService`)

```
AppComponent.onSave()
  └─► CaseIoService.exportCase()
        ├─► lee store.patientCase (snapshot completo del estado)
        └─► construye CaseExport { version: '1.0', exportedAt, patientCase }
              └─► crea Blob JSON → ancla de descarga → click programático
```

```
steps.onFileLoad(file)
  └─► CaseIoService.importFile(file)
        ├─► JSON.parse(text)
        ├─► caseExportSchema.safeParse(parsed)  // Zod; versión literal '1.0'
        └─► store.loadCase(result.data.patientCase)  // solo si el schema pasa
```

### Función de portapapeles (`buildCriteriaText`)

La función es puramente síncrona. Llama a `groupBySystem(criteria)` (de
`criteria-groups.ts`) para agrupar los criterios por `system`, y a
`critCode(c.id)` para extraer el código de sección (p.ej. `B1`). Devuelve una
cadena de texto formateada con el nombre del sistema en mayúsculas y cada
criterio con tipo y código de sección.

### Tipos ambient de pdfmake (`pdfmake-browser.d.ts`)

Declara `PdfDocDefinition`, `PdfContent` y `PdfFontSpec` como tipos globales
(no importados explícitamente desde `report.service.ts`). `ReportService` usa
`PdfDocDefinition` directamente sin `import` porque el fichero es un `.d.ts`
de declaración global.

### Script e2e de ligaduras (`verify-pdf-e2e.js`)

Script Node.js (fuera del build Angular) que genera dos PDFs con pdfmake —uno
con `liga: false` y otro sin esa opción— y compara el recuento de glifos en los
content streams del PDF para verificar que las ligaduras se desactivan. También
intenta extraer texto usando `PDFParse`.

---

## Decisiones de diseño

- **pdfmake como única dependencia de generación de PDF**: toda la lógica de
  maquetación está expresada como árbol de objetos JS (la API de pdfmake). Esto
  permite construir el PDF completamente en el navegador sin servidor, a costa de
  acoplar el formato del informe 1:1 con la API de pdfmake.

- **`liga: false` en `defaultStyle`**: la desactivación de ligaduras se hereda
  en todo el documento (tablas, listas, footer) desde la raíz del
  `docDefinition`. Este comportamiento se verificó con el script e2e
  `verify-pdf-e2e.js`.

- **Formato de exportación versionado (`version: '1.0'`)**: el schema Zod
  exige `z.literal('1.0')`; versiones desconocidas se rechazan sin cargar estado.

- **Validación Zod en la frontera de import**: `caseExportSchema` valida
  `info`, elementos de `diagnoses`, `Med`, `Labs` completo (objeto vacío no
  vale) y tabs revisados como arrays de strings. El error al usuario es un
  mensaje breve en español; `loadCase` no se llama si el parse falla.

- **`buildCriteriaText` como función pura**: no tiene dependencias de Angular ni
  de servicios. Puede llamarse desde cualquier punto sin inyección de
  dependencias.

- **Logo cargado por `fetch` en runtime**: `loadLogoBase64()` hace
  `fetch('assets/logoTFG.png')` cada vez que se genera un PDF. Si el asset no
  existe o el fetch falla, el método devuelve `null` silenciosamente y el PDF se
  genera sin logo.

---

## Invariantes

- `CaseExport.version` siempre es `'1.0'` en los ficheros generados por
  `CaseIoService.exportCase()`.
- `ReportService.exportCase()` nunca descarga un PDF si `pdfMake.createPdf()`
  lanza una excepción (el error se relanza).
- `buildCriteriaText([])` siempre devuelve `'Sin criterios aplicables.'`
  (contrato garantizado por tests en `clipboard-text.spec.ts`).
- El `docDefinition` del PDF siempre incluye `defaultStyle.fontFeatures.liga =
  false`; quitarlo haría que los visores PDF mostraran ligaduras rotas.
- El nombre del fichero PDF sigue el patrón
  `stopp-start_<nombre_paciente>.pdf`; el del JSON sigue
  `stopp-start_<nombre>_<fecha-ISO>.json`.

---

## Si cambias esto…

### Si modificas `ReportService` (estructura del PDF)
- Actualiza este documento (`docs/informes-y-exportacion.md`).
- Ejecuta `node scripts/verify-pdf-e2e.js` para verificar que las ligaduras
  siguen desactivadas correctamente.
- Añade tests unitarios si introduces nueva lógica en métodos privados de
  construcción del documento (`buildHeader`, `buildCriteriaBlock`, etc.) — hoy
  no hay ningún spec.

### Si modificas el formato `CaseExport` (campos o versión)
- Actualiza `CaseIoService` y el fichero de tipos `src/app/core/types.ts`.
- Actualiza la validación `isCaseExport` / `isPatientCase` para cubrir los
  nuevos campos.
- Actualiza los tests de `case-io.service.spec.ts` (casos de importación válida
  e inválida).
- Incrementa `EXPORT_VERSION` si el cambio rompe la compatibilidad con ficheros
  existentes.
- Actualiza `docs/caso-clinico.md` (que documenta `CaseExport` como tipo).

### Si modificas `buildCriteriaText`
- Los tests en `clipboard-text.spec.ts` deben actualizarse.
- Si cambias el formato de salida, revisa el código de la UI que copia al
  portapapeles (busca usos de `buildCriteriaText` en `AppComponent` o los
  step components).

### Si mueves o renombras `assets/logoTFG.png`
- Actualiza la ruta hardcodeada en `ReportService.loadLogoBase64()` (línea
  `fetch('assets/logoTFG.png')`).

### Si cambias la API de `pdfmake`
- Actualiza `src/types/pdfmake-browser.d.ts` para que refleje los nuevos tipos.
- Actualiza `scripts/verify-pdf-e2e.js` si la API de `createPdf` o `getBuffer`
  cambia.

---

## Asunciones

- Se asume que `PdfDocDefinition` está disponible como tipo global en
  `ReportService` porque `src/types/pdfmake-browser.d.ts` es recogido por
  `tsconfig` como declaración ambient; no hay `import` explícito en
  `report.service.ts`.
- El script `verify-pdf-e2e.js` usa `new PDFParse({ data: ... }).getText()`,
  que no coincide con la API pública de `pdf-parse` (`pdfParse(buffer)`). Se
  asume que puede estar usando un fork o una versión diferente; no se puede
  confirmar sin ejecutarlo.
- Se asume que `AppComponent` es quien llama a `ReportService.exportCase()` con
  los datos del store; no se ha trazado el enlace exacto en el código de
  `AppComponent` para este análisis.
- La validación de importación no comprueba la versión concreta de `CaseExport`
  (solo que `version` sea string). Se asume que esto es intencional para
  mantener compatibilidad hacia atrás, no un olvido.
