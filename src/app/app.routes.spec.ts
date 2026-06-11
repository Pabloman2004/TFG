import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { routes } from './app.routes';
import { HistorialComponent } from './historial/historial.component';
import { ROUTES } from './app.routes.constants';

@Component({ standalone: true, template: '<router-outlet />', imports: [RouterOutlet] })
class TestShellComponent {}

describe('app.routes — ruta historial', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestShellComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('navegar a /historial renderiza HistorialComponent (no redirige al wildcard)', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(TestShellComponent);
    fixture.detectChanges();

    await router.navigate([ROUTES.HISTORIAL]);
    fixture.detectChanges();

    const currentRoute = router.routerState.snapshot.root.firstChild;
    expect(currentRoute?.component).toBe(HistorialComponent);
  });
});
