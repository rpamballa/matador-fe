import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@matador/shared';

@Component({
  selector: 'customer-welcome',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  template: `
    <div class="welcome">
      <div class="hero">
        <h1>Matador</h1>
        <p>Cars, delivered to you.</p>
      </div>
      <div class="actions">
        <a routerLink="/auth/sign-up"><m-button variant="primary" [block]="true">Sign up</m-button></a>
        <a routerLink="/auth/sign-in"
          ><m-button variant="secondary" [block]="true">Sign in</m-button></a
        >
        <a routerLink="/home" class="browse">Just browsing</a>
      </div>
    </div>
  `,
  styles: [
    `
      .welcome {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        padding: var(--m-space-8) var(--m-space-6) calc(var(--m-space-8) + var(--m-safe-bottom));
      }
      .hero {
        margin-top: 20vh;
        text-align: center;
      }
      .hero h1 {
        color: var(--m-color-primary);
        font-size: 2.5rem;
        margin: 0;
      }
      .actions {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
      }
      .actions a {
        text-decoration: none;
      }
      .browse {
        text-align: center;
        color: var(--m-color-text-secondary);
        padding: var(--m-space-2);
      }
    `,
  ],
})
export class WelcomeComponent {}
