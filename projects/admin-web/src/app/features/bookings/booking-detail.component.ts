import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ConfirmationService,
  LocalDatePipe,
  MoneyPipe,
  ToastService,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-booking-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, ButtonComponent, LocalDatePipe, MoneyPipe],
  template: `
    @if (booking(); as b) {
      <h1 class="page-title">{{ b.bookingNumber }}</h1>
      <m-card>
        <dl class="detail-grid">
          <dt>Customer</dt>
          <dd>{{ b.customerName }}</dd>
          <dt>Status</dt>
          <dd>
            <m-badge tone="info">{{ b.status }}</m-badge>
          </dd>
          <dt>Class</dt>
          <dd>{{ b.vehicleClassName }}</dd>
          <dt>Pickup</dt>
          <dd>{{ b.pickupAt | localDate: 'long' }} — {{ b.pickupAddress }}</dd>
          <dt>Dropoff</dt>
          <dd>{{ b.dropoffAt | localDate: 'long' }} — {{ b.dropoffAddress }}</dd>
          <dt>Total</dt>
          <dd>{{ b.total | money }}</dd>
        </dl>
        <div class="actions">
          @if (b.status === 'CONFIRMED') {
            <m-button variant="primary" (click)="act('Activate booking')">Activate</m-button>
          }
          @if (b.assignedVehicleId === undefined && b.status !== 'CANCELLED') {
            <m-button variant="secondary" (click)="act('Assign vehicle')">Assign vehicle</m-button>
          }
          @if (b.status !== 'CANCELLED' && b.status !== 'COMPLETED') {
            <m-button variant="danger" (click)="cancel()">Cancel</m-button>
          }
        </div>
      </m-card>
    } @else {
      <p>Booking not found.</p>
    }
  `,
  styles: [
    `
      .actions {
        display: flex;
        gap: var(--m-space-2);
        margin-top: var(--m-space-5);
      }
    `,
  ],
})
export class BookingDetailComponent {
  readonly id = input.required<string>();
  private readonly data = inject(AdminDataService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);

  readonly booking = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.data.getBooking(id))),
  );

  act(label: string): void {
    this.toast.success(`${label} (stub).`);
  }

  async cancel(): Promise<void> {
    const ok = await this.confirmation.confirm('Cancel this booking?', {
      title: 'Cancel booking',
      confirmLabel: 'Cancel booking',
      danger: true,
    });
    if (ok) {
      this.toast.success('Booking cancelled (stub).');
    }
  }
}
