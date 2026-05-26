import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'matador.installDismissedAt';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Captures the browser install prompt and exposes whether a custom banner should show. */
@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  private deferred: BeforeInstallPromptEvent | null = null;
  readonly canInstall = signal(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferred = e as BeforeInstallPromptEvent;
      if (!this.recentlyDismissed()) {
        this.canInstall.set(true);
      }
    });
  }

  async install(): Promise<void> {
    if (!this.deferred) {
      return;
    }
    await this.deferred.prompt();
    await this.deferred.userChoice;
    this.deferred = null;
    this.canInstall.set(false);
  }

  dismiss(): void {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    this.canInstall.set(false);
  }

  private recentlyDismissed(): boolean {
    const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return at > 0 && Date.now() - at < THIRTY_DAYS_MS;
  }
}
