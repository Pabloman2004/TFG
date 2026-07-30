# Navegación y Shell

## Qué hace

Este módulo es el esqueleto de arranque de la aplicación Angular STOPP/START.
Cubre tres responsabilidades:

1. **Bootstrap**: `src/main.ts` arranca la aplicación invocando
   `bootstrapApplication(AppComponent, appConfig)`. Los providers globales
   viven en `app.config.ts` (`provideBrowserGlobalErrorListeners`,
   `provideZoneChangeDetection`, `provideAnimations`, `provideRouter`,
   `provideHttpClient`).

2. **Rutas**: `app.routes.ts` declara las rutas de la SPA
   (`medicaciones`, `diagnosticos`, wildcard → `medicaciones`).
   Las constantes de segmento de URL viven en `app.routes.constants.ts`.

3. **Componente raíz**: `AppComponent` (`app.component.ts`) monta
   `<router-outlet>` e inyecta `DisplaySettingsService` para aplicar
   `--font-scale` al arrancar. Las acciones de guardar/cargar/reset/guía
   viven en los steps (toolbar), no en el shell.

Los dos diálogos transversales (`ConfirmResetDialogComponent` y
`QuickGuideDialogComponent`) son componentes standalone sin lógica propia:
`ConfirmResetDialogComponent` devuelve `true`/`false` mediante
`[mat-dialog-close]`; `QuickGuideDialogComponent` es contenido estático con el
flujo actual en dos pasos (Medicamentos → Diagnósticos), un resumen de STOPP/START
y un enlace externo al PDF oficial de criterios v3 (Sacyl).

## Cómo está implementado

```
src/main.ts
  └─ bootstrapApplication(AppComponent, appConfig)

src/app/app.config.ts
  providers = [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(), provideRouter(routes), provideHttpClient()
  ]

src/app/app.routes.ts          ← importa ROUTES desde app.routes.constants.ts
  routes = [
    { path: '',              redirectTo: 'medicaciones', pathMatch: 'full' },
    { path: 'diagnosticos',  component: DiagnosisStepComponent },
    { path: 'medicaciones',  component: MedsStepComponent },
    { path: '**',            redirectTo: 'medicaciones' },
  ]

src/app/app.routes.constants.ts
  ROUTES = { DIAGNOSTICOS, MEDICACIONES }  ← constante tipada

src/app/app.component.ts  (AppComponent, selector: app-root)
  └─ template: <router-outlet>
  └─ constructor(DisplaySettingsService)  ← aplica --font-scale al arrancar

src/app/confirm-reset-dialog.component.ts
  └─ template con [mat-dialog-close]="false/true"

src/app/quick-guide-dialog.component.ts
  └─ template estático: flujo en 2 pasos, resumen STOPP/START y enlace al PDF oficial
```


Los dos componentes de pasos (`MedsStepComponent`, `DiagnosisStepComponent`)
se importan estáticamente en `app.routes.ts` (sin `loadComponent`; no hay
code-splitting).

## Decisiones de diseño

- **Standalone components desde el arranque**: `main.ts` usa
  `bootstrapApplication` (API standalone de Angular 17+) en lugar de
  `NgModule`. Todos los componentes de la shell son standalone.

- **`appConfig` como fuente única de providers**: evita divergencia entre
  `main.ts` y un fichero de configuración olvidado. Incluye el listener
  global de errores del navegador.

- **Constantes de ruta separadas** (`app.routes.constants.ts`): los segmentos
  de URL se exportan como objeto `ROUTES as const`, evitando strings mágicos
  dispersos por el código.

- **Shell mínimo**: el root solo monta el outlet y garantiza que
  `DisplaySettingsService` se instancie. Las acciones de caso viven en los
  steps.

## Invariantes

- El punto de entrada real de la aplicación es siempre `src/main.ts` →
  `AppComponent` con `appConfig`.
- Toda navegación programática tras importar un caso o hacer reset debe
  dirigirse a `/medicaciones`.
- El reset del caso siempre pasa por el diálogo de confirmación; nunca se llama
  a `store.reset()` directamente desde la UI sin confirmación previa.
- Rutas desconocidas (p. ej. `/historial`) caen en el wildcard y redirigen a
  `/medicaciones`.
- La inyección de `DisplaySettingsService` en `AppComponent` no debe eliminarse:
  es la que aplica `--font-scale` al arrancar.

## Si cambias esto…

- **Cambiar un segmento de URL**: modificar `app.routes.constants.ts` y
  revisar todos los `router.navigate(['/…'])` en los componentes de pasos.
- **Añadir un nuevo provider global**: añadirlo en `app.config.ts`, no en
  `main.ts`.
- **Tests afectados**: `src/app/app.component.spec.ts`,
  `src/app/app.routes.spec.ts`, `src/app/confirm-reset-dialog.component.spec.ts`
  y `src/app/quick-guide-dialog.component.spec.ts`.
- **Cambiar el contenido o el enlace de la guía rápida**: actualizar
  `quick-guide-dialog.component.ts` (y su spec) y este documento.
- **Este documento**: actualizar si se cambia el esquema de providers del
  bootstrap o el rol del shell.

## Asunciones

- `DisplaySettingsService` se inyecta en `AppComponent` deliberadamente para
  que Angular lo instancie en el injector raíz desde el inicio.
- La carga de rutas estática (sin lazy loading) se asume intencional para una
  herramienta de uso interno; no hay evidencia de una decisión documentada al
  respecto.
