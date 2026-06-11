// @linked docs/accesibilidad-ui.md
// Si cambias FONT_SCALES, loadScale(), apply() o la clave localStorage, actualiza el doc enlazado.
import { Injectable, signal, effect } from '@angular/core';

export const FONT_SCALES = [1, 1.15, 1.3] as const;
export type FontScale = (typeof FONT_SCALES)[number];

const STORAGE_KEY = 'font-scale';

function loadScale(): FontScale {
  const stored = parseFloat(localStorage.getItem(STORAGE_KEY) ?? '1');
  return (FONT_SCALES as readonly number[]).includes(stored) ? (stored as FontScale) : 1;
}

/**
 * Único dueño del tamaño de fuente de la aplicación. Mantiene la escala en una
 * señal, la persiste en localStorage y la expone como la variable CSS
 * `--font-scale` en `document.documentElement`, desde donde todos los
 * componentes la heredan vía `calc(... * var(--font-scale))`.
 */
@Injectable({ providedIn: 'root' })
export class DisplaySettingsService {
  readonly scales = FONT_SCALES;
  readonly fontScale = signal<FontScale>(loadScale());

  constructor() {
    this.apply(this.fontScale());
    effect(() => this.apply(this.fontScale()));
  }

  setFontScale(scale: FontScale): void {
    this.fontScale.set(scale);
  }

  private apply(scale: FontScale): void {
    document.documentElement.style.setProperty('--font-scale', String(scale));
    localStorage.setItem(STORAGE_KEY, String(scale));
  }
}
