// @linked docs/accesibilidad-ui.md
// Si cambias el popover HTML (.app-link-popover), el texto de asociación o el botón .link-badge, actualiza el doc enlazado.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';

export type LinkedItemGroups = {
  readonly medications: readonly string[];
  readonly diagnoses: readonly string[];
};

export function groupLinkedItems(
  items: readonly string[],
  medicationIds: ReadonlySet<string>,
): LinkedItemGroups {
  const medications: string[] = [];
  const diagnoses: string[] = [];
  for (const item of items) {
    if (medicationIds.has(item)) medications.push(item);
    else diagnoses.push(item);
  }
  return { medications, diagnoses };
}

export function associationLeadText(): string {
  return 'La literatura científica reconoce una asociación entre este elemento y:';
}

let nextPopoverId = 0;

@Component({
  selector: 'app-link-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'stopRowToggle($event)',
    '(keydown)': 'stopRowToggle($event)',
    '(pointerdown)': 'stopRowToggle($event)',
  },
  template: `
    @if (items.length > 0) {
      <button
        #trigger
        type="button"
        class="link-badge"
        [attr.popovertarget]="popoverId"
        [attr.aria-expanded]="open"
        [attr.aria-controls]="popoverId"
        [attr.aria-label]="ariaLabel"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        {{ items.length }}
      </button>
      <div
        #panel
        class="app-link-popover"
        [id]="popoverId"
        [attr.popover]="'auto'"
        role="dialog"
        [attr.aria-label]="ariaLabel"
        (toggle)="onPopoverToggle($event)"
      >
        <p class="app-link-popover-lead">{{ leadText }}</p>
        @if (groups.medications.length > 0) {
          <p class="app-link-popover-group">Medicamentos</p>
          <ul>
            @for (name of groups.medications; track name) {
              <li>{{ name }}</li>
            }
          </ul>
        }
        @if (groups.diagnoses.length > 0) {
          <p class="app-link-popover-group">Diagnósticos</p>
          <ul>
            @for (name of groups.diagnoses; track name) {
              <li>{{ name }}</li>
            }
          </ul>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      margin-left: auto;
      flex-shrink: 0;
    }

    .link-badge {
      appearance: none;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      margin: 0;
      padding: 1px 5px;
      border-radius: 999px;
      border: 1px solid #93c5fd;
      background: #dbeafe;
      color: #1d4ed8;
      font-family: inherit;
      font-size: calc(10px * var(--font-scale, 1));
      font-weight: 700;
      line-height: 1.4;
      cursor: pointer;
    }

    .link-badge:hover,
    .link-badge:focus-visible {
      border-color: #60a5fa;
      background: #bfdbfe;
    }
  `],
})
export class LinkBadgeComponent implements OnDestroy {
  @Input({ required: true }) items: readonly string[] = [];
  @Input() medicationIds: ReadonlySet<string> = new Set();

  @ViewChild('trigger') private triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') private panelRef?: ElementRef<HTMLElement>;

  readonly popoverId = `link-popover-${nextPopoverId++}`;
  open = false;

  get groups(): LinkedItemGroups {
    return groupLinkedItems(this.items, this.medicationIds);
  }

  get leadText(): string {
    return associationLeadText();
  }

  get ariaLabel(): string {
    const n = this.items.length;
    return n === 1
      ? 'Ver la asociación reconocida por la literatura científica'
      : `Ver las ${n} asociaciones reconocidas por la literatura científica`;
  }

  stopRowToggle(event: Event): void {
    event.stopPropagation();
  }

  onPopoverToggle(event: Event): void {
    const next = 'newState' in event ? (event as ToggleEvent).newState : '';
    this.open = next === 'open';
    if (this.open) {
      requestAnimationFrame(() => this.reposition());
    }
  }

  ngOnDestroy(): void {
    this.panelRef?.nativeElement.hidePopover?.();
  }

  private reposition(): void {
    const panel = this.panelRef?.nativeElement;
    const trigger = this.triggerRef?.nativeElement;
    if (!panel || !trigger) return;

    const tr = trigger.getBoundingClientRect();
    const pw = panel.offsetWidth;
    const ph = panel.offsetHeight;
    const gap = 10;
    const viewportW = document.documentElement.clientWidth;
    const viewportH = document.documentElement.clientHeight;

    const spaceAbove = tr.top - gap;
    const placeBelow = spaceAbove < ph && tr.bottom + gap + ph <= viewportH - 6;
    const top = placeBelow
      ? tr.bottom + gap
      : Math.max(6, tr.top - ph - gap);
    const rawLeft = tr.left + tr.width / 2 - pw / 2;
    const left = Math.max(6, Math.min(rawLeft, viewportW - pw - 6));

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    panel.classList.toggle('app-link-popover--below', placeBelow);

    const arrowX = tr.left + tr.width / 2 - left;
    panel.style.setProperty('--arrow-x', `${arrowX}px`);
  }
}
