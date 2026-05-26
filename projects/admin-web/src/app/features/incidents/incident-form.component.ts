import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, ToastService } from '@matador/shared';

@Component({
  selector: 'admin-incident-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  template: `
    <h1 class="page-title">New incident</h1>
    <m-card>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Type
          <select formControlName="type">
            <option value="DAMAGE">Damage</option>
            <option value="ACCIDENT">Accident</option>
            <option value="LATE_RETURN">Late return</option>
            <option value="OUT_OF_ZONE">Out of zone</option>
            <option value="TICKET">Ticket</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label>
          Severity
          <select formControlName="severity">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>
        <label>Description<textarea formControlName="description" rows="4"></textarea></label>
        <m-button type="submit" variant="primary">Create</m-button>
      </form>
    </m-card>
  `,
  styleUrl: '../settings/settings-form.scss',
  styles: [
    `
      textarea {
        padding: var(--m-space-2);
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-sm);
        font: inherit;
      }
    `,
  ],
})
export class IncidentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    type: ['DAMAGE', Validators.required],
    severity: ['MEDIUM', Validators.required],
    description: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Incident created (stub).');
    this.router.navigate(['/incidents']);
  }
}
