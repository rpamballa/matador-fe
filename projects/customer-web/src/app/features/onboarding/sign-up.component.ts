import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent, ToastService } from '@matador/shared';
import { AuthService } from '../../core/auth/auth.service';

function minimumAge(years: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const dob = new Date(control.value);
    const threshold = new Date();
    threshold.setFullYear(threshold.getFullYear() - years);
    return dob <= threshold ? null : { minimumAge: { required: years } };
  };
}

@Component({
  selector: 'customer-sign-up',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
  template: `
    <div class="page">
      <h1>Create your account</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="firstName" placeholder="First name" autocomplete="given-name" />
        <input formControlName="lastName" placeholder="Last name" autocomplete="family-name" />
        <label class="field">
          <span>Date of birth (must be 21+)</span>
          <input type="date" formControlName="dateOfBirth" />
        </label>
        @if (form.controls.dateOfBirth.touched && form.controls.dateOfBirth.errors?.['minimumAge']) {
          <small class="error">You must be at least 21 years old.</small>
        }
        <input type="email" formControlName="email" placeholder="Email" autocomplete="email" />
        <input formControlName="phone" placeholder="Phone" autocomplete="tel" />
        <input
          type="password"
          formControlName="password"
          placeholder="Password"
          autocomplete="new-password"
        />
        <label class="terms">
          <input type="checkbox" formControlName="acceptedTerms" />
          <span>I accept the Terms of Service and Privacy Policy</span>
        </label>
        <m-button type="submit" variant="primary" [block]="true" [disabled]="submitting()">
          Create account
        </m-button>
      </form>
      <a routerLink="/auth/sign-in" class="alt">I already have an account</a>
    </div>
  `,
  styleUrl: './onboarding.scss',
  styles: [
    `
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-1);
        font-size: 0.8125rem;
        color: var(--m-color-text-secondary);
      }
      .terms {
        display: flex;
        gap: var(--m-space-2);
        align-items: flex-start;
        font-size: 0.8125rem;
        color: var(--m-color-text-secondary);
      }
      .error {
        color: var(--m-color-danger);
      }
    `,
  ],
})
export class SignUpComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: ['', [Validators.required, minimumAge(21)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    acceptedTerms: [false, Validators.requiredTrue],
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const { firstName, lastName, dateOfBirth, email, phone, password } = this.form.getRawValue();
    this.auth
      .register({ firstName, lastName, dateOfBirth, email, phone, password })
      .subscribe({
        next: () => this.router.navigate(['/verify']),
        error: () => {
          this.toast.error('Could not create your account. Please try again.');
          this.submitting.set(false);
        },
      });
  }
}
