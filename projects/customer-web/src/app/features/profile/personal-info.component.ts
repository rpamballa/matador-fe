import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, ToastService } from '@matador/shared';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'customer-personal-info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="page">
      <h1>Personal Information</h1>
      <form [formGroup]="form" (ngSubmit)="save()">
        <label>First name<input formControlName="firstName" /></label>
        <label>Phone<input formControlName="phone" /></label>
        <label>Email<input formControlName="email" readonly /></label>
        <m-button type="submit" variant="primary" [block]="true">Save</m-button>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
      }
      h1 {
        margin: 0 0 var(--m-space-5);
      }
      form {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
      }
      label {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-1);
        font-size: 0.8125rem;
        color: var(--m-color-text-secondary);
      }
      input {
        height: 44px;
        padding: 0 var(--m-space-3);
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-md);
        font: inherit;
      }
      input[readonly] {
        background: var(--m-color-background);
        color: var(--m-color-text-muted);
      }
    `,
  ],
})
export class PersonalInfoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly user = this.auth.currentUser();

  readonly form = this.fb.nonNullable.group({
    firstName: [this.user?.firstName ?? '', Validators.required],
    phone: ['', Validators.required],
    email: [{ value: this.user?.email ?? '', disabled: false }],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Profile updated.');
  }
}
