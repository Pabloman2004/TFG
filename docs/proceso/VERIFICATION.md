# VERIFICATION — Patrón Linked Chunks

**Fecha**: 2026-06-11
**Script**: `scripts/check-links.sh`
**Ejecutado desde**: raíz del repo (`C:\Users\pablo.freire\Desktop\tfg\TFG`)

---

## Resultado: LIMPIO (0 problemas)

`./scripts/check-links.sh` terminó con **exit 0**.

---

## Cobertura verificada

El script comprobó exhaustivamente los cuatro tipos de problema definidos:

| Tipo | Descripción | Encontrados |
|------|-------------|-------------|
| `LINK_ROTO` | `@linked` apunta a ruta/anchor inexistente | 0 |
| `DOC_HUERFANO` | doc sin ningún `@linked` que lo referencie | 0 |
| `SIN_DOC` | fichero del mapa sin `@linked` en su cabecera | 0 |
| `FUERA_DE_MAPA` | `@linked` o doc que no aparece en `_map.md` | 0 |

---

## Detalle de la verificación

### Ficheros analizados

- **35 ficheros** con `@linked` encontrados en `src/` y `scripts/`
  (extensiones: `.ts`, `.html`, `.css`, `.js`, `.cjs`, `.d.ts`; excluidos:
  `node_modules`, `.git`, `dist`, `analysis/`)
- **35 ficheros** listados en `docs/_map.md` bajo secciones `### Ficheros que enlazan`
- **8 docs** con entrada `## Doc:` en `_map.md`
- **8 docs** hallados en `docs/*.md` participantes del patrón

### Docs del patrón verificados (ninguno huérfano)

| Doc | Ficheros que lo enlazan |
|-----|------------------------|
| `docs/accesibilidad-ui.md` | 4 (`display-settings.service.ts`, `display-options-dialog.component.ts`, `tooltip.directive.ts`, `styles.css`) |
| `docs/caso-clinico.md` | 2 (`types.ts`, `case-store.service.ts`) |
| `docs/catalogo-clinico.md` | 5 (`diagnoses.ts`, `diagnoses-taxonomy.ts`, `medications.ts`, `medications-taxonomy.ts`, `cardiovascular-dx-dependencies.ts`) |
| `docs/flujo-pasos.md` | 6 (`meds-step.component.ts`, `meds-step.component.html`, `diagnosis-step.component.ts`, `diagnosis-step.component.html`, `group-checked.ts`, `criteria-groups.ts`) |
| `docs/historial.md` | 2 (`historial.component.ts`, `historial.component.html`) |
| `docs/informes-y-exportacion.md` | 5 (`report.service.ts`, `case-io.service.ts`, `clipboard-text.ts`, `pdfmake-browser.d.ts`, `verify-pdf-e2e.js`) |
| `docs/motor-criterios.md` | 5 (`criteria-engine.service.ts`, `criteria-test-helpers.ts`, `system-relevance.ts`, `json-logic-js.d.ts`, `audit-criteria.cjs`) |
| `docs/navegacion-y-shell.md` | 6 (`main.ts`, `app.component.ts`, `app.routes.ts`, `app.routes.constants.ts`, `confirm-reset-dialog.component.ts`, `quick-guide-dialog.component.ts`) |

### Exclusiones correctamente ignoradas

Los siguientes ficheros están en la sección `## Excluidos` del mapa y no
participan del patrón; el script los ignoró correctamente:

- `src/assets/data/criteria.json` — JSON no admite comentarios
- `src/app/**/*.spec.ts` — tests (patrón glob en el mapa, no se listan individualmente)
- `src/app/app.ts`, `app.html`, `app.css`, `app.config.ts` — stub residual Angular CLI
- `src/app/steps/*/meds-step.component.css`, `diagnosis-step.component.css`,
  `historial.component.css` — estilos de presentación
- `src/index.html`, `src/custom-theme.scss` — triviales/generados
- `src/assets/logoTFG.png`, `public/favicon.ico` — binarios

El doc `docs/uml-diagrams.md` es anterior al patrón Linked Chunks; tampoco
participa y no se contabiliza como huérfano.

### Nota técnica

`scripts/verify-pdf-e2e.js` contiene bytes nulos (codificación no estándar)
y es detectado como binario por `grep`. El script usa `grep -a` para tratar
todos los ficheros como texto, garantizando que el `@linked` de este fichero
se recopile correctamente.

---

## Problemas encontrados

Ninguno. El patrón Linked Chunks es **consistente** en toda la base de código.

---

## Responsabilidades de corrección (si hubiera problemas)

| Tipo de problema | Agente/fase responsable |
|------------------|------------------------|
| `LINK_ROTO` | Agente escritor del doc afectado (Fase 3) o autor del `@linked` |
| `DOC_HUERFANO` | Agente escritor de docs (Fase 3) — añadir `@linked` al código |
| `SIN_DOC` | Agente escritor de docs (Fase 3) — añadir `@linked` al fichero |
| `FUERA_DE_MAPA` | Agente mantenedor del mapa (Fase 2) — actualizar `docs/_map.md` |
