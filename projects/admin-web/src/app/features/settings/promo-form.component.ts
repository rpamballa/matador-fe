import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';

@Component({
  selector: 'admin-promo-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <h1 class="page-title">{{ id() ? 'Edit promo code' : 'New promo code' }}</h1>
    <m-card>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>Code<input formControlName="code" /></label>
        <label>Description<input formControlName="description" /></label>
        <label>Percent off<input type="number" formControlName="percentOff" /></label>
        <label>Expires at<input type="date" formControlName="expiresAt" /></label>
        <label class="check"><input type="checkbox" formControlName="active" /> Active</label>
        <m-button type="submit" variant="primary">Save</m-button>
      </form>
    </m-card>
  `,
  styleUrl: './settings-form.scss',
})
export class PromoFormComponent {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    description: [''],
    percentOff: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    expiresAt: [''],
    active: [true],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Promo code saved (stub).');
    this.router.navigate(['/settings/promos']);
  }
}
