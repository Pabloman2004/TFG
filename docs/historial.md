# Historial

## Qué hace

La vista de historial muestra al clínico todas las evaluaciones STOPP/START que ha guardado previamente en el navegador. Desde ella puede:

- **Ver** un resumen de cada caso guardado (nombre del paciente, fecha de guardado, edad, sexo, número de medicaciones y diagnósticos).
- **Cargar** un caso pasado, que restaura el estado completo en el store y redirige al paso de medicaciones para continuar o revisar la evaluación.
- **Eliminar** un caso del historial de forma permanente (sin confirmación).

El componente es accesible en la ruta `/historial` registrada en `app.routes.ts`.

## Cómo está implementado

### Ficheros clave

| Fichero | Rol |
|---|---|
| `src/app/historial/historial.component.ts` | Componente Angular standalone; lee el signal `history` de `CaseStoreService`, implementa `load()`, `delete()` y `formatDate()` |
| `src/app/historial/historial.component.html` | Plantilla Angular 17 (sintaxis `@if`/`@for`); renderiza `mat-card` por cada `SavedCase` con chips de resumen y botones de acción |
| `src/app/core/case-store.service.ts` | Fuente única de datos; expone el signal `history: Signal<SavedCase[]>`, `loadFromHistory(entry)` y `deleteFromHistory(id)` |
| `src/app/core/types.ts` | Tipos `SavedCase`, `PatientCase`, `PatientInfo` que describen la estructura de cada entrada del historial |
| `src/app/app.routes.constants.ts` | Define `ROUTES.HISTORIAL = 'historial'` (constante presente pero sin ruta activa) y `ROUTES.MEDICACIONES = 'medicaciones'` (destino tras cargar) |
| `src/app/app.routes.ts` | Define las rutas activas de la aplicación; **no incluye** la entrada para `historial` |

### Flujo de carga de un caso

```
Usuario pulsa "Cargar"
  → HistorialComponent.load(entry)
    → CaseStoreService.loadFromHistory(entry)   // restaura PatientCase en el signal activo
    → router.navigate([ROUTES.MEDICACIONES])     // redirige a /medicaciones
```

### Flujo de eliminación

```
Usuario pulsa el icono "delete"
  → HistorialComponent.delete(entry.id)
    → CaseStoreService.deleteFromHistory(id)    // filtra el array y persiste en localStorage
    // la vista se actualiza automáticamente por reactividad del signal
```

### Reactividad

El componente usa `ChangeDetectionStrategy.OnPush` y accede a `this.store.history` como signal Angular 17+. La plantilla llama `history()` para obtener el valor reactivo; Angular registra la dependencia y marca el componente para re-renderizar cuando el signal cambia.

## Decisiones de diseño

- **Sin estado local**: el componente no mantiene ningún estado propio; toda la persistencia vive en `CaseStoreService` (y por tanto en `localStorage`). Esto mantiene el componente delgado y facilita que otros módulos accedan al mismo historial.
- **Navegación post-carga directa a medicaciones**: tras cargar un caso, el router navega a `ROUTES.MEDICACIONES` (no a un resumen ni al inicio del flujo). La intención implícita es que el clínico quiera revisar o modificar medicaciones del caso restaurado.
- **Material Design para toda la UI**: no hay lógica de layout propia; toda la presentación delega en `MatCardModule`, `MatChipsModule`, `MatButtonModule` e `MatIconModule`.
- **`formatDate` inline**: la conversión de ISO a cadena localizada (`es-ES`) se implementa directamente en el componente en lugar de usar un `Pipe` Angular. Funcional para un caso de uso único, pero no reutilizable.

## Invariantes

- `history()` siempre devuelve el array completo de `SavedCase` del store; el componente no filtra ni ordena.
- Tras `load(entry)`, la navegación **siempre** va a `ROUTES.MEDICACIONES`; no hay lógica condicional de destino.
- `delete(id)` es **irreversible**: no hay confirmación, papelera ni undo.

### Bug secundario: `routerLink="/paciente"` en estado vacío

El botón "Nuevo caso" del estado vacío apunta a `/paciente`, ruta que tampoco existe en `app.routes.ts`. Produciría otra redirección silenciosa al wildcard. El destino correcto debería ser `/medicaciones` (o la ruta que corresponda al inicio del flujo).

## Si cambias esto…

| Cambio | Qué más tocar |
|---|---|
| Registrar la ruta `/historial` en `app.routes.ts` | Actualizar `docs/navegacion-y-shell.md` (tabla de rutas) y este documento (eliminar la sección de bug crítico) |
| Cambiar el destino de navegación post-carga | Actualizar `ROUTES.*` en `app.routes.constants.ts` si la constante no existe; revisar tests futuros del componente |
| Modificar `SavedCase` o `PatientCase` en `types.ts` | Revisar los chips de resumen en la plantilla (campos `medications.length`, `diagnoses.length`, `info?.age`, `info?.sex`) y `formatDate` si cambia `savedAt` |
| Añadir confirmación antes de eliminar | Seguir el patrón de `ConfirmResetDialogComponent` (ver `src/app/confirm-reset-dialog.component.ts`); documentado en `docs/navegacion-y-shell.md` |
| Modificar `CaseStoreService.deleteFromHistory` o `loadFromHistory` | Revisar que el flujo descrito arriba siga siendo correcto |
| Cambiar la detección de cambios (`OnPush`) | Verificar que los signals de `CaseStoreService` siguen propagando correctamente con la versión de Angular del proyecto |
| Añadir tests | Crear `src/app/historial/historial.component.spec.ts`; cubrir al menos: `load()` → `loadFromHistory` + navegación, `delete()` → `deleteFromHistory`, estado vacío, `formatDate` con fecha inválida |

## Asunciones

- El proyecto usa Angular ≥ 17.1, donde los signals propagan cambios con `ChangeDetectionStrategy.OnPush` sin llamadas manuales a `markForCheck()`. Si la versión es anterior, las actualizaciones del historial no se reflejarían en la vista sin un detector de cambios explícito.
- `CaseStoreService.deleteFromHistory(id)` filtra la entrada con ese `id` del array y persiste el resultado en `localStorage`. El análisis lo indica pero no se ha leído la implementación completa del servicio en esta sesión.
- No existe ningún punto de entrada en la UI actual (barra de navegación, botón, enlace) que apunte a `/historial`, por lo que incluso si se registrase la ruta, el usuario necesitaría navegar manualmente a la URL.
