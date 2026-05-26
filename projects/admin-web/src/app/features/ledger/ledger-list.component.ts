import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ButtonComponent,
  EmptyStateComponent,
  LedgerEntry,
  LocalDatePipe,
  MoneyPipe,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-ledger-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, EmptyStateComponent, LocalDatePipe, MoneyPipe],
  template: `
    <h1 class="page-title">Ledger</h1>
    @if (result(); as r) {
      <div class="toolbar">
        <span
          >Gross: <strong>{{ { amount: gross(), currency: 'USD' } | money }}</strong></span
        >
        <m-button variant="secondary" (click)="exportCsv(r.items)">Export CSV</m-button>
      </div>
      @if (r.items.length === 0) {
        <m-empty-state icon="💳" headline="No entries" description="Ledger entries appear here." />
      } @else {
        <table class="admin-table">
          <thead>
            <tr>
              <th>Occurred</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Payment ref</th>
            </tr>
          </thead>
          <tbody>
            @for (e of r.items; track e.id) {
              <tr>
                <td>{{ e.occurredAt | localDate: 'short' }}</td>
                <td>{{ e.customerName }}</td>
                <td>{{ e.type }}</td>
                <td>{{ e.amount | money }}</td>
                <td>{{ e.description }}</td>
                <td>{{ e.paymentIntentRef ?? '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    }
  `,
})
export class LedgerListComponent {
  private readonly data = inject(AdminDataService);
  readonly result = toSignal(this.data.listLedger());
  readonly gross = computed(() =>
    (this.result()?.items ?? []).reduce((sum, e) => sum + e.amount.amount, 0),
  );

  exportCsv(items: LedgerEntry[]): void {
    const header = ['occurredAt', 'customer', 'type', 'amountCents', 'description', 'paymentRef'];
    const rows = items.map((e) =>
      [
        e.occurredAt,
        e.customerName,
        e.type,
        e.amount.amount,
        e.description,
        e.paymentIntentRef ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
