import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiResponse, AuthData, LoginRequest, RegisterRequest } from '../models/auth.models';
import { environment } from '../../../environments/environment';

// ─── Auth Error ───────────────────────────────────────────────────────────────

export interface AuthError {
  message: string;
  /**
   * Field-level validation messages keyed by field name.
   * Used to drive inline form errors on the relevant controls.
   */
  fieldErrors: Record<string, string>;
  /** HTTP status code — lets the caller take status-specific actions. */
  status: number;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

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
        catchError((err) => this.handleError(err)),
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
        catchError((err) => this.handleError(err)),
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
    // ── Network / CORS / server unreachable ────────────────────────────────
    if (err.status === 0) {
      return throwError((): AuthError => ({
        status: 0,
        message:
          "We're having trouble connecting. Please check your internet connection and try again.",
        fieldErrors: {},
      }));
    }

    // ── 5xx — Server-side crash / unexpected error ─────────────────────────
    if (err.status >= 500) {
      return throwError((): AuthError => ({
        status: err.status,
        message:
          'Oops! Something went wrong on our end. Please try again in a few minutes.',
        fieldErrors: {},
      }));
    }

    // ── 401 — Bad credentials (wrong email / password) ─────────────────────
    if (err.status === 401) {
      return throwError((): AuthError => ({
        status: 401,
        message:
          'No account was found for this email address. Please verify your details or create a new account.',
        fieldErrors: {},
      }));
    }

    // ── 4xx — Structured error body from the backend ───────────────────────
    const body = err.error as Partial<ApiResponse<unknown>>;
    const serverMessage = body?.message ?? 'An unexpected error occurred.';

    // Extract field-level validation errors, if any
    const rawErrors = (body?.errors as any)?.errors as
      | { field: string; message: string }[]
      | undefined;

    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(rawErrors)) {
      rawErrors.forEach(({ field, message }) => {
        fieldErrors[field] = message;
      });
    }

    return throwError((): AuthError => ({
      status: err.status,
      message: serverMessage,
      fieldErrors,
    }));
  }
}
