import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import {
  ButtonComponent,
  CardComponent,
  ConfirmationService,
  LocalDatePipe,
  ToastService,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-inspection-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ButtonComponent, LocalDatePipe],
  template: `
    @if (inspection(); as i) {
      <h1 class="page-title">Inspection — {{ i.tripNumber }} ({{ i.phase }})</h1>
      <m-card>
        <dl class="detail-grid">
          <dt>Vehicle</dt>
          <dd>{{ i.vehicleLabel }}</dd>
          <dt>Submitted</dt>
          <dd>{{ i.submittedAt | localDate: 'long' }}</dd>
          <dt>Status</dt>
          <dd>{{ i.status }}</dd>
        </dl>
        <div class="photos">
          @if (i.photoUrls.length === 0) {
            <p class="muted">No photos attached in this mock record.</p>
          } @else {
            @for (url of i.photoUrls; track url) {
              <img [src]="url" alt="inspection photo" />
            }
          }
        </div>
        <div class="actions">
          <m-button variant="primary" (click)="pass()">Pass</m-button>
          <m-button variant="danger" (click)="flag()">Flag</m-button>
        </div>
      </m-card>
    } @else {
      <p>Inspection not found.</p>
    }
  `,
  styles: [
    `
      .photos {
        display: flex;
        flex-wrap: wrap;
        gap: var(--m-space-2);
        margin: var(--m-space-4) 0;
      }
      .photos img {
        width: 120px;
        height: 90px;
        object-fit: cover;
        border-radius: var(--m-radius-sm);
      }
      .muted {
        color: var(--m-color-text-muted);
      }
      .actions {
        display: flex;
        gap: var(--m-space-2);
      }
    `,
  ],
})
export class InspectionReviewComponent {
  readonly id = input.required<string>();
  private readonly data = inject(AdminDataService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly inspection = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.data.getInspection(id))),
  );

  pass(): void {
    this.toast.success('Inspection passed.');
    this.router.navigate(['/inspections']);
  }

  async flag(): Promise<void> {
    const ok = await this.confirmation.confirm('Flag this inspection and open an incident?', {
      title: 'Flag inspection',
      confirmLabel: 'Flag',
      danger: true,
    });
    if (ok) {
      this.toast.success('Inspection flagged; incident created (stub).');
      this.router.navigate(['/incidents']);
    }
  }
}
