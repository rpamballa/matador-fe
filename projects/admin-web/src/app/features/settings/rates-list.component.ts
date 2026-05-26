import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-rates-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe],
  template: `
    <div class="toolbar">
      <h1 class="page-title">Pricing Rates</h1>
      <span style="flex:1"></span>
      <a routerLink="/settings/rates/new"><m-button variant="primary">New rate</m-button></a>
    </div>
    @if (result(); as r) {
      @if (r.items.length === 0) {
        <m-empty-state icon="💲" headline="No rates" />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Vehicle class</th>
              <th>Daily rate</th>
              <th>Effective from</th>
            </tr>
          </thead>
          <tbody>
            @for (rate of r.items; track rate.id) {
              <tr>
                <td>{{ rate.vehicleClassName }}</td>
                <td>{{ rate.dailyRate | money }}</td>
                <td>{{ rate.effectiveFrom | localDate: 'short' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <p class="muted">
          Rates are immutable once effective; "new rate" supersedes via effective date.
        </p>
      }
    }
  `,
  styles: [
    `
      .muted {
        color: var(--m-color-text-muted);
        font-size: 0.8125rem;
        margin-top: var(--m-space-3);
      }
    `,
  ],
})
export class RatesListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listRates());
}
