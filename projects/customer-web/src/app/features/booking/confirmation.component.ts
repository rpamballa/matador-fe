import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@matador/shared';

@Component({
  selector: 'customer-confirmation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="page">
      <div class="check">✓</div>
      <h1>You're all set!</h1>
      <p>
        Booking <strong>{{ bookingId() }}</strong> is confirmed.
      </p>
      <p class="eta">Your vehicle will be delivered in about 30 minutes.</p>
      <a routerLink="/home"><m-button variant="primary" [block]="true">Back to home</m-button></a>
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
      .check {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: var(--m-color-success);
        color: #fff;
        font-size: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      h1 {
        margin: 0;
      }
      .eta {
        color: var(--m-color-text-secondary);
      }
      a {
        width: 100%;
        text-decoration: none;
        margin-top: var(--m-space-4);
      }
    `,
  ],
})
export class ConfirmationComponent {
  readonly bookingId = input.required<string>();
}
