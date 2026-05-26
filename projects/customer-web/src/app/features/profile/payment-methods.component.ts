import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BadgeComponent, CardComponent, EmptyStateComponent, ToastService } from '@matador/shared';
import { CustomerDataService } from '../../core/data/customer-data.service';

@Component({
  selector: 'customer-payment-methods',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <h1>Payment Methods</h1>
      @if (cards(); as list) {
        @if (list.length === 0) {
          <m-empty-state icon="💳" headline="No payment methods" />
        } @else {
          @for (c of list; track c.id) {
            <m-card>
              <div class="card-row">
                <span>{{ c.brand }} •••• {{ c.last4 }}</span>
                @if (c.isDefault) {
                  <m-badge tone="info">Default</m-badge>
                }
              </div>
              <div class="exp">Expires {{ c.expMonth }}/{{ c.expYear }}</div>
            </m-card>
          }
        }
      }
      <button type="button" class="add" (click)="add()">+ Add payment method</button>
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
      .card-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }
      .exp {
        color: var(--m-color-text-secondary);
        font-size: 0.875rem;
        margin-top: var(--m-space-1);
      }
      .add {
        border: 1px dashed var(--m-color-border);
        background: none;
        border-radius: var(--m-radius-md);
        padding: var(--m-space-3);
        font: inherit;
        color: var(--m-color-primary);
        cursor: pointer;
      }
    `,
  ],
})
export class PaymentMethodsComponent {
  private readonly data = inject(CustomerDataService);
  private readonly toast = inject(ToastService);
  readonly cards = toSignal(this.data.listCards());

  add(): void {
    // Stub: a real implementation opens a Stripe Elements card modal.
    this.toast.show('Add card via Stripe Elements (stub).', 'info');
  }
}
