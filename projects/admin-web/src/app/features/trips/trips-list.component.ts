import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BadgeComponent,
  BadgeTone,
  EmptyStateComponent,
  LocalDatePipe,
  MoneyPipe,
  TripStatus,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-trips-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe],
  template: `
    <h1 class="page-title">Trips</h1>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state icon="🧭" headline="No trips" description="Trips will appear here." />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Trip</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Miles</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @for (t of r.items; track t.id) {
              <tr>
                <td>
                  <a [routerLink]="['/trips', t.id]">{{ t.tripNumber }}</a>
                </td>
                <td>{{ t.customerName }}</td>
                <td>{{ t.vehicleLabel }}</td>
                <td>{{ t.actualPickupAt | localDate: 'short' }}</td>
                <td>
                  {{ t.actualDropoffAt ? (t.actualDropoffAt | localDate: 'short') : 'In progress' }}
                </td>
                <td>{{ t.milesDriven ?? '—' }}</td>
                <td>
                  <m-badge [tone]="statusTone(t.status)">{{ t.status }}</m-badge>
                </td>
                <td>{{ t.total | money }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class TripsListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listTrips());

  statusTone(status: TripStatus): BadgeTone {
    switch (status) {
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'ENDED_PENDING_INSPECTION':
        return 'warning';
      default:
        return 'danger';
    }
  }
}
