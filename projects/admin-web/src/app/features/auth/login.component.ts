import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, ToastService } from '@matador/shared';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'admin-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="login">
      <h1>Matador Admin</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Email
          <input type="email" formControlName="email" autocomplete="username" />
        </label>
        <label>
          Password
          <input type="password" formControlName="password" autocomplete="current-password" />
        </label>
        <m-button type="submit" variant="primary" [block]="true" [disabled]="submitting()">
          Sign in
        </m-button>
      </form>
    </div>
  `,
  styles: [
    `
      .login {
        max-width: 320px;
        margin: 10vh auto;
      }
      h1 {
        text-align: center;
        margin-bottom: var(--m-space-6);
      }
      form {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-4);
      }
      label {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-1);
        font-size: 0.8125rem;
        color: var(--m-color-text-secondary);
      }
      input {
        height: 40px;
        padding: 0 var(--m-space-3);
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-md);
        font: inherit;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.toast.error('Invalid email or password.');
        this.submitting.set(false);
      },
    });
  }
}
