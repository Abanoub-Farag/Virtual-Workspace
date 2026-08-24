import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiResponse, AuthData, LoginRequest, RegisterRequest, UserData } from '../models/auth.models';
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

  // ─── Global User State ──────────────────────────────────────────────────────

  readonly currentUser = signal<UserData | null>(null);
  readonly isLoadingUser = signal<boolean>(false);

  // ─── Profile / User API Calls ────────────────────────────────────────────────

  /**
   * Fetches user profile data for specified userId or current authenticated user from token.
   * Endpoint: GET /api/v1/auth/user/{id} (or /user/{id}/data / /me)
   */
  getUserData(userId?: number): Observable<ApiResponse<UserData>> {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const decoded = this.getUser();
    const id = userId ?? decoded?.id ?? decoded?.userId ?? (decoded?.sub && !isNaN(Number(decoded.sub)) ? Number(decoded.sub) : null);

    const primaryUrl = id ? `${this.baseUrl}/user/${id}/data` : `${this.baseUrl}/me`;

    return this.http.get<ApiResponse<UserData>>(primaryUrl, { headers }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (id && err.status === 404) {
          // Fallback to /api/v1/auth/user/{id} if /data suffix is not present
          return this.http.get<ApiResponse<UserData>>(`${this.baseUrl}/user/${id}`, { headers });
        }
        return throwError(() => err);
      })
    );
  }

  /**
   * Application bootstrap session initialization.
   * Fetches user profile once if authenticated and populates global state signals.
   */
  loadCurrentUser(): Observable<UserData | null> {
    if (!this.isAuthenticated() || this.isTokenExpired()) {
      this.currentUser.set(null);
      this.isLoadingUser.set(false);
      return of(null);
    }

    this.isLoadingUser.set(true);

    return this.getUserData().pipe(
      tap({
        next: (res) => {
          if (res.data) {
            this.currentUser.set(res.data);
          }
          this.isLoadingUser.set(false);
        },
        error: () => {
          this.isLoadingUser.set(false);
        }
      }),
      map((res) => res.data ?? null),
      catchError(() => {
        this.isLoadingUser.set(false);
        return of(null);
      })
    );
  }

  /**
   * Helper to manually synchronize room ID when a new room is created.
   */
  addRoomId(roomId: number): void {
    const current = this.currentUser();
    if (current) {
      this.currentUser.set({
        ...current,
        roomsId: roomId,
        roomId: roomId
      });
    }
  }


  // ─── Register ──────────────────────────────────────────────────────────────

  register(payload: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}/register`, payload)
      .pipe(
        tap((res) => {
          if (res.data?.token) {
            this.persistToken(res.data.token);
            this.loadCurrentUser().subscribe();
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
            this.loadCurrentUser().subscribe();
          }
        }),
        catchError((err) => this.handleError(err)),
      );
  }

  private platformId = inject(PLATFORM_ID);

  // ─── Token helpers ─────────────────────────────────────────────────────────

  persistToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.isLoadingUser.set(false);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Returns true if the stored JWT has expired (or cannot be decoded).
   * Reads the `exp` claim from the token payload without a network call.
   */
  isTokenExpired(): boolean {
    const user = this.getUser();
    if (!user || typeof user['exp'] !== 'number') {
      return true; // treat undecipherable tokens as expired
    }
    // exp is in seconds; Date.now() is in milliseconds
    return user['exp'] * 1000 < Date.now();
  }

  getUser(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
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

