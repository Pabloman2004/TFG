# Navegación y Shell

## Qué hace

Este módulo es el esqueleto de arranque de la aplicación Angular STOPP/START.
Cubre tres responsabilidades:

1. **Bootstrap**: `src/main.ts` arranca la aplicación invocando
   `bootstrapApplication(AppComponent, …)` con los providers globales
   (`provideAnimations`, `provideRouter`, `provideHttpClient`).

2. **Rutas**: `app.routes.ts` declara las tres rutas de la SPA
   (`medicaciones`, `diagnosticos`, wildcard → `medicaciones`).
   Las constantes de segmento de URL viven en `app.routes.constants.ts`.

3. **Componente raíz y acciones globales**: `AppComponent` (`app.component.ts`)
   orquesta las operaciones transversales disponibles en cualquier pantalla:
   - Guardar el caso como JSON (`CaseIoService.exportCase()`).
   - Cargar un caso desde fichero JSON (`CaseIoService.importFile(file)`),
     con feedback vía `MatSnackBar` y redirección a `/medicaciones` tras éxito.
   - Resetear el caso (destructivo, confirmado por `ConfirmResetDialogComponent`).
   - Abrir la guía rápida (`QuickGuideDialogComponent`).

Los dos diálogos transversales (`ConfirmResetDialogComponent` y
`QuickGuideDialogComponent`) son componentes standalone sin lógica propia:
`ConfirmResetDialogComponent` devuelve `true`/`false` mediante
`[mat-dialog-close]`; `QuickGuideDialogComponent` es solo contenido estático.

## Cómo está implementado

```
src/main.ts
  └─ bootstrapApplication(AppComponent, { providers: [
       provideAnimations(), provideRouter(routes), provideHttpClient()
     ]})

src/app/app.routes.ts          ← importa ROUTES desde app.routes.constants.ts
  routes = [
    { path: '',              redirectTo: 'medicaciones', pathMatch: 'full' },
    { path: 'diagnosticos',  component: DiagnosisStepComponent },
    { path: 'medicaciones',  component: MedsStepComponent },
    { path: 'historial',     component: HistorialComponent },
    { path: '**',            redirectTo: 'medicaciones' },
  ]

src/app/app.routes.constants.ts
  ROUTES = { DIAGNOSTICOS, MEDICACIONES, HISTORIAL }  ← constante tipada

src/app/app.component.ts  (AppComponent, selector: app-root)
  ├─ onSave()         → CaseIoService.exportCase()
  ├─ onLoad(event)    → CaseIoService.importFile(file) + navigate('/medicaciones')
  ├─ resetCase()      → abre ConfirmResetDialogComponent → si true: store.reset() + navigate
  └─ openQuickGuide() → abre QuickGuideDialogComponent

src/app/confirm-reset-dialog.component.ts
  └─ template con [mat-dialog-close]="false/true"

src/app/quick-guide-dialog.component.ts
  └─ template estático con flujo del asistente y resumen STOPP/START
```

Los dos componentes de pasos (`MedsStepComponent`, `DiagnosisStepComponent`)
se importan estáticamente en `app.routes.ts` (sin `loadComponent`; no hay
code-splitting).

## Decisiones de diseño

- **Standalone components desde el arranque**: `main.ts` usa
  `bootstrapApplication` (API standalone de Angular 17+) en lugar de
  `NgModule`. Todos los componentes de la shell son standalone.

- **Providers globales en bootstrap, no en módulo**: `provideAnimations`,
  `provideRouter` y `provideHttpClient` se pasan directamente al segundo
  argumento de `bootstrapApplication`; no existe `AppModule`.

- **Constantes de ruta separadas** (`app.routes.constants.ts`): los segmentos
  de URL se exportan como objeto `ROUTES as const`, evitando strings mágicos
  dispersos por el código (navegaciones en `AppComponent` usan `'/medicaciones'`
  como literal, pero las rutas en `app.routes.ts` referencian `ROUTES.*`).

- **`AppComponent` como contenedor de acciones globales**: el componente raíz
  delega completamente en servicios (`CaseIoService`, `CaseStoreService`) y
  dialoga vía `MatDialog`; no duplica lógica de dominio.

- **`<input type="file">` oculto**: el input de importación está en el template
  de `AppComponent` con `display:none`; se activa por código para mantener la
  compatibilidad con todos los navegadores.

## Invariantes

- El punto de entrada real de la aplicación es siempre `src/main.ts` →
  `AppComponent`. El stub `App` (`app.ts` / `app.config.ts`) nunca debe
  usarse como raíz activa.
- Toda navegación programática tras importar un caso o hacer reset debe
  dirigirse a `/medicaciones`.
- El reset del caso siempre pasa por el diálogo de confirmación; nunca se llama
  a `store.reset()` directamente desde la UI sin confirmación previa.
- `ROUTES.HISTORIAL` está registrada en `app.routes.ts` con `HistorialComponent`.

## Si cambias esto…

- **Añadir la ruta `historial`**: registrarla en `app.routes.ts` con su
  componente (`HistorialComponent`) y asegurarse de que `ROUTES.HISTORIAL`
  ya está declarado en `app.routes.constants.ts` (lo está). Actualizar
  `docs/historial.md` (que documenta este bug conocido).
- **Cambiar un segmento de URL**: modificar `app.routes.constants.ts` y
  revisar todos los `router.navigate(['/…'])` en `app.component.ts` y en los
  componentes de pasos.
- **Añadir un nuevo provider global**: añadirlo en `main.ts` (array
  `providers`), no crear un `AppModule`.
- **Añadir acciones globales en la barra de navegación**: modificar
  `app.component.ts` (template inline y métodos de la clase).
- **Cambiar el flujo de importación de caso**: modificar `onLoad()` en
  `app.component.ts` y actualizar `docs/informes-y-exportacion.md`.
- **Tests afectados**: `src/app/app.component.spec.ts` (cubre `resetCase`,
  `onSave`, `onLoad`) y `src/app/confirm-reset-dialog.component.spec.ts`
  (cubre texto de aviso, botón confirmar y cancelar). Actualizar tests si
  se cambia el flujo.
- **Este documento**: actualizar si se registra `historial`, se elimina el
  stub `App`, o se cambia el esquema de providers del bootstrap.

## Asunciones

- Se asume que `DisplaySettingsService` se inyecta en `AppComponent` como
  efecto secundario para que Angular lo instancie en el injector raíz desde el
  inicio, aunque no se usa directamente en ningún método del componente. No está
  documentado con un comentario explícito en el código.
- No se ha podido confirmar si existe algún mecanismo que impida accidentalmente
  arrancar la aplicación desde el stub `App` (`app.ts`) en lugar de desde
  `AppComponent`; la diferenciación depende de que `main.ts` no se modifique.
- La carga de rutas estática (sin lazy loading) se asume intencional para una
  herramienta de uso interno; no hay evidencia de una decisión documentada al
  respecto.
