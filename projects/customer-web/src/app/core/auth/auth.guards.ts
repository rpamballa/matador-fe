import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/sign-in']);
};

/** Booking requires a verified customer; redirect to verification otherwise. */
export const verifiedGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/sign-in']);
  }
  const status = auth.verificationStatus();
  return status === 'VERIFIED' ? true : router.createUrlTree(['/verify']);
};
