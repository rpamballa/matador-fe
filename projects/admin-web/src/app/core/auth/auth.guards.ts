import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StaffRole } from '@matador/shared';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};

/** Restricts a route to the given staff roles, e.g. roleGuard('ADMIN'). */
export function roleGuard(...roles: StaffRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }
    return auth.hasRole(...roles) ? true : router.createUrlTree(['/dashboard']);
  };
}
