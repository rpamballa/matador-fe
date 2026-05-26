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
  selector: 'admin-trip-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, ButtonComponent, LocalDatePipe, MoneyPipe],
  template: `
    @if (trip(); as t) {
      <h1 class="page-title">{{ t.tripNumber }}</h1>
      <m-card>
        <dl class="detail-grid">
          <dt>Customer</dt>
          <dd>{{ t.customerName }}</dd>
          <dt>Vehicle</dt>
          <dd>{{ t.vehicleLabel }}</dd>
          <dt>Status</dt>
          <dd>
            <m-badge tone="info">{{ t.status }}</m-badge>
          </dd>
          <dt>Pickup</dt>
          <dd>{{ t.actualPickupAt | localDate: 'long' }}</dd>
          <dt>Dropoff</dt>
          <dd>{{ t.actualDropoffAt ? (t.actualDropoffAt | localDate: 'long') : 'In progress' }}</dd>
          <dt>Miles</dt>
          <dd>{{ t.milesDriven ?? '—' }}</dd>
          <dt>Total</dt>
          <dd>{{ t.total | money }}</dd>
        </dl>
        <div class="actions">
          @if (t.status === 'ENDED_PENDING_INSPECTION') {
            <m-button variant="primary" (click)="closeTrip()">Close trip</m-button>
          }
          <m-button variant="secondary" (click)="toast.success('Incident form (stub).')">
            Add incident
          </m-button>
        </div>
      </m-card>
    } @else {
      <p>Trip not found.</p>
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
export class TripDetailComponent {
  readonly id = input.required<string>();
  private readonly data = inject(AdminDataService);
  private readonly confirmation = inject(ConfirmationService);
  readonly toast = inject(ToastService);

  readonly trip = toSignal(toObservable(this.id).pipe(switchMap((id) => this.data.getTrip(id))));

  async closeTrip(): Promise<void> {
    const ok = await this.confirmation.confirm('Close this trip?', {
      title: 'Close trip',
      confirmLabel: 'Close',
    });
    if (ok) {
      this.toast.success('Trip closed (stub).');
    }
  }
}
