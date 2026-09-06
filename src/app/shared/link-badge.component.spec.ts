import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  LinkBadgeComponent,
  associationLeadText,
  groupLinkedItems,
} from './link-badge.component';

@Component({
  standalone: true,
  imports: [LinkBadgeComponent],
  template: `
    <div class="parent" (click)="parentClicks = parentClicks + 1">
      <app-link-badge [items]="items" [medicationIds]="medicationIds" />
    </div>
  `,
})
class HostComponent {
  items: readonly string[] = ['Ibuprofeno', 'Insuficiencia cardíaca'];
  medicationIds: ReadonlySet<string> = new Set(['Ibuprofeno']);
  parentClicks = 0;
}

describe('groupLinkedItems', () => {
  it('separa medicamentos y diagnósticos sin etiquetas entre paréntesis', () => {
    const grouped = groupLinkedItems(
      ['Ibuprofeno', 'Prednisona', 'Insuficiencia cardíaca'],
      new Set(['Ibuprofeno', 'Prednisona']),
    );

    expect(grouped.medications).toEqual(['Ibuprofeno', 'Prednisona']);
    expect(grouped.diagnoses).toEqual(['Insuficiencia cardíaca']);
  });
});

describe('associationLeadText', () => {
  it('nombra este elemento (el del icono) y deja la lista para los asociados', () => {
    expect(associationLeadText()).toBe(
      'La literatura científica reconoce una asociación entre este elemento y:',
    );
  });
});

describe('LinkBadgeComponent', () => {
  const openPopover = async (fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>) => {
    const button = fixture.debugElement.query(By.css('button.link-badge')).nativeElement as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    fixture.detectChanges();
    return button;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  afterEach(() => {
    document.querySelectorAll('.app-link-popover').forEach(el => {
      const popover = el as HTMLElement & { hidePopover?: () => void };
      popover.hidePopover?.();
      el.remove();
    });
  });

  it('renderiza un botón, nunca un span, con el mismo estilo aunque haya varios enlaces', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button.link-badge');
    const spans = fixture.nativeElement.querySelectorAll('span.link-badge');
    const badge = buttons[0] as HTMLButtonElement;

    expect(buttons.length).toBe(1);
    expect(spans.length).toBe(0);
    expect(badge.classList.contains('link-badge--multi')).toBeFalse();
    expect(badge.textContent).toContain('2');
  });

  it('abre un popover HTML con listas y sublistas al pulsar, también sin hover', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(document.querySelector('.app-link-popover:popover-open')).toBeNull();

    await openPopover(fixture);

    const popover = document.querySelector('.app-link-popover:popover-open');
    expect(popover).toBeTruthy();
    expect(popover?.textContent).toContain(
      'La literatura científica reconoce una asociación entre este elemento y:',
    );
    expect(popover?.querySelector('.app-link-popover-group')?.textContent).toContain('Medicamentos');
    expect(popover?.textContent).toContain('Ibuprofeno');
    expect(popover?.textContent).toContain('Diagnósticos');
    expect(popover?.textContent).toContain('Insuficiencia cardíaca');
    expect(popover?.textContent).not.toContain('(medicamento)');
    expect(popover?.textContent).not.toContain('necesita');
  });

  it('no propaga el click al contenedor (la fila de diagnóstico no debe conmutarse)', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    await openPopover(fixture);

    expect(fixture.componentInstance.parentClicks).toBe(0);
  });
});
