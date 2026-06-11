// @linked docs/accesibilidad-ui.md
// Si cambias el nombre de clase app-tooltip, la variable --arrow-x o la lógica de posicionamiento, actualiza el doc enlazado.
import { Directive, Input, HostListener, OnDestroy, inject, DOCUMENT } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text: string | null | undefined = null;

  private readonly doc = inject(DOCUMENT);
  private tip: HTMLDivElement | null = null;

  @HostListener('mouseenter', ['$event.currentTarget'])
  show(target: EventTarget | null): void {
    const el = target as HTMLElement | null;
    if (!el || !this.text) return;
    this.remove();

    const tip = this.doc.createElement('div');
    tip.className = 'app-tooltip';
    tip.textContent = this.text;
    this.doc.body.appendChild(tip);
    this.tip = tip;

    requestAnimationFrame(() => {
      this.reposition(el);
      tip.classList.add('app-tooltip--visible');
    });
  }

  @HostListener('mouseleave')
  hide(): void { this.remove(); }

  private reposition(target: HTMLElement): void {
    if (!this.tip) return;
    const tr = target.getBoundingClientRect();
    const tw = this.tip.offsetWidth;
    const th = this.tip.offsetHeight;
    const top = tr.top - th - 10;                         // 10px gap (arrow + space)
    const rawLeft = tr.left + tr.width / 2 - tw / 2;
    const left = Math.max(6, Math.min(rawLeft, this.doc.documentElement.clientWidth - tw - 6));

    this.tip.style.top = `${top}px`;
    this.tip.style.left = `${left}px`;

    // Arrow: keep it pointing at trigger center regardless of clamping
    const arrowX = tr.left + tr.width / 2 - left;
    this.tip.style.setProperty('--arrow-x', `${arrowX}px`);
  }

  private remove(): void {
    this.tip?.remove();
    this.tip = null;
  }

  ngOnDestroy(): void { this.remove(); }
}
