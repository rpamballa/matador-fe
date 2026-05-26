import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'm-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-host">
      @for (toast of toastService.toasts(); track toast.id) {
        <button
          type="button"
          class="toast"
          [attr.data-kind]="toast.kind"
          (click)="toastService.dismiss(toast.id)"
        >
          {{ toast.message }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .toast-host {
        position: fixed;
        bottom: calc(var(--m-safe-bottom) + var(--m-space-4));
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        gap: var(--m-space-2);
        z-index: 1000;
        pointer-events: none;
      }
      .toast {
        pointer-events: auto;
        min-width: 240px;
        max-width: 90vw;
        padding: var(--m-space-3) var(--m-space-4);
        border: none;
        border-radius: var(--m-radius-md);
        color: #fff;
        font: inherit;
        font-size: 0.875rem;
        text-align: left;
        box-shadow: var(--m-shadow-md);
        cursor: pointer;
      }
      .toast[data-kind='success'] {
        background: var(--m-color-success);
      }
      .toast[data-kind='error'] {
        background: var(--m-color-danger);
      }
      .toast[data-kind='info'] {
        background: var(--m-color-text-primary);
      }
    `,
  ],
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);
}
