import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'm-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="m-empty-state">
      @if (icon()) {
        <div class="m-empty-state__icon">{{ icon() }}</div>
      }
      <h3 class="m-empty-state__headline">{{ headline() }}</h3>
      @if (description()) {
        <p class="m-empty-state__description">{{ description() }}</p>
      }
      <div class="m-empty-state__action">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .m-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--m-space-2);
        padding: var(--m-space-10) var(--m-space-4);
        color: var(--m-color-text-secondary);
      }
      .m-empty-state__icon {
        font-size: 2rem;
      }
      .m-empty-state__headline {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--m-color-text-primary);
      }
      .m-empty-state__description {
        margin: 0;
        font-size: 0.875rem;
      }
      .m-empty-state__action {
        margin-top: var(--m-space-2);
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly icon = input<string | null>(null);
  readonly headline = input.required<string>();
  readonly description = input<string | null>(null);
}
