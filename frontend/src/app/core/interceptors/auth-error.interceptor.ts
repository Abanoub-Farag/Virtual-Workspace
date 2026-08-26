import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError, switchMap, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

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

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
          switchMap((token) => {
            isRefreshing = false;
            refreshTokenSubject.next(token);
            
            const authReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            return next(authReq);
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            authService.clearToken();
            const currentPath = router.url;
            const loginUrl = currentPath && currentPath !== '/login'
              ? `/login?redirect=${encodeURIComponent(currentPath)}`
              : '/login';
            router.navigateByUrl(loginUrl, { replaceUrl: true });
            return throwError(() => refreshErr);
          })
        );
      } else {
        return refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => {
            const authReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            return next(authReq);
          })
        );
      }
    }),
  );
};
