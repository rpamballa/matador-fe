import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  ConfirmationService,
  LocalDatePipe,
  ToastService,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-vehicle-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, ButtonComponent, LocalDatePipe],
  template: `
    @if (vehicle(); as v) {
      <h1 class="page-title">{{ v.year }} {{ v.make }} {{ v.model }}</h1>
      <m-card>
        <dl class="detail-grid">
          <dt>VIN</dt>
          <dd>{{ v.vin }}</dd>
          <dt>Plate</dt>
          <dd>{{ v.licensePlate }}</dd>
          <dt>Class</dt>
          <dd>{{ v.className }}</dd>
          <dt>Status</dt>
          <dd>
            <m-badge tone="info">{{ v.status }}</m-badge>
          </dd>
          <dt>Location</dt>
          <dd>{{ v.locationAddress ?? '—' }}</dd>
          <dt>Fuel/Charge</dt>
          <dd>{{ v.fuelPercent !== undefined ? v.fuelPercent + '%' : '—' }}</dd>
          <dt>Odometer</dt>
          <dd>{{ v.odometerMiles !== undefined ? v.odometerMiles + ' mi' : '—' }}</dd>
          <dt>Updated</dt>
          <dd>{{ v.lastUpdated | localDate: 'long' }}</dd>
        </dl>
        <div class="telematics">
          <m-button variant="secondary" (click)="command('Lock')">Lock</m-button>
          <m-button variant="secondary" (click)="command('Unlock')">Unlock</m-button>
        </div>
      </m-card>
    } @else {
      <p>Vehicle not found.</p>
    }
  `,
  styles: [
    `
      .telematics {
        display: flex;
        gap: var(--m-space-2);
        margin-top: var(--m-space-5);
      }
    `,
  ],
})
export class VehicleDetailComponent {
  readonly id = input.required<string>();
  private readonly data = inject(AdminDataService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);

  readonly vehicle = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.data.getVehicle(id))),
  );

  async command(action: 'Lock' | 'Unlock'): Promise<void> {
    const ok = await this.confirmation.confirm(`${action} this vehicle?`, {
      title: action,
      confirmLabel: action,
    });
    if (ok) {
      this.toast.success(`${action} command sent.`);
    }
  }
}
