import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import {
  ButtonComponent,
  CardComponent,
  DistancePipe,
  LocalDatePipe,
  MoneyPipe,
} from '@matador/shared';
import { CustomerDataService } from '../../core/data/customer-data.service';

@Component({
  selector: 'customer-history-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ButtonComponent, LocalDatePipe, MoneyPipe, DistancePipe],
  template: `
    <div class="page">
      @if (trip(); as t) {
        <h1>{{ t.vehicleLabel }}</h1>
        <m-card>
          <dl>
            <dt>Pickup</dt>
            <dd>{{ t.actualPickupAt | localDate: 'long' }}</dd>
            <dt>Dropoff</dt>
            <dd>{{ t.actualDropoffAt | localDate: 'long' }}</dd>
            <dt>Distance</dt>
            <dd>{{ (t.milesDriven ?? 0) * 1609 | distance }}</dd>
            <dt>Total</dt>
            <dd>{{ t.total | money }}</dd>
          </dl>
        </m-card>
        <div class="actions">
          <m-button variant="secondary" [block]="true" [disabled]="true">Rebook</m-button>
          <m-button variant="ghost" [block]="true">Find lost item</m-button>
          <m-button variant="ghost" [block]="true">Report safety issue</m-button>
        </div>
      } @else {
        <p>Trip not found.</p>
      }
    </div>
  `,
  styles: [
    `
      .page {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
      }
      h1 {
        margin: 0;
      }
      dl {
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: var(--m-space-1) var(--m-space-3);
        margin: 0;
      }
      dt {
        color: var(--m-color-text-muted);
      }
      dd {
        margin: 0;
      }
      .actions {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-2);
      }
    `,
  ],
})
export class HistoryDetailComponent {
  readonly tripId = input.required<string>();
  private readonly data = inject(CustomerDataService);
  readonly trip = toSignal(
    toObservable(this.tripId).pipe(switchMap((id) => this.data.getHistoryTrip(id))),
  );
}
