import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent, MoneyPipe } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, MoneyPipe],
  template: `
    <h1 class="page-title">Dashboard</h1>
    @if (kpis(); as k) {
      <div class="kpis">
        <m-card
          ><span class="label">Active trips</span><strong>{{ k.activeTrips }}</strong></m-card
        >
        <m-card
          ><span class="label">Bookings today</span><strong>{{ k.bookingsToday }}</strong></m-card
        >
        <m-card
          ><span class="label">Vehicles available</span
          ><strong>{{ k.vehiclesAvailable }}</strong></m-card
        >
        <m-card
          ><span class="label">Revenue this month</span
          ><strong>{{ k.revenueThisMonth | money }}</strong></m-card
        >
      </div>
    }
  `,
  styles: [
    `
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--m-space-4);
      }
      .label {
        display: block;
        color: var(--m-color-text-muted);
        font-size: 0.8125rem;
        margin-bottom: var(--m-space-1);
      }
      strong {
        font-size: 1.5rem;
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly data = inject(AdminDataService);
  readonly kpis = toSignal(this.data.dashboard());
}
