import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EmptyStateComponent } from '@matador/shared';

/**
 * Temporary stub for customer screens that are routed but not yet built.
 * Reads `title` from route data. Replace with the real feature component as
 * each flow is implemented (see docs/FRONTEND-CUSTOMER.md § 9).
 */
@Component({
  selector: 'customer-placeholder-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <div class="page">
      <m-empty-state
        icon="🚧"
        [headline]="title() + ' — coming soon'"
        description="This flow is scaffolded but not yet implemented."
      />
    </div>
  `,
  styles: [
    `
      .page {
        padding: var(--m-space-8) var(--m-space-6);
      }
    `,
  ],
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = toSignal(this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Page')), {
    initialValue: 'Page',
  });
}
