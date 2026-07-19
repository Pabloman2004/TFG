import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { DisplaySettingsService, FONT_SCALES } from './core/display-settings.service';

describe('AppComponent — shell', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--font-scale');
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--font-scale');
  });

  it('renderiza el router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('al crear el shell se aplica la escala tipográfica guardada', () => {
    const saved = FONT_SCALES[1];
    localStorage.setItem('font-scale', String(saved));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    });

    TestBed.createComponent(AppComponent);
    const settings = TestBed.inject(DisplaySettingsService);

    expect(settings.fontScale()).toBe(saved);
    expect(document.documentElement.style.getPropertyValue('--font-scale')).toBe(String(saved));
  });
});
