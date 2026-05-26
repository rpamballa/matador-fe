import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmationService } from '../../services/confirmation.service';
import { ButtonComponent } from '../button/button.component';

/** Host for the global confirmation dialog. Place one instance in each app shell. */
@Component({
  selector: 'm-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    @let req = confirmation.pending();
    @if (req) {
      <div
        class="backdrop"
        tabindex="0"
        (click)="onBackdrop($event)"
        (keydown.escape)="confirmation.respond(false)"
      >
        <div class="dialog" role="dialog" aria-modal="true">
          @if (req.title) {
            <h2>{{ req.title }}</h2>
          }
          <p>{{ req.message }}</p>
          <div class="actions">
            <m-button variant="secondary" (click)="confirmation.respond(false)">
              {{ req.cancelLabel ?? 'Cancel' }}
            </m-button>
            <m-button
              [variant]="req.danger ? 'danger' : 'primary'"
              (click)="confirmation.respond(true)"
            >
              {{ req.confirmLabel ?? 'Confirm' }}
            </m-button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
      }
      .dialog {
        background: var(--m-color-surface);
        border-radius: var(--m-radius-lg);
        padding: var(--m-space-6);
        max-width: 360px;
        width: 90vw;
        box-shadow: var(--m-shadow-md);
      }
      h2 {
        margin: 0 0 var(--m-space-2);
        font-size: 1.125rem;
      }
      p {
        margin: 0 0 var(--m-space-5);
        color: var(--m-color-text-secondary);
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--m-space-2);
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly confirmation = inject(ConfirmationService);

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.confirmation.respond(false);
    }
  }
}
