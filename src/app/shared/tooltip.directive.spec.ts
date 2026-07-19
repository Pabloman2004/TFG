import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { TooltipDirective } from './tooltip.directive';

@Component({
  standalone: true,
  imports: [TooltipDirective],
  template: `<button type="button" [appTooltip]="text" tabindex="0">Trigger</button>`,
})
class HostComponent {
  text: string | null = 'Ayuda';
}

describe('TooltipDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  afterEach(() => {
    document.querySelectorAll('.app-tooltip').forEach(el => el.remove());
  });

  it('muestra el tooltip al recibir foco y lo asocia con aria-describedby', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

    const tip = document.querySelector('.app-tooltip');
    expect(tip).toBeTruthy();
    expect(tip?.getAttribute('role')).toBe('tooltip');
    expect(tip?.textContent).toBe('Ayuda');
    expect(button.getAttribute('aria-describedby')).toBe(tip?.id ?? null);
  });

  it('oculta el tooltip al perder el foco', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.dispatchEvent(new FocusEvent('focus'));
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    button.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();

    expect(document.querySelector('.app-tooltip')).toBeNull();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
  });

  it('no posiciona el tooltip por encima del viewport', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    button.style.position = 'fixed';
    button.style.top = '0px';
    button.style.left = '40px';

    button.dispatchEvent(new FocusEvent('focus'));
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

    const tip = document.querySelector('.app-tooltip') as HTMLElement | null;
    expect(tip).toBeTruthy();
    const top = parseFloat(tip!.style.top);
    expect(top).toBeGreaterThanOrEqual(6);
  });
});
