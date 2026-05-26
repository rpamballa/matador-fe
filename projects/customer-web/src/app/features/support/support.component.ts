import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '@matador/shared';

@Component({
  selector: 'customer-support',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <div class="page">
      <h1>Help &amp; Support</h1>
      <a href="mailto:support@matador.com"><m-card>📧 Email us</m-card></a>
      <a href="tel:+19195550100"><m-card>📞 Call us</m-card></a>
      <m-card>
        <h2>FAQ</h2>
        <details>
          <summary>How is my car delivered?</summary>
          <p>A Matador driver brings the vehicle to your pickup address at your scheduled time.</p>
        </details>
        <details>
          <summary>What if I return outside the zone?</summary>
          <p>Out-of-zone drop-offs incur an additional fee shown before you confirm.</p>
        </details>
      </m-card>
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
        margin: 0 0 var(--m-space-2);
      }
      h2 {
        margin: 0 0 var(--m-space-2);
        font-size: 1rem;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
      details {
        padding: var(--m-space-2) 0;
        border-top: 1px solid var(--m-color-border);
      }
      summary {
        cursor: pointer;
        font-weight: 600;
      }
      details p {
        color: var(--m-color-text-secondary);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class SupportComponent {}
