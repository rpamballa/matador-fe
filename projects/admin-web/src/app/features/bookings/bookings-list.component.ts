import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BadgeComponent,
  BadgeTone,
  BookingStatus,
  EmptyStateComponent,
  LocalDatePipe,
  MoneyPipe,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-bookings-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe],
  template: `
    <h1 class="page-title">Bookings</h1>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state icon="📅" headline="No bookings" description="Bookings will appear here." />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Customer</th>
              <th>Class</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            @for (b of r.items; track b.id) {
              <tr>
                <td>
                  <a [routerLink]="['/bookings', b.id]">{{ b.bookingNumber }}</a>
                </td>
                <td>{{ b.customerName }}</td>
                <td>{{ b.vehicleClassName }}</td>
                <td>{{ b.pickupAt | localDate: 'short' }}</td>
                <td>{{ b.dropoffAt | localDate: 'short' }}</td>
                <td>
                  <m-badge [tone]="statusTone(b.status)">{{ b.status }}</m-badge>
                </td>
                <td>{{ b.total | money }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class BookingsListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listBookings());

  statusTone(status: BookingStatus): BadgeTone {
    switch (status) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
