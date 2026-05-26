import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { BadgeComponent, CardComponent, LocalDatePipe, MoneyPipe } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-customer-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, LocalDatePipe, MoneyPipe],
  template: `
    @if (customer(); as c) {
      <h1 class="page-title">{{ c.name }}</h1>
      <m-card>
        <dl class="detail-grid">
          <dt>Email</dt>
          <dd>{{ c.email }}</dd>
          <dt>Phone</dt>
          <dd>{{ c.phone }}</dd>
          <dt>Verification</dt>
          <dd>
            <m-badge tone="info">{{ c.verificationStatus }}</m-badge>
          </dd>
          <dt>Status</dt>
          <dd>
            <m-badge [tone]="c.status === 'ACTIVE' ? 'success' : 'danger'">{{ c.status }}</m-badge>
          </dd>
          <dt>Signed up</dt>
          <dd>{{ c.signedUpAt | localDate: 'long' }}</dd>
          <dt>Trips</dt>
          <dd>{{ c.tripCount }}</dd>
          <dt>Lifetime value</dt>
          <dd>{{ c.lifetimeValue | money }}</dd>
        </dl>
      </m-card>
    } @else {
      <p>Customer not found.</p>
    }
  `,
})
export class CustomerDetailComponent {
  readonly id = input.required<string>();
  private readonly data = inject(AdminDataService);
  readonly customer = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.data.getCustomer(id))),
  );
}
