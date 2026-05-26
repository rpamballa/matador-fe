import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  LocalDatePipe,
  ToastService,
} from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-incident-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, ButtonComponent, LocalDatePipe],
  template: `
    @if (incident(); as i) {
      <h1 class="page-title">{{ i.type }} incident</h1>
      <m-card>
        <dl class="detail-grid">
          <dt>Severity</dt>
          <dd>
            <m-badge tone="warning">{{ i.severity }}</m-badge>
          </dd>
          <dt>Status</dt>
          <dd>
            <m-badge tone="info">{{ i.status }}</m-badge>
          </dd>
          <dt>Description</dt>
          <dd>{{ i.description }}</dd>
          <dt>Reported</dt>
          <dd>{{ i.reportedAt | localDate: 'long' }}</dd>
        </dl>
        <div class="actions">
          <m-button variant="primary" (click)="act('resolved')">Resolve</m-button>
          <m-button variant="secondary" (click)="act('charged the customer')"
            >Charge customer</m-button
          >
          <m-button variant="ghost" (click)="act('dismissed')">Dismiss</m-button>
        </div>
      </m-card>
    } @else {
      <p>Incident not found.</p>
    }
  `,
  styles: [
    `
      .actions {
        display: flex;
        gap: var(--m-space-2);
        margin-top: var(--m-space-5);
        flex-wrap: wrap;
      }
    `,
  ],
})
export class IncidentDetailComponent {
  readonly id = input.required<string>();
  private readonly data = inject(AdminDataService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly incident = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this.data.getIncident(id))),
  );

  act(what: string): void {
    this.toast.success(`Incident ${what} (stub).`);
    this.router.navigate(['/incidents']);
  }
}
