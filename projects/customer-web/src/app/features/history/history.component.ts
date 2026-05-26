import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmptyStateComponent } from '@matador/shared';

@Component({
  selector: 'customer-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <section class="history">
      <h1>Trip History</h1>
      <m-empty-state
        icon="🚗"
        headline="No trips yet"
        description="Your completed trips will appear here."
      />
    </section>
  `,
  styles: [
    `
      .history {
        padding: var(--m-space-6);
      }
    `,
  ],
})
export class HistoryComponent {}
