import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent, ToastService } from '@matador/shared';

@Component({
  selector: 'customer-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="page">
      <h1>Report an issue</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Type
          <select formControlName="type">
            <option value="DAMAGE">Damage</option>
            <option value="ACCIDENT">Accident</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label>Description<textarea formControlName="description" rows="4"></textarea></label>
        <label class="file">
          Add a photo
          <input type="file" accept="image/*" capture="environment" />
        </label>
        <m-button type="submit" variant="primary" [block]="true">Submit report</m-button>
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
      select,
      textarea {
        padding: var(--m-space-2);
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-md);
        font: inherit;
      }
    `,
  ],
})
export class ReportComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    type: ['DAMAGE', Validators.required],
    description: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.toast.success('Report submitted.');
    this.router.navigate(['/home']);
  }
}
