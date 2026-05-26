import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, ToastService } from '@matador/shared';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'customer-sign-in',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  template: `
    <div class="page">
      <h1>Welcome back</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input type="email" formControlName="email" placeholder="Email" autocomplete="username" />
        <input
          type="password"
          formControlName="password"
          placeholder="Password"
          autocomplete="current-password"
        />
        <m-button type="submit" variant="primary" [block]="true" [disabled]="submitting()">
          Sign in
        </m-button>
      </form>
      <a routerLink="/auth/sign-up" class="alt">Create an account</a>
    </div>
  `,
  styleUrl: './onboarding.scss',
})
export class SignInComponent {
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
      next: () => this.router.navigate(['/home']),
      error: () => {
        this.toast.error('Invalid email or password.');
        this.submitting.set(false);
      },
    });
  }
}
