import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Ensures cookies are sent with API requests (required for the admin app's
 * session-cookie auth). Harmless for the customer app's bearer-token auth.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
