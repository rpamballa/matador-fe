import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { isProblemDetail } from '../models/problem-detail';

/**
 * Translates RFC 7807 ProblemDetail responses into user-friendly toasts.
 * - 401/403/422 are passed through for callers/guards to handle specifically.
 * - 5xx and network errors surface a toast.
 * The error is always re-thrown so feature code can react too.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const handledByCaller = err.status === 401 || err.status === 403 || err.status === 422;
      if (!handledByCaller) {
        const problem = err.error;
        const message =
          isProblemDetail(problem) && problem.detail
            ? problem.detail
            : err.status === 0
              ? 'Network error — please check your connection.'
              : 'Something went wrong. Please try again.';
        toast.error(message);
      }
      return throwError(() => err);
    }),
  );
};
