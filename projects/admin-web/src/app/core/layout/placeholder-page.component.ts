import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EmptyStateComponent } from '@matador/shared';

/**
 * Temporary stub for admin feature screens that are routed but not yet built.
 * Reads `title` from route data. Replace with the real feature component as
 * each feature is implemented (see docs/FRONTEND-ADMIN.md § 7).
 */
@Component({
  selector: 'admin-placeholder-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <h1>{{ title() }}</h1>
    <m-empty-state
      icon="🚧"
      [headline]="title() + ' — coming soon'"
      description="This screen is scaffolded but not yet implemented."
    />
  `,
  styles: [
    `
      h1 {
        font-size: 1.25rem;
        margin: 0 0 var(--m-space-4);
      }
    `,
  ],
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = toSignal(
    this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Page')),
    { initialValue: 'Page' },
  );
}
