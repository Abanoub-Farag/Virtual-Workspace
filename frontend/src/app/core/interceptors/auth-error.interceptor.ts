import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Global auth-error interceptor.
 *
 * Catches 401 Unauthorized responses on **authenticated** requests (i.e. those
 * that carried a Bearer token).  On detection it:
 *   1. Clears all stored auth state via AuthService.
 *   2. Redirects to /login, preserving the current path as ?redirect=<path>
 *      so the user can be sent back after a fresh login.
 *
 * Auth endpoints (login / register) intentionally do NOT attach a token, so a
 * 401 from them falls through to the component-level error handler unchanged —
 * avoiding a redirect loop on bad credentials.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        req.headers.has('Authorization') // only act on authenticated requests
      ) {
        // 1. Wipe the stored token / session state
        authService.clearToken();

        // 2. Build redirect URL, preserving the current path
        const currentPath = router.url;
        const loginUrl =
          currentPath && currentPath !== '/login'
            ? `/login?redirect=${encodeURIComponent(currentPath)}`
            : '/login';

        // 3. Navigate imperatively (replaceUrl avoids a broken back-stack entry)
        router.navigateByUrl(loginUrl, { replaceUrl: true });
      }

      // Re-throw so individual components/services can still handle other errors
      return throwError(() => err);
    }),
  );
};
