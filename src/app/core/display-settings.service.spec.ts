import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';

import {
  DisplaySettingsService,
  FONT_SCALES,
  TABS_ORIENTATIONS,
} from './display-settings.service';

describe('DisplaySettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--font-scale');
  });

  function createService(): DisplaySettingsService {
    return TestBed.inject(DisplaySettingsService);
  }

  function flush(): void {
    TestBed.inject(ApplicationRef).tick();
  }

  it('defaults to scale 1 when nothing is stored', () => {
    expect(createService().fontScale()).toBe(1);
  });

  it('defaults to scale 1 when the stored value is not a known scale', () => {
    localStorage.setItem('font-scale', '2.5');
    expect(createService().fontScale()).toBe(1);
  });

  it('restores a valid stored scale on creation', () => {
    localStorage.setItem('font-scale', '1.3');
    expect(createService().fontScale()).toBe(1.3);
  });

  it('applies the stored scale to the document as soon as it is created', () => {
    localStorage.setItem('font-scale', '1.3');
    createService();
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1.3');
  });

  it('updates the current scale when set', () => {
    const service = createService();
    service.setFontScale(1.15);
    expect(service.fontScale()).toBe(1.15);
  });

  it('persists the selected scale to localStorage', () => {
    const service = createService();
    service.setFontScale(1.3);
    flush();
    expect(localStorage.getItem('font-scale')).toBe('1.3');
  });

  it('exposes the selected scale as the --font-scale custom property on the document', () => {
    const service = createService();
    service.setFontScale(1.15);
    flush();
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1.15');
  });

  it('exposes the available scales', () => {
    expect(FONT_SCALES).toEqual([1, 1.15, 1.3]);
  });

  it('[B8] si localStorage lanza al leer, arranca con escala por defecto', () => {
    spyOn(localStorage, 'getItem').and.throwError('Storage blocked');
    expect(createService().fontScale()).toBe(1);
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1');
  });

  it('[B8] si localStorage lanza al escribir, la escala CSS sigue aplicándose', () => {
    const service = createService();
    spyOn(localStorage, 'setItem').and.throwError('Storage blocked');
    service.setFontScale(1.15);
    flush();
    expect(service.fontScale()).toBe(1.15);
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe('1.15');
  });

  describe('orientación de las pestañas', () => {
    it('expone las orientaciones disponibles', () => {
      expect(TABS_ORIENTATIONS).toEqual(['vertical', 'horizontal']);
    });

    it('usa pestañas verticales cuando no hay nada guardado', () => {
      expect(createService().tabsOrientation()).toBe('vertical');
    });

    it('usa pestañas verticales cuando el valor guardado no es una orientación conocida', () => {
      localStorage.setItem('tabs-orientation', 'diagonal');
      expect(createService().tabsOrientation()).toBe('vertical');
    });

    it('restaura la orientación guardada al crearse', () => {
      localStorage.setItem('tabs-orientation', 'horizontal');
      expect(createService().tabsOrientation()).toBe('horizontal');
    });

    it('actualiza la orientación al cambiarla', () => {
      const service = createService();
      service.setTabsOrientation('horizontal');
      expect(service.tabsOrientation()).toBe('horizontal');
    });

    it('persiste la orientación seleccionada en localStorage', () => {
      const service = createService();
      service.setTabsOrientation('horizontal');
      flush();
      expect(localStorage.getItem('tabs-orientation')).toBe('horizontal');
    });

    it('si localStorage lanza al leer, arranca con pestañas verticales', () => {
      spyOn(localStorage, 'getItem').and.throwError('Storage blocked');
      expect(createService().tabsOrientation()).toBe('vertical');
    });

    it('si localStorage lanza al escribir, la orientación sigue aplicándose en memoria', () => {
      const service = createService();
      spyOn(localStorage, 'setItem').and.throwError('Storage blocked');
      service.setTabsOrientation('horizontal');
      flush();
      expect(service.tabsOrientation()).toBe('horizontal');
    });
  });
});
