import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe } from '@matador/shared';
import { CustomerDataService } from '../../core/data/customer-data.service';

@Component({
  selector: 'customer-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe],
  template: `
    <section class="history">
      <h1>Trip History</h1>
      @if (trips(); as list) {
        @if (list.length === 0) {
          <m-empty-state
            icon="🚗"
            headline="No trips yet"
            description="Your completed trips will appear here."
          />
        } @else {
          @for (t of list; track t.id) {
            <a [routerLink]="['/history', t.id]">
              <m-card>
                <div class="row">
                  <strong>{{ t.vehicleLabel }}</strong>
                  <span>{{ t.total | money }}</span>
                </div>
                <div class="dates">
                  {{ t.actualPickupAt | localDate: 'short' }} —
                  {{ t.actualDropoffAt | localDate: 'short' }}
                </div>
              </m-card>
            </a>
          }
        }
      }
    </section>
  `,
  styles: [
    `
      .history {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
      }
      h1 {
        margin: 0;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .dates {
        color: var(--m-color-text-secondary);
        font-size: 0.875rem;
        margin-top: var(--m-space-1);
      }
    `,
  ],
})
export class HistoryComponent {
  private readonly data = inject(CustomerDataService);
  readonly trips = toSignal(this.data.listHistory());
}
