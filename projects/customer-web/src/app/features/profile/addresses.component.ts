import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CardComponent, EmptyStateComponent, ToastService } from '@matador/shared';
import { CustomerDataService } from '../../core/data/customer-data.service';

@Component({
  selector: 'customer-addresses',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, EmptyStateComponent],
  template: `
    <div class="page">
      <h1>Saved Addresses</h1>
      @if (addresses(); as list) {
        @if (list.length === 0) {
          <m-empty-state icon="📍" headline="No saved addresses" />
        } @else {
          @for (a of list; track a.id) {
            <m-card>
              <strong>{{ a.label }}</strong>
              <div class="line">{{ a.line1 }}, {{ a.city }}, {{ a.state }} {{ a.postalCode }}</div>
            </m-card>
          }
        }
      }
      <button type="button" class="add" (click)="add()">+ Add address</button>
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
      .line {
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
export class AddressesComponent {
  private readonly data = inject(CustomerDataService);
  private readonly toast = inject(ToastService);
  readonly addresses = toSignal(this.data.listAddresses());

  add(): void {
    this.toast.show('Address form (stub).', 'info');
  }
}
