import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiResponse, AuthData, LoginRequest, RegisterRequest, UserData } from '../models/auth.models';
import { environment } from '../../../environments/environment';

export interface AuthError {
  message: string;
  fieldErrors: Record<string, string>;
  status: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/auth`;
  private readonly JWT_TOKEN_KEY = 'pcenter_jwt_token';
  private readonly REFRESH_TOKEN_KEY = 'pcenter_refresh_token';

  readonly currentUser = signal<UserData | null>(null);
  readonly isLoadingUser = signal<boolean>(false);

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
          return this.http.get<ApiResponse<UserData>>(`${this.baseUrl}/user/${id}`, { headers });
        }
        return throwError(() => err);
      })
    );
  }

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
        error: () => this.isLoadingUser.set(false)
      }),
      map((res) => res.data ?? null),
      catchError(() => {
        this.isLoadingUser.set(false);
        return of(null);
      })
    );
  }

  addRoomId(roomId: number): void {
    const current = this.currentUser();
    if (!current) return;

    this.currentUser.set({
      ...current,
      roomsId: roomId,
      roomId: roomId
    });
  }

  register(payload: RegisterRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}/register`, payload)
      .pipe(
        tap((res) => this.handleAuthResponse(res)),
        catchError((err) => this.handleError(err)),
      );
  }

  login(payload: LoginRequest): Observable<ApiResponse<AuthData>> {
    return this.http
      .post<ApiResponse<AuthData>>(`${this.baseUrl}/login`, payload)
      .pipe(
        tap((res) => this.handleAuthResponse(res)),
        catchError((err) => this.handleError(err)),
      );
  }

  persistTokens(jwtToken: string, refreshToken: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.JWT_TOKEN_KEY, jwtToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.JWT_TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  clearToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.JWT_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
    this.currentUser.set(null);
    this.isLoadingUser.set(false);
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearToken();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<{ token: string }>>(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      map(res => {
        const newJwt = res.data?.token;
        if (!newJwt) throw new Error('No token returned');
        
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.JWT_TOKEN_KEY, newJwt);
        }
        return newJwt;
      }),
      catchError(err => {
        this.clearToken();
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<ApiResponse<void>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearToken();
      return of({ status: 200, message: 'Local logout only', localDateTime: new Date().toISOString() } as ApiResponse<void>);
    }

    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/logout`, { refreshToken }).pipe(
      tap(() => this.clearToken()),
      catchError(() => {
        this.clearToken();
        return of({ status: 500, message: 'Server logout failed', localDateTime: new Date().toISOString() } as ApiResponse<void>);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isTokenExpired(): boolean {
    const user = this.getUser();
    if (!user || typeof user['exp'] !== 'number') {
      return true;
    }
    return user['exp'] * 1000 < Date.now();
  }

  getUser(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private handleAuthResponse(res: ApiResponse<AuthData>): void {
    if (res.data?.jwtToken && res.data?.refreshToken) {
      this.persistTokens(res.data.jwtToken, res.data.refreshToken);
      this.loadCurrentUser().subscribe();
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    if (err.status === 0) {
      return throwError((): AuthError => ({
        status: 0,
        message: "We're having trouble connecting. Please check your internet connection and try again.",
        fieldErrors: {},
      }));
    }

    if (err.status >= 500) {
      return throwError((): AuthError => ({
        status: err.status,
        message: 'Oops! Something went wrong on our end. Please try again in a few minutes.',
        fieldErrors: {},
      }));
    }

    if (err.status === 401) {
      return throwError((): AuthError => ({
        status: 401,
        message: 'No account was found for this email address. Please verify your details or create a new account.',
        fieldErrors: {},
      }));
    }

    const body = err.error as Partial<ApiResponse<unknown>>;
    const serverMessage = body?.message ?? 'An unexpected error occurred.';
    const rawErrors = (body?.errors as any)?.errors as { field: string; message: string }[] | undefined;

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
