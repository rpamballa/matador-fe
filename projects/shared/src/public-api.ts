/*
 * Public API Surface of @matador/shared
 *
 * Everything intended for app use is re-exported here. Apps import from
 * '@matador/shared' only — never from 'projects/shared/src/lib/...' directly.
 */

// Generated API client (from the backend openapi.json — do not hand-edit the
// api-client folder; regenerate with `npm run api:generate`). This re-exports
// the Api helper service, request functions (per operationId), and DTO models
// (Request/Response suffixed, so no collision with the domain view-models below).
export * from './lib/api-client';
export { provideApiConfiguration } from './lib/api-client/api-configuration';

// Models
export * from './lib/models/money';
export * from './lib/models/geo';
export * from './lib/models/address';
export * from './lib/models/problem-detail';
export * from './lib/models/domain';

// Auth
export * from './lib/auth/roles';

// Pipes
export * from './lib/pipes/money.pipe';
export * from './lib/pipes/local-date.pipe';
export * from './lib/pipes/duration.pipe';
export * from './lib/pipes/distance.pipe';

// HTTP interceptors
export * from './lib/http/credentials.interceptor';
export * from './lib/http/loading.interceptor';
export * from './lib/http/error.interceptor';

// Services
export * from './lib/services/toast.service';
export * from './lib/services/toast-host.component';
export * from './lib/services/loading.service';
export * from './lib/services/confirmation.service';

// UI primitives
export * from './lib/ui/button/button.component';
export * from './lib/ui/card/card.component';
export * from './lib/ui/badge/badge.component';
export * from './lib/ui/empty-state/empty-state.component';
export * from './lib/ui/map/map.component';
export * from './lib/ui/address-input/address-input.component';
export * from './lib/ui/confirm-dialog/confirm-dialog.component';
