import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';

/**
 * Create/edit form for a vehicle class. On submit it currently just toasts and
 * navigates back (no persistence) until the backend API is wired up.
 */
@Component({
  selector: 'admin-vehicle-class-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <h1 class="page-title">New vehicle class</h1>
    <m-card>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Name<input formControlName="name" /></label>
        <label>Description<input formControlName="description" /></label>
        <div class="row">
          <label>Seats<input type="number" formControlName="seats" /></label>
          <label>Luggage<input type="number" formControlName="luggage" /></label>
        </div>
        <label>Drivetrain<input formControlName="drivetrain" /></label>
        <label>Base daily rate (USD)<input type="number" formControlName="dailyRate" /></label>
        <label class="check"><input type="checkbox" formControlName="active" /> Active</label>
        <m-button type="submit" variant="primary" [disabled]="submitting()">Save</m-button>
      </form>
    </m-card>
  `,
  styles: [
    `
      form {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
        max-width: 420px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-1);
        font-size: 0.8125rem;
        color: var(--m-color-text-secondary);
      }
      .row {
        display: flex;
        gap: var(--m-space-3);
      }
      .row label {
        flex: 1;
      }
      .check {
        flex-direction: row;
        align-items: center;
        gap: var(--m-space-2);
      }
      input {
        height: 36px;
        padding: 0 var(--m-space-2);
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-sm);
        font: inherit;
      }
    `,
  ],
})
export class VehicleClassFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    seats: [5, [Validators.required, Validators.min(1)]],
    luggage: [2, [Validators.required, Validators.min(0)]],
    drivetrain: ['AWD', Validators.required],
    dailyRate: [79, [Validators.required, Validators.min(0)]],
    active: [true],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Vehicle class saved (stub).');
    this.router.navigate(['/settings/vehicle-classes']);
  }
}
