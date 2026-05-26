import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, ToastService } from '@matador/shared';

const ANGLES = [
  'Front of Car',
  'Back',
  'Right Side',
  'Left Side',
  'Interior Front',
  'Interior Rear',
  'Odometer',
] as const;

@Component({
  selector: 'customer-inspection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="page">
      <h1>Car Conditions</h1>
      @if (allCaptured()) {
        <p class="ready">Photo requirements are complete. You're ready to start the trip!</p>
      }
      <div class="angles">
        @for (angle of angles; track angle) {
          <div class="angle">
            <div class="head">
              <span>{{ angle }}</span>
              @if (photos()[angle]) {
                <span class="check">✓</span>
              }
            </div>
            @if (photos()[angle]) {
              <img [src]="photos()[angle]" alt="{{ angle }}" />
            }
            <label class="upload">
              {{ photos()[angle] ? 'Retake' : 'Upload or take a photo' }}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                (change)="capture(angle, $event)"
                hidden
              />
            </label>
          </div>
        }
      </div>
      <m-button variant="primary" [block]="true" [disabled]="!allCaptured()" (click)="proceed()">
        Proceed
      </m-button>
    </div>
  `,
  styles: [
    `
      .page {
        padding: calc(var(--m-safe-top) + var(--m-space-6)) var(--m-space-4) var(--m-space-8);
        display: flex;
        flex-direction: column;
        gap: var(--m-space-4);
      }
      h1 {
        margin: 0;
      }
      .ready {
        color: var(--m-color-success);
        font-weight: 600;
        margin: 0;
      }
      .angles {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
      }
      .angle {
        border: 1px solid var(--m-color-border);
        border-radius: var(--m-radius-md);
        padding: var(--m-space-3);
      }
      .head {
        display: flex;
        justify-content: space-between;
        font-weight: 600;
      }
      .check {
        color: var(--m-color-success);
      }
      img {
        width: 100%;
        max-height: 160px;
        object-fit: cover;
        border-radius: var(--m-radius-sm);
        margin: var(--m-space-2) 0;
      }
      .upload {
        display: inline-block;
        margin-top: var(--m-space-2);
        color: var(--m-color-primary);
        font-weight: 600;
        cursor: pointer;
      }
    `,
  ],
})
export class InspectionComponent {
  readonly tripId = input.required<string>();
  readonly phase = input.required<string>();

  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly angles = ANGLES;
  readonly photos = signal<Record<string, string>>({});
  readonly allCaptured = computed(() => this.angles.every((a) => !!this.photos()[a]));

  capture(angle: string, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.photos.update((p) => ({ ...p, [angle]: reader.result as string }));
    reader.readAsDataURL(file);
  }

  proceed(): void {
    // Stub: a real implementation uploads each photo via presigned URL then
    // submits the inspection with odometer/fuel readings.
    this.toast.success('Inspection submitted.');
    this.router.navigate(['/home']);
  }
}
