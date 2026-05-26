import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BadgeComponent,
  BadgeTone,
  EmptyStateComponent,
  IncidentSeverity,
  LocalDatePipe,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-incidents-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, EmptyStateComponent, LocalDatePipe],
  template: `
    <h1 class="page-title">Incidents</h1>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state
          icon="⚠️"
          headline="No incidents"
          description="Reported incidents appear here."
        />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Description</th>
              <th>Reported</th>
            </tr>
          </thead>
          <tbody>
            @for (i of r.items; track i.id) {
              <tr>
                <td>{{ i.type }}</td>
                <td>
                  <m-badge [tone]="severityTone(i.severity)">{{ i.severity }}</m-badge>
                </td>
                <td>
                  <m-badge tone="info">{{ i.status }}</m-badge>
                </td>
                <td>{{ i.description }}</td>
                <td>{{ i.reportedAt | localDate: 'short' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class IncidentsListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listIncidents());

  severityTone(severity: IncidentSeverity): BadgeTone {
    switch (severity) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
