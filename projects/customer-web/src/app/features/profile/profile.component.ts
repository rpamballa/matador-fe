import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'customer-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="profile">
      <h1>Profile</h1>
      @if (user(); as u) {
        <div class="identity">
          <strong>{{ u.firstName }}</strong>
          <span>{{ u.email }}</span>
        </div>
      }
      <ul>
        <li><a routerLink="/profile/personal">Personal Information</a></li>
        <li><a routerLink="/profile/verification">Verification Status</a></li>
        <li><a routerLink="/profile/addresses">Saved Addresses</a></li>
        <li><a routerLink="/profile/payment-methods">Payment Methods</a></li>
        <li><a routerLink="/support">Help &amp; Support</a></li>
      </ul>
      <button type="button" class="logout" (click)="logout()">Log Out</button>
    </section>
  `,
  styles: [
    `
      .profile {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
      }
      h1 {
        margin: 0 0 var(--m-space-4);
      }
      .identity {
        display: flex;
        flex-direction: column;
        margin-bottom: var(--m-space-5);
      }
      .identity span {
        color: var(--m-color-text-secondary);
        font-size: 0.875rem;
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      li a {
        display: block;
        padding: var(--m-space-3) 0;
        border-bottom: 1px solid var(--m-color-border);
        color: var(--m-color-text-primary);
        text-decoration: none;
      }
      .logout {
        margin-top: var(--m-space-6);
        border: none;
        background: none;
        color: var(--m-color-danger);
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }
    `,
  ],
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly user = this.auth.currentUser;

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/welcome']),
      error: () => this.router.navigate(['/welcome']),
    });
  }
}
