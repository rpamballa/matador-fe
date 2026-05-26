import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BadgeComponent, EmptyStateComponent, LocalDatePipe } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-inspections-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, EmptyStateComponent, LocalDatePipe],
  template: `
    <h1 class="page-title">Inspections</h1>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state icon="📷" headline="No inspections to review" />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Trip</th>
              <th>Phase</th>
              <th>Vehicle</th>
              <th>Submitted</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (i of r.items; track i.id) {
              <tr>
                <td>
                  <a [routerLink]="['/inspections', i.id]">{{ i.tripNumber }}</a>
                </td>
                <td>{{ i.phase }}</td>
                <td>{{ i.vehicleLabel }}</td>
                <td>{{ i.submittedAt | localDate: 'short' }}</td>
                <td>
                  <m-badge tone="warning">{{ i.status }}</m-badge>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class InspectionsListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listInspections());
}
