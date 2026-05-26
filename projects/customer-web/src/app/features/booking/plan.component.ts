import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddressInputComponent, ButtonComponent } from '@matador/shared';
import { BookingFlowService } from './booking-flow.service';

@Component({
  selector: 'customer-plan',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AddressInputComponent, ButtonComponent],
  template: `
    <div class="page">
      <h1>Plan your trip</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="field">
          <span>Start</span>
          <m-address-input formControlName="startAddress" placeholder="Pickup address" />
        </div>
        <div class="field">
          <span>End</span>
          <m-address-input formControlName="endAddress" placeholder="Drop-off address" />
        </div>
        <div class="quick">
          <button type="button" class="chip" (click)="setEndZone(true)">Home (in zone)</button>
          <button type="button" class="chip" (click)="setEndZone(false)">
            Beach house (out of zone)
          </button>
        </div>
        @if (!endInZone()) {
          <p class="warn">
            The end destination is outside the Matador Zone and will result in additional trip fees
          </p>
        }
        <div class="row">
          <label><span>From</span><input type="datetime-local" formControlName="fromAt" /></label>
          <label><span>Until</span><input type="datetime-local" formControlName="untilAt" /></label>
        </div>
        <m-button type="submit" variant="primary" [block]="true">Continue</m-button>
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
        gap: var(--m-space-4);
      }
      label,
      .field {
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
      input[type='datetime-local'] {
        height: 44px;
        padding: 0 var(--m-space-3);
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-md);
        font: inherit;
      }
      .quick {
        display: flex;
        gap: var(--m-space-2);
      }
      .chip {
        border: 1px solid var(--m-color-border);
        background: var(--m-color-surface);
        border-radius: var(--m-radius-pill);
        padding: var(--m-space-1) var(--m-space-3);
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
      }
      .warn {
        color: var(--m-color-danger);
        font-size: 0.8125rem;
        margin: 0;
      }
    `,
  ],
})
export class PlanComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly flow = inject(BookingFlowService);

  readonly endInZone = signal(true);

  readonly form = this.fb.nonNullable.group({
    startAddress: this.fb.control<{ label: string } | null>(null, Validators.required),
    endAddress: this.fb.control<{ label: string } | null>(null, Validators.required),
    fromAt: ['', Validators.required],
    untilAt: ['', Validators.required],
  });

  setEndZone(inZone: boolean): void {
    this.endInZone.set(inZone);
    this.form.controls.endAddress.setValue({
      label: inZone ? 'Home, Raleigh NC' : 'Beach House, Wilmington NC',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.flow.plan.set({
      startAddress: v.startAddress?.label ?? '',
      endAddress: v.endAddress?.label ?? '',
      endInZone: this.endInZone(),
      fromAt: v.fromAt,
      untilAt: v.untilAt,
    });
    this.router.navigate(['/booking/select-car']);
  }
}
