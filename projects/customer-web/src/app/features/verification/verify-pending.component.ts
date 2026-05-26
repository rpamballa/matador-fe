import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, ToastService } from '@matador/shared';

@Component({
  selector: 'customer-verify-pending',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="page">
      <div class="spinner">⏳</div>
      <h1>Verification in progress</h1>
      <p>We'll notify you when it's complete. This usually takes a few minutes.</p>
      <m-button variant="primary" [block]="true" (click)="check()">Check status</m-button>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 15vh var(--m-space-6);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--m-space-3);
      }
      .spinner {
        font-size: 2.5rem;
      }
      h1 {
        margin: 0;
      }
      p {
        color: var(--m-color-text-secondary);
      }
      m-button {
        width: 100%;
        margin-top: var(--m-space-4);
      }
    `,
  ],
})
export class VerifyPendingComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  check(): void {
    // Stub: polls GET /api/customer/me/verification. Here we assume success.
    this.toast.success('You are verified!');
    this.router.navigate(['/home']);
  }
}
