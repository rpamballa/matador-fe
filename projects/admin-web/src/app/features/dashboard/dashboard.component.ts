import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@matador/shared';

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <h1>Dashboard</h1>
    <div class="kpis">
      <m-card>Active trips<br /><strong>—</strong></m-card>
      <m-card>Bookings today<br /><strong>—</strong></m-card>
      <m-card>Vehicles available<br /><strong>—</strong></m-card>
      <m-card>Revenue this month<br /><strong>—</strong></m-card>
    </div>
  `,
  styles: [
    `
      h1 {
        font-size: 1.25rem;
        margin: 0 0 var(--m-space-4);
      }
      .kpis {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--m-space-4);
      }
      strong {
        font-size: 1.5rem;
      }
    `,
  ],
})
export class DashboardComponent {}
