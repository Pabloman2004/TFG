// @linked docs/accesibilidad-ui.md
// Si cambias el nombre de clase app-tooltip, la variable --arrow-x o la lógica de posicionamiento, actualiza el doc enlazado.
import { Directive, Input, HostListener, OnDestroy, inject, DOCUMENT, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text: string | null | undefined = null;

  private readonly doc = inject(DOCUMENT);
  private readonly host = inject(ElementRef<HTMLElement>);
  private tip: HTMLDivElement | null = null;
  private tipId: string | null = null;

  @HostListener('mouseenter')
  @HostListener('focus')
  show(): void {
    const el = this.host.nativeElement;
    if (!this.text) return;
    this.remove();

    const tip = this.doc.createElement('div');
    tip.className = 'app-tooltip';
    tip.setAttribute('role', 'tooltip');
    this.tipId = `app-tooltip-${Math.random().toString(36).slice(2, 10)}`;
    tip.id = this.tipId;
    tip.textContent = this.text;
    this.doc.body.appendChild(tip);
    this.tip = tip;
    el.setAttribute('aria-describedby', this.tipId);

    requestAnimationFrame(() => {
      this.reposition(el);
      tip.classList.add('app-tooltip--visible');
    });
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  hide(): void { this.remove(); }

  private reposition(target: HTMLElement): void {
    if (!this.tip) return;
    const tr = target.getBoundingClientRect();
    const tw = this.tip.offsetWidth;
    const th = this.tip.offsetHeight;
    const gap = 10;
    const rawTop = tr.top - th - gap;
    const top = Math.max(6, rawTop);
    const rawLeft = tr.left + tr.width / 2 - tw / 2;
    const left = Math.max(6, Math.min(rawLeft, this.doc.documentElement.clientWidth - tw - 6));

    this.tip.style.top = `${top}px`;
    this.tip.style.left = `${left}px`;

    const arrowX = tr.left + tr.width / 2 - left;
    this.tip.style.setProperty('--arrow-x', `${arrowX}px`);
  }

  private remove(): void {
    if (this.tipId) {
      this.host.nativeElement.removeAttribute('aria-describedby');
      this.tipId = null;
    }
    this.tip?.remove();
    this.tip = null;
  }

  ngOnDestroy(): void { this.remove(); }
}
