import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent, DistancePipe, EmptyStateComponent, MoneyPipe } from '@matador/shared';
import { AvailableClass, CustomerDataService } from '../../core/data/customer-data.service';
import { BookingFlowService } from './booking-flow.service';

@Component({
  selector: 'customer-select-car',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, EmptyStateComponent, MoneyPipe, DistancePipe],
  template: `
    <div class="page">
      <h1>Select your car</h1>
      @if (plan(); as p) {
        <p class="trip">{{ p.startAddress }} → {{ p.endAddress }}</p>
      }
      @if (classes(); as list) {
        @if (list.length === 0) {
          <m-empty-state icon="🚗" headline="No cars available" />
        } @else {
          <div class="cards">
            @for (c of list; track c.id) {
              <m-card class="vehicle" (click)="choose(c)">
                <div class="row">
                  <strong>{{ c.name }}</strong>
                  <span class="rate">{{ c.baseDailyRate | money }}/day</span>
                </div>
                <div class="meta">
                  <span>{{ c.rangeExample }}</span>
                  <span>{{ c.distanceMeters | distance }}</span>
                  <span>★ {{ c.rating }} ({{ c.tripCount }})</span>
                </div>
                <div class="delivery">30 minutes delivery time</div>
              </m-card>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .page {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
      }
      h1 {
        margin: 0 0 var(--m-space-2);
      }
      .trip {
        color: var(--m-color-text-secondary);
        font-size: 0.875rem;
        margin: 0 0 var(--m-space-4);
      }
      .cards {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
      }
      .vehicle {
        cursor: pointer;
      }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .rate {
        color: var(--m-color-primary);
        font-weight: 600;
      }
      .meta {
        display: flex;
        gap: var(--m-space-3);
        flex-wrap: wrap;
        color: var(--m-color-text-secondary);
        font-size: 0.8125rem;
        margin-top: var(--m-space-1);
      }
      .delivery {
        margin-top: var(--m-space-2);
        font-size: 0.75rem;
        color: var(--m-color-success);
      }
    `,
  ],
})
export class SelectCarComponent {
  private readonly data = inject(CustomerDataService);
  private readonly flow = inject(BookingFlowService);
  private readonly router = inject(Router);

  readonly classes = toSignal(this.data.listAvailableClasses());
  readonly plan = this.flow.plan;

  choose(c: AvailableClass): void {
    this.flow.selectedClassId.set(c.id);
    this.router.navigate(['/booking/checkout']);
  }
}
