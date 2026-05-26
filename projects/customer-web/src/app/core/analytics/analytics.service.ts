import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Thin PostHog wrapper. No-ops when no key is configured (e.g. local dev).
 * PostHog is imported dynamically so it stays out of the initial bundle.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private posthog?: typeof import('posthog-js').default;
  private ready = false;

  async init(): Promise<void> {
    if (this.ready || !environment.posthogKey) {
      return;
    }
    this.posthog = (await import('posthog-js')).default;
    this.posthog.init(environment.posthogKey, { api_host: 'https://us.i.posthog.com' });
    this.ready = true;
  }

  capture(event: string, properties?: Record<string, unknown>): void {
    this.posthog?.capture(event, properties);
  }

  identify(customerId: string): void {
    this.posthog?.identify(customerId);
  }
}
