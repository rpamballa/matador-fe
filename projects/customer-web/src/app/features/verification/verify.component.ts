import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';

@Component({
  selector: 'customer-verify',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
  template: `
    <div class="page">
      <h1>Verify your identity</h1>
      <m-card>
        <p>To book a trip we need to confirm your driver's license and a selfie.</p>
        <ul>
          <li>Have your driver's license ready</li>
          <li>Make sure you're in a well-lit area</li>
        </ul>
      </m-card>
      <m-button variant="primary" [block]="true" (click)="start()">Start verification</m-button>
    </div>
  `,
  styles: [
    `
      .page {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
        display: flex;
        flex-direction: column;
        gap: var(--m-space-4);
      }
      h1 {
        margin: 0;
      }
      ul {
        margin: var(--m-space-2) 0 0;
        padding-left: var(--m-space-5);
        color: var(--m-color-text-secondary);
      }
    `,
  ],
})
export class VerifyComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  start(): void {
    // Stub: a real implementation starts a Stripe Identity session and launches its modal.
    this.toast.show('Verification started.', 'info');
    this.router.navigate(['/verify/pending']);
  }
}
