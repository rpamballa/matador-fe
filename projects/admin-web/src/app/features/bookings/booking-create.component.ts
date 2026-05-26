import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';
import { AdminDataService } from '../../core/data/admin-data.service';

/** Staff-initiated manual booking creation (simplified multi-step). */
@Component({
  selector: 'admin-booking-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <h1 class="page-title">New booking</h1>
    <m-card>
      <div class="steps">Step {{ step() }} of 3</div>
      <form [formGroup]="form" (ngSubmit)="next()">
        @if (step() === 1) {
          <label>
            Customer
            <select formControlName="customerId">
              @for (c of customersForTemplate(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </label>
        } @else if (step() === 2) {
          <label>
            Vehicle class
            <select formControlName="vehicleClassId">
              @for (vc of classes(); track vc.id) {
                <option [value]="vc.id">{{ vc.name }}</option>
              }
            </select>
          </label>
          <label>Pickup<input type="datetime-local" formControlName="pickupAt" /></label>
          <label>Dropoff<input type="datetime-local" formControlName="dropoffAt" /></label>
        } @else {
          <p>Review and confirm the booking.</p>
        }
        <div class="actions">
          @if (step() > 1) {
            <m-button variant="secondary" type="button" (click)="back()">Back</m-button>
          }
          <m-button type="submit" variant="primary">{{
            step() === 3 ? 'Confirm' : 'Next'
          }}</m-button>
        </div>
      </form>
    </m-card>
  `,
  styleUrl: '../settings/settings-form.scss',
  styles: [
    `
      .steps {
        color: var(--m-color-text-muted);
        font-size: 0.8125rem;
        margin-bottom: var(--m-space-3);
      }
      .actions {
        display: flex;
        gap: var(--m-space-2);
      }
    `,
  ],
})
export class BookingCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(AdminDataService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly step = signal(1);
  private readonly customers = toSignal(this.data.listCustomers(), { initialValue: null });
  readonly classes = toSignal(this.data.listVehicleClasses(), { initialValue: [] });
  readonly customersForTemplate = computed(() => this.customers()?.items ?? []);

  readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    vehicleClassId: ['', Validators.required],
    pickupAt: ['', Validators.required],
    dropoffAt: ['', Validators.required],
  });

  next(): void {
    if (this.step() < 3) {
      this.step.update((s) => s + 1);
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.step.set(1);
      return;
    }
    this.toast.success('Booking created (stub).');
    this.router.navigate(['/bookings']);
  }

  back(): void {
    this.step.update((s) => Math.max(1, s - 1));
  }
}
