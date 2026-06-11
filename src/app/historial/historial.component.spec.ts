import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { HistorialComponent } from './historial.component';
import { CaseStoreService } from '../core/case-store.service';
import { routes } from '../app.routes';
import { ROUTES } from '../app.routes.constants';

describe('HistorialComponent — CTA routerLink', () => {
  let store: jasmine.SpyObj<CaseStoreService>;

  beforeEach(async () => {
    store = jasmine.createSpyObj('CaseStoreService', ['loadFromHistory', 'deleteFromHistory'], {
      history: signal([]),
    });

    await TestBed.configureTestingModule({
      imports: [HistorialComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CaseStoreService, useValue: store },
      ],
    }).compileComponents();
  });

  it('el routerLink del CTA apunta a una ruta registrada en app.routes', () => {
    const fixture = TestBed.createComponent(HistorialComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button[routerLink]');
    expect(button).withContext('debe existir un botón con routerLink en el estado vacío').not.toBeNull();

    const linkValue = button!.getAttribute('ng-reflect-router-link') ?? button!.getAttribute('routerLink');
    const registeredPaths = routes
      .filter(r => r.component)
      .map(r => '/' + r.path);

    expect(registeredPaths).withContext(`"${linkValue}" no es una ruta registrada`).toContain(linkValue as string);
  });

  it(`el routerLink del CTA usa ROUTES.MEDICACIONES (/${ROUTES.MEDICACIONES})`, () => {
    const fixture = TestBed.createComponent(HistorialComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button[routerLink]');
    const linkValue = button!.getAttribute('ng-reflect-router-link') ?? button!.getAttribute('routerLink');

    expect(linkValue).toBe('/' + ROUTES.MEDICACIONES);
  });
});
