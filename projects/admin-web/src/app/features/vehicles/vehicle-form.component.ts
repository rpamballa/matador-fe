import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-vehicle-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <h1 class="page-title">{{ id() ? 'Edit vehicle' : 'Add vehicle' }}</h1>
    <m-card>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>VIN<input formControlName="vin" /></label>
        <label>License plate<input formControlName="licensePlate" /></label>
        <div class="row">
          <label>Make<input formControlName="make" /></label>
          <label>Model<input formControlName="model" /></label>
          <label>Year<input type="number" formControlName="year" /></label>
        </div>
        <label>
          Vehicle class
          <select formControlName="classId">
            @for (c of classes(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </label>
        <label>
          Status
          <select formControlName="status">
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of service</option>
          </select>
        </label>
        <m-button type="submit" variant="primary">Save</m-button>
      </form>
    </m-card>
  `,
  styleUrl: '../settings/settings-form.scss',
  styles: [
    `
      .row {
        display: flex;
        gap: var(--m-space-3);
      }
      .row label {
        flex: 1;
      }
    `,
  ],
})
export class VehicleFormComponent {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(AdminDataService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly classes = toSignal(this.data.listVehicleClasses(), { initialValue: [] });

  readonly form = this.fb.nonNullable.group({
    vin: ['', Validators.required],
    licensePlate: ['', Validators.required],
    make: ['', Validators.required],
    model: ['', Validators.required],
    year: [2025, [Validators.required, Validators.min(1990)]],
    classId: ['', Validators.required],
    status: ['AVAILABLE', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Vehicle saved (stub).');
    this.router.navigate(['/vehicles']);
  }
}
