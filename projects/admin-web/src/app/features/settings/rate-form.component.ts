import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

@Component({
  selector: 'admin-rate-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <h1 class="page-title">New pricing rate</h1>
    <m-card>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Vehicle class
          <select formControlName="vehicleClassId">
            @for (c of classes(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </label>
        <label>Daily rate (USD)<input type="number" formControlName="dailyRate" /></label>
        <label>Effective from<input type="date" formControlName="effectiveFrom" /></label>
        <m-button type="submit" variant="primary">Save</m-button>
      </form>
    </m-card>
  `,
  styleUrl: './settings-form.scss',
})
export class RateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(AdminDataService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly classes = toSignal(this.data.listVehicleClasses(), { initialValue: [] });

  readonly form = this.fb.nonNullable.group({
    vehicleClassId: ['', Validators.required],
    dailyRate: [79, [Validators.required, Validators.min(0)]],
    effectiveFrom: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Pricing rate saved (stub).');
    this.router.navigate(['/settings/rates']);
  }
}
