import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiResponse, AuthData, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  /** Base URL – proxy is configured in angular.json (dev) or via env. */
  private readonly baseUrl = `${environment.apiUrl}/api/v1/auth`;

  /** Token key used in localStorage. */
  private readonly TOKEN_KEY = 'pcenter_access_token';

  // ─── Register ──────────────────────────────────────────────────────────────

  register(payload: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}/register`, payload)
      .pipe(
        tap((res) => {
          if (res.data?.token) {
            this.persistToken(res.data.token);
          }
        }),
        catchError(this.handleError),
      );
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  login(payload: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap((res) => {
          if (res.data?.token) {
            this.persistToken(res.data.token);
          }
        }),
        catchError(this.handleError),
      );
  }

  // ─── Token helpers ─────────────────────────────────────────────────────────

  persistToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ─── Error handler ─────────────────────────────────────────────────────────

  private handleError(err: HttpErrorResponse): Observable<never> {
    if (err.status === 0) {
      // Network / CORS error
      return throwError(() => ({
        message: 'Unable to reach the server. Please check your connection.',
        errors: {} as Record<string, string>,
      }));
    }

    // Backend responded with a structured ApiResponse error body
    const body = err.error as Partial<ApiResponse<unknown>>;
    return throwError(() => ({
      message: body?.message ?? 'An unexpected error occurred.',
      errors: body?.errors ?? ({} as Record<string, string>),
    }));
  }
}
