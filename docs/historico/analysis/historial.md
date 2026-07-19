> **Snapshot histórico** (análisis de código ~2026-06-12). No es fuente de verdad del comportamiento actual; ver los docs Linked Chunks en `docs/` y `docs/_map.md`. Conservado como antecedente de `docs/proceso/REVIEW.md`.

# Análisis: historial

## Propósito
Este módulo implementa la vista de historial de casos clínicos guardados. Muestra una lista de entradas `SavedCase` persistidas en `localStorage` y permite al usuario cargar un caso previo en el flujo principal o eliminarlo del historial. Existe para que el clínico pueda recuperar evaluaciones anteriores sin tener que reintroducir los datos del paciente.

## Ficheros
- `src/app/historial/historial.component.ts` — componente Angular standalone que lee el signal `history` de `CaseStoreService`, expone métodos `load()`, `delete()` y `formatDate()`, y navega a `ROUTES.MEDICACIONES` tras cargar un caso
- `src/app/historial/historial.component.html` — plantilla Angular 17 (sintaxis `@if`/`@for`) que renderiza una `mat-card` por cada `SavedCase` con chips de resumen (edad, sexo, nº medicaciones, nº diagnósticos) y botones de cargar/eliminar; incluye estado vacío con CTA a `/paciente`
- `src/app/historial/historial.component.css` — estilos locales mínimos: layout del contenedor, card con margen inferior, estado vacío centrado con icono grande en gris

## Dependencias

### Hacia otros módulos del repo
- `src/app/core/case-store.service.ts` (`CaseStoreService`) — fuente única de datos; se accede a `history` (signal `SavedCase[]`), `loadFromHistory(entry)` y `deleteFromHistory(id)`
- `src/app/core/types.ts` (`SavedCase`, `PatientCase`, `PatientInfo`) — tipos que describen la estructura de un caso guardado
- `src/app/app.routes.constants.ts` (`ROUTES`) — constante `ROUTES.MEDICACIONES = 'medicaciones'` usada en la navegación post-carga; también existe `ROUTES.HISTORIAL = 'historial'` pero no se usa dentro del propio módulo

### Externas relevantes
- `@angular/router` (`Router`, `RouterModule`) — para la navegación imperativa (`router.navigate`) y el `routerLink` en el botón "Nuevo caso"
- `@angular/material` (`MatCardModule`, `MatButtonModule`, `MatIconModule`, `MatChipsModule`) — toda la UI se basa en componentes Material; no hay lógica propia de layout

## Conceptos de negocio
- **Historial de casos** — persistencia y recuperación de evaluaciones clínicas previas
- **Caso clínico** (`PatientCase`) — datos del paciente: información demográfica, medicaciones, diagnósticos y laboratorios
- **Paciente** — datos demográficos básicos (nombre, edad, sexo) mostrados como cabecera de cada tarjeta
- **Medicaciones / Diagnósticos** — recuentos mostrados en chips como resumen del caso
- **Persistencia local** (`localStorage`) — el historial se almacena y recupera del navegador a través de `CaseStoreService`; no hay backend

## Problemas detectados

- **Ruta no registrada (bug crítico):** `HistorialComponent` no está registrado en `src/app/app.routes.ts`. La constante `ROUTES.HISTORIAL = 'historial'` existe en `app.routes.constants.ts` pero no hay ninguna entrada `{ path: ROUTES.HISTORIAL, component: HistorialComponent }` en el array de rutas. Navegar a `/historial` redirige al wildcard (`**`) y aterriza en `/medicaciones`. El componente es código muerto actualmente.

- **Botón CTA apunta a `/paciente` (ruta inexistente):** En el estado vacío, `routerLink="/paciente"` referencia una ruta que tampoco existe en `app.routes.ts` (solo existen `diagnosticos`, `medicaciones` y `**`). Esto produciría una redirección silenciosa al wildcard.

- **`ChangeDetectionStrategy.OnPush` con signal externo:** El componente usa `OnPush` y consume `history()` directamente como signal de `CaseStoreService`. Esto es correcto con la nueva reactividad de Angular 17+, pero si la versión de Angular no soporta la detección automática de signals con `OnPush`, las actualizaciones del historial no se reflejarían en la vista. ASUNCIÓN: el proyecto usa Angular ≥ 17.1 donde los signals propagan cambios con `OnPush`.

- **Sin confirmación antes de eliminar:** `delete(id)` elimina el caso directamente sin diálogo de confirmación. Un clic accidental borra el caso permanentemente (no hay papelera ni `undo`).

- **Sexo binario hardcodeado:** La plantilla asume `sex === 'F'` → "Mujer", cualquier otro valor → "Hombre". Si el modelo `Sex` admite valores adicionales en el futuro, la lógica sería incorrecta. El tipo `Sex = 'F' | 'M'` también es binario, pero conviene alinearlo.

- **`formatDate` sin manejo de fecha inválida:** Si `entry.savedAt` contiene un string no parseable, `new Date(iso)` devuelve `Invalid Date` y `toLocaleString` retorna el string `"Invalid Date"` en la UI sin ningún fallback visual.

- **Falta de tests:** No hay fichero de spec (`historial.component.spec.ts`) en la carpeta. Las rutas `load()` → navegación y `delete()` → filtrado en store son lógica suficientemente concreta para merecer tests unitarios, especialmente dado el bug de ruta no registrada.
