// @linked docs/accesibilidad-ui.md
// Si cambias FONT_SCALES, TABS_ORIENTATIONS, loadScale(), loadOrientation(), apply() o las claves localStorage, actualiza el doc enlazado.
import { Injectable, signal, effect } from '@angular/core';

export const FONT_SCALES = [1, 1.15, 1.3] as const;
export type FontScale = (typeof FONT_SCALES)[number];

export const TABS_ORIENTATIONS = ['vertical', 'horizontal'] as const;
export type TabsOrientation = (typeof TABS_ORIENTATIONS)[number];

const STORAGE_KEY = 'font-scale';
const ORIENTATION_KEY = 'tabs-orientation';
const DEFAULT_ORIENTATION: TabsOrientation = 'vertical';

function loadScale(): FontScale {
  try {
    const stored = parseFloat(localStorage.getItem(STORAGE_KEY) ?? '1');
    return (FONT_SCALES as readonly number[]).includes(stored) ? (stored as FontScale) : 1;
  } catch {
    return 1;
  }
}

function loadOrientation(): TabsOrientation {
  try {
    const stored = localStorage.getItem(ORIENTATION_KEY) ?? '';
    return (TABS_ORIENTATIONS as readonly string[]).includes(stored)
      ? (stored as TabsOrientation)
      : DEFAULT_ORIENTATION;
  } catch {
    return DEFAULT_ORIENTATION;
  }
}

/**
 * Único dueño de las preferencias de visualización de la aplicación.
 *
 * Tamaño de fuente: mantiene la escala en una señal, la persiste en localStorage
 * y la expone como la variable CSS `--font-scale` en `document.documentElement`,
 * desde donde todos los componentes la heredan vía `calc(... * var(--font-scale))`.
 *
 * Orientación de las pestañas: `vertical` (por defecto) muestra las pestañas de
 * sistema/categoría como una barra lateral que cabe entera sin scroll;
 * `horizontal` recupera la barra superior clásica. Los pasos leen la señal y
 * aplican la clase de layout correspondiente.
 */
@Injectable({ providedIn: 'root' })
export class DisplaySettingsService {
  readonly scales = FONT_SCALES;
  readonly fontScale = signal<FontScale>(loadScale());
  readonly orientations = TABS_ORIENTATIONS;
  readonly tabsOrientation = signal<TabsOrientation>(loadOrientation());

  constructor() {
    this.apply(this.fontScale());
    effect(() => this.apply(this.fontScale()));
    effect(() => this.persistOrientation(this.tabsOrientation()));
  }

  setFontScale(scale: FontScale): void {
    this.fontScale.set(scale);
  }

  setTabsOrientation(orientation: TabsOrientation): void {
    this.tabsOrientation.set(orientation);
  }

  private apply(scale: FontScale): void {
    document.documentElement.style.setProperty('--font-scale', String(scale));
    try {
      localStorage.setItem(STORAGE_KEY, String(scale));
    } catch {
      // Storage bloqueado — la escala sigue aplicada en CSS
    }
  }

  private persistOrientation(orientation: TabsOrientation): void {
    try {
      localStorage.setItem(ORIENTATION_KEY, orientation);
    } catch {
      // Storage bloqueado — la orientación sigue activa en memoria
    }
  }
}
