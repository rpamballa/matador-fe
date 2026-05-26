import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'm-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="m-badge" [attr.data-tone]="tone()"><ng-content /></span>`,
  styles: [
    `
      .m-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px var(--m-space-2);
        border-radius: var(--m-radius-pill);
        font-size: 0.75rem;
        font-weight: 600;
        line-height: 1.4;
      }
      .m-badge[data-tone='neutral'] {
        background: var(--m-color-background);
        color: var(--m-color-text-secondary);
      }
      .m-badge[data-tone='success'] {
        background: rgba(22, 163, 74, 0.12);
        color: var(--m-color-success);
      }
      .m-badge[data-tone='warning'] {
        background: rgba(217, 119, 6, 0.12);
        color: var(--m-color-warning);
      }
      .m-badge[data-tone='danger'] {
        background: rgba(220, 38, 38, 0.12);
        color: var(--m-color-danger);
      }
      .m-badge[data-tone='info'] {
        background: var(--m-color-primary-soft);
        color: var(--m-color-primary-dark);
      }
    `,
  ],
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
}
