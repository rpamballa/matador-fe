import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BadgeComponent,
  BadgeTone,
  EmptyStateComponent,
  LocalDatePipe,
  VehicleStatus,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-vehicles-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, EmptyStateComponent, LocalDatePipe],
  template: `
    <h1 class="page-title">Vehicles</h1>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state
          icon="🚗"
          headline="No vehicles"
          description="Add a vehicle to get started."
        />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Plate</th>
              <th>Vehicle</th>
              <th>Class</th>
              <th>Status</th>
              <th>Location</th>
              <th>Fuel/Charge</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            @for (v of r.items; track v.id) {
              <tr>
                <td>
                  <a [routerLink]="['/vehicles', v.id]">{{ v.licensePlate }}</a>
                </td>
                <td>{{ v.year }} {{ v.make }} {{ v.model }}</td>
                <td>{{ v.className }}</td>
                <td>
                  <m-badge [tone]="statusTone(v.status)">{{ v.status }}</m-badge>
                </td>
                <td>{{ v.locationAddress ?? '—' }}</td>
                <td>{{ v.fuelPercent !== undefined ? v.fuelPercent + '%' : '—' }}</td>
                <td>{{ v.lastUpdated | localDate: 'short' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class VehiclesListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listVehicles());

  statusTone(status: VehicleStatus): BadgeTone {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'IN_USE':
      case 'RESERVED':
        return 'info';
      case 'MAINTENANCE':
        return 'warning';
      default:
        return 'danger';
    }
  }
}
