import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  message: string;
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly pending = signal<PendingConfirm | null>(null);

  confirm(message: string, opts: ConfirmOptions = {}): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.pending.set({ message, ...opts, resolve });
    });
  }

  respond(result: boolean): void {
    const current = this.pending();
    if (current) {
      current.resolve(result);
      this.pending.set(null);
    }
  }
}
