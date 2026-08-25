import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      const isUnauthenticated = err instanceof HttpErrorResponse &&
        err.status === 401 &&
        req.headers.has('Authorization');

      if (!isUnauthenticated) {
        return throwError(() => err);
      }

      authService.clearToken();

      const currentPath = router.url;
      const loginUrl = currentPath && currentPath !== '/login'
        ? `/login?redirect=${encodeURIComponent(currentPath)}`
        : '/login';

      router.navigateByUrl(loginUrl, { replaceUrl: true });
      return EMPTY;
    }),
  );
};
