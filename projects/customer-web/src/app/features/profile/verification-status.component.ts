import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent, BadgeTone, ButtonComponent, CardComponent } from '@matador/shared';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'customer-verification-status',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <div class="page">
      <h1>Verification Status</h1>
      <m-card>
        <div class="status">
          <span>Status</span>
          <m-badge [tone]="tone()">{{ status() }}</m-badge>
        </div>
      </m-card>
      @if (status() !== 'VERIFIED') {
        <a routerLink="/verify"><m-button variant="primary" [block]="true">Verify now</m-button></a>
      }
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
      .status {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      a {
        text-decoration: none;
      }
    `,
  ],
})
export class VerificationStatusComponent {
  private readonly auth = inject(AuthService);
  readonly status = computed(() => this.auth.verificationStatus() ?? 'UNVERIFIED');

  tone(): BadgeTone {
    switch (this.status()) {
      case 'VERIFIED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  }
}
