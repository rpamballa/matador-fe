import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ButtonComponent, ToastService } from '@matador/shared';

@Component({
  selector: 'customer-lock-unlock',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <div class="page">
      <h1>Lock / Unlock</h1>
      <p class="status">
        Doors are currently <strong>{{ locked() ? 'locked' : 'unlocked' }}</strong
        >.
      </p>
      <div class="buttons">
        <m-button variant="primary" [block]="true" (click)="set(true)">Lock</m-button>
        <m-button variant="secondary" [block]="true" (click)="set(false)">Unlock</m-button>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        padding: calc(var(--m-safe-top) + var(--m-space-8)) var(--m-space-6);
        text-align: center;
      }
      .status {
        color: var(--m-color-text-secondary);
        margin-bottom: var(--m-space-6);
      }
      .buttons {
        display: flex;
        flex-direction: column;
        gap: var(--m-space-3);
      }
    `,
  ],
})
export class LockUnlockComponent {
  private readonly toast = inject(ToastService);
  readonly locked = signal(true);

  set(locked: boolean): void {
    this.locked.set(locked);
    this.toast.success(locked ? 'Vehicle locked.' : 'Vehicle unlocked.');
  }
}
