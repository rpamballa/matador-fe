import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, ConfirmationService, ToastService } from '@matador/shared';

@Component({
  selector: 'customer-end-trip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
  template: `
    <div class="page">
      <h1>End trip</h1>
      <m-card>
        <p>Confirm you've parked the vehicle at your current location.</p>
        <p class="muted">A dropoff photo inspection is required before the trip closes.</p>
      </m-card>
      <m-button variant="primary" [block]="true" (click)="startDropoff()">
        Continue to photo inspection
      </m-button>
      <m-button variant="ghost" [block]="true" (click)="cancel()">Not yet</m-button>
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
      .muted {
        color: var(--m-color-text-secondary);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class EndTripComponent {
  readonly id = input.required<string>();
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);

  startDropoff(): void {
    this.router.navigate(['/inspection', this.id(), 'dropoff']);
  }

  async cancel(): Promise<void> {
    const ok = await this.confirmation.confirm('Leave without ending the trip?', {
      confirmLabel: 'Leave',
    });
    if (ok) {
      this.toast.show('Trip still active.', 'info');
      this.router.navigate(['/home']);
    }
  }
}
