import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'customer-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="profile">
      <h1>Profile</h1>
      <ul>
        <li>Personal Information</li>
        <li>Verification Status</li>
        <li>Saved Addresses</li>
        <li>Payment Methods</li>
        <li>Help &amp; Support</li>
      </ul>
    </section>
  `,
  styles: [
    `
      .profile {
        padding: var(--m-space-6);
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        padding: var(--m-space-3) 0;
        border-bottom: 1px solid var(--m-color-border);
      }
    `,
  ],
})
export class ProfileComponent {}
