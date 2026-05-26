import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BadgeComponent,
  BadgeTone,
  EmptyStateComponent,
  LocalDatePipe,
  MoneyPipe,
  VerificationStatus,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-customers-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe],
  template: `
    <h1 class="page-title">Customers</h1>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state
          icon="👤"
          headline="No customers"
          description="Customers will appear here."
        />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Verification</th>
              <th>Status</th>
              <th>Signed up</th>
              <th>Trips</th>
              <th>Lifetime value</th>
            </tr>
          </thead>
          <tbody>
            @for (c of r.items; track c.id) {
              <tr>
                <td>
                  <a [routerLink]="['/customers', c.id]">{{ c.name }}</a>
                </td>
                <td>{{ c.email }}</td>
                <td>{{ c.phone }}</td>
                <td>
                  <m-badge [tone]="verificationTone(c.verificationStatus)">{{
                    c.verificationStatus
                  }}</m-badge>
                </td>
                <td>
                  <m-badge [tone]="c.status === 'ACTIVE' ? 'success' : 'danger'">{{
                    c.status
                  }}</m-badge>
                </td>
                <td>{{ c.signedUpAt | localDate: 'short' }}</td>
                <td>{{ c.tripCount }}</td>
                <td>{{ c.lifetimeValue | money }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class CustomersListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listCustomers());

  verificationTone(status: VerificationStatus): BadgeTone {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
