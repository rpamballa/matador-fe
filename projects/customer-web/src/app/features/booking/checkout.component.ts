import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ButtonComponent, CardComponent, MoneyPipe, ToastService } from '@matador/shared';
import { CustomerDataService } from '../../core/data/customer-data.service';
import { BookingFlowService } from './booking-flow.service';

@Component({
  selector: 'customer-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ButtonComponent, MoneyPipe],
  template: `
    <div class="page">
      <h1>Finalize your trip</h1>
      @if (vehicleClass(); as vc) {
        <m-card>
          <div class="row">
            <strong>{{ vc.name }}</strong>
            <span>★ {{ vc.rating }} ({{ vc.tripCount }})</span>
          </div>
          @if (plan(); as p) {
            <p class="addr">{{ p.startAddress }} → {{ p.endAddress }}</p>
          }
          @if (quote(); as q) {
            <dl class="breakdown">
              <dt>Subtotal</dt>
              <dd>{{ q.subtotal | money }}</dd>
              <dt>Taxes</dt>
              <dd>{{ q.taxes | money }}</dd>
              <dt>Delivery fee</dt>
              <dd>{{ q.deliveryFee | money }}</dd>
              <dt>Insurance</dt>
              <dd>{{ q.insurance | money }}</dd>
              <dt class="total">Total</dt>
              <dd class="total">{{ q.total | money }}</dd>
            </dl>
          }
        </m-card>

        <h2>Primary driver</h2>
        <m-card>You</m-card>

        <h2>Insurance</h2>
        <m-card>
          Standard — partial protection up to $10,000. You may still be liable for other damages.
          <button type="button" class="link" disabled>Change option</button>
        </m-card>

        <h2>Payment</h2>
        <m-card>
          <button type="button" class="link">Add payment method</button>
        </m-card>

        <m-button variant="primary" [block]="true" [disabled]="submitting()" (click)="complete()">
          Complete Checkout
        </m-button>
      } @else {
        <p>No vehicle selected. Start from the home screen.</p>
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
      h2 {
        margin: var(--m-space-3) 0 0;
        font-size: 1rem;
      }
      .row {
        display: flex;
        justify-content: space-between;
      }
      .addr {
        color: var(--m-color-text-secondary);
        font-size: 0.875rem;
      }
      .breakdown {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: var(--m-space-1) var(--m-space-4);
        margin: var(--m-space-3) 0 0;
      }
      .breakdown dt {
        color: var(--m-color-text-secondary);
      }
      .breakdown dd {
        margin: 0;
        text-align: right;
      }
      .total {
        font-weight: 700;
        color: var(--m-color-text-primary);
      }
      .link {
        border: none;
        background: none;
        color: var(--m-color-primary);
        font: inherit;
        cursor: pointer;
        padding: 0;
        margin-top: var(--m-space-2);
        display: block;
      }
      .link:disabled {
        color: var(--m-color-text-muted);
        cursor: not-allowed;
      }
    `,
  ],
})
export class CheckoutComponent {
  private readonly data = inject(CustomerDataService);
  private readonly flow = inject(BookingFlowService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);
  readonly plan = this.flow.plan;
  private readonly classId$ = toObservable(this.flow.selectedClassId);

  readonly vehicleClass = toSignal(
    this.classId$.pipe(switchMap((id) => this.data.getClass(id ?? ''))),
  );
  readonly quote = toSignal(this.classId$.pipe(switchMap((id) => this.data.quoteFor(id ?? ''))));

  complete(): void {
    this.submitting.set(true);
    // Stub: a real implementation creates the booking and confirms the Stripe hold.
    const bookingId = 'bk-' + Math.random().toString(36).slice(2, 8);
    this.toast.success('Booking confirmed!');
    this.flow.reset();
    this.router.navigate(['/booking/confirmation', bookingId]);
  }
}
