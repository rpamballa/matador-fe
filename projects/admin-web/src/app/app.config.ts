import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  credentialsInterceptor,
  errorInterceptor,
  loadingInterceptor,
  provideApiConfiguration,
} from '@matador/shared';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, loadingInterceptor, errorInterceptor]),
    ),
    provideAnimationsAsync(),
    provideApiConfiguration(`${environment.apiBase}/api/v1`),
  ],
};
