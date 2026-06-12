import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

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

describe('HistorialComponent — delete() con confirmación', () => {
  let store: jasmine.SpyObj<CaseStoreService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const setupWithDialog = (confirmed: boolean | undefined) => {
    dialog.open.and.returnValue({ afterClosed: () => of(confirmed) } as any);
    return TestBed.createComponent(HistorialComponent);
  };

  beforeEach(async () => {
    store = jasmine.createSpyObj('CaseStoreService', ['loadFromHistory', 'deleteFromHistory'], {
      history: signal([]),
    });
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [HistorialComponent],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CaseStoreService, useValue: store },
      ],
    })
      .overrideComponent(HistorialComponent, {
        set: { providers: [{ provide: MatDialog, useValue: dialog }] },
      })
      .compileComponents();
  });

  it('sin confirmar: NO llama a deleteFromHistory', () => {
    const fixture = setupWithDialog(false);
    fixture.componentInstance.delete('id-1');
    expect(store.deleteFromHistory).not.toHaveBeenCalled();
  });

  it('confirmado: SÍ llama a deleteFromHistory con el id correcto', () => {
    const fixture = setupWithDialog(true);
    fixture.componentInstance.delete('id-1');
    expect(store.deleteFromHistory).toHaveBeenCalledWith('id-1');
  });

  it('diálogo cerrado sin valor (undefined): NO borra', () => {
    const fixture = setupWithDialog(undefined);
    fixture.componentInstance.delete('id-1');
    expect(store.deleteFromHistory).not.toHaveBeenCalled();
  });
});

describe('HistorialComponent — formatDate', () => {
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

  it('savedAt corrupto o no parseable muestra fallback legible, no "Invalid Date"', () => {
    const fixture = TestBed.createComponent(HistorialComponent);
    const component = fixture.componentInstance;

    expect(component.formatDate('???')).toBe('Fecha desconocida');
    expect(component.formatDate('')).toBe('Fecha desconocida');
    expect(component.formatDate('not-a-date')).toBe('Fecha desconocida');
  });

  it('savedAt ISO válido se formatea en locale es-ES', () => {
    const fixture = TestBed.createComponent(HistorialComponent);
    const formatted = fixture.componentInstance.formatDate('2024-06-15T14:30:00.000Z');

    expect(formatted).not.toContain('Invalid');
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('en la tarjeta del historial, savedAt corrupto no muestra "Invalid Date"', () => {
    Object.defineProperty(store, 'history', {
      value: signal([
        {
          id: 'case-1',
          savedAt: '???',
          patientCase: {
            info: { name: 'Ana', age: 70, sex: 'F' },
            medications: [],
            diagnoses: [],
          },
        },
      ]),
    });

    const fixture = TestBed.createComponent(HistorialComponent);
    fixture.detectChanges();

    const subtitle: HTMLElement | null = fixture.nativeElement.querySelector('mat-card-subtitle');
    expect(subtitle?.textContent).toContain('Fecha desconocida');
    expect(subtitle?.textContent).not.toContain('Invalid Date');
  });
});
