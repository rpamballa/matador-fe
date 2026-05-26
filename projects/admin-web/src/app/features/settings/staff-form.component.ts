import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';

@Component({
  selector: 'admin-staff-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <h1 class="page-title">{{ id() ? 'Edit staff member' : 'Invite staff' }}</h1>
    <m-card>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Name<input formControlName="name" /></label>
        <label>Email<input type="email" formControlName="email" /></label>
        <label>
          Role
          <select formControlName="role">
            <option value="ADMIN">Admin</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="SUPPORT">Support</option>
            <option value="READONLY">Read-only</option>
          </select>
        </label>
        <label class="check"><input type="checkbox" formControlName="active" /> Active</label>
        <m-button type="submit" variant="primary">{{ id() ? 'Save' : 'Send invite' }}</m-button>
      </form>
    </m-card>
  `,
  styleUrl: './settings-form.scss',
})
export class StaffFormComponent {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['SUPPORT', Validators.required],
    active: [true],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success(this.id() ? 'Staff updated (stub).' : 'Invite sent (stub).');
    this.router.navigate(['/settings/staff']);
  }
}
