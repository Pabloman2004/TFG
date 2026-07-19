import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { routes } from './app.routes';
import { MedsStepComponent } from './steps/meds-step/meds-step.component';
import { ROUTES } from './app.routes.constants';

@Component({ standalone: true, template: '<router-outlet />', imports: [RouterOutlet] })
class TestShellComponent {}

describe('app.routes — wildcard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestShellComponent],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('la ruta desconocida /historial cae en el wildcard hacia /medicaciones', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(TestShellComponent);
    fixture.detectChanges();

    await router.navigate(['historial']);
    fixture.detectChanges();

    expect(router.url).toBe(`/${ROUTES.MEDICACIONES}`);
    const currentRoute = router.routerState.snapshot.root.firstChild;
    expect(currentRoute?.component).toBe(MedsStepComponent);
  });
});
