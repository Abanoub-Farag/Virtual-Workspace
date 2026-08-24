import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

// ─── Backend Error Shapes ─────────────────────────────────────────────────────
// These mirror the backend ErrorResponse / GlobalExceptionHandler exactly.

/** One field-level validation failure from MethodArgumentNotValidException. */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * The ErrorResponse object that the backend places into ApiResponse.errors.
 * Present on every non-2xx response.
 */
export interface ApiErrorBody {
  timeStamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  /** Only populated on 400 Validation errors. */
  errors?: ValidationError[];
}

// ─── Response Wrapper ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  localDateTime: string;
  status: number;
  message: string;
  data: T;
  /** On success responses this is null; on errors it holds ApiErrorBody. */
  errors: ApiErrorBody | null;
}

// ─── Profile Domain Models ────────────────────────────────────────────────────

export interface UserProfileData {
  bio: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string; // YYYY-MM-DD
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  // Extended visual fields (not from backend, kept for UI purposes)
  displayName?: string;
  professionalHeadline?: string;
  githubUrl?: string;
  linkedinProfile?: string;
  twitterUsername?: string;
  websitePortfolio?: string;
}

/**
 * Strongly-typed payload for PUT /api/v1/profile.
 * Matches the exact fields the backend accepts.
 */
export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  bio: string;
}

// ─── Error Parsing Utility ────────────────────────────────────────────────────

export interface ParsedApiError {
  /** Human-readable summary to show in a toast / banner. */
  message: string;
  /**
   * Field → error message map, derived from 400 validation errors.
   * Empty object when the error is not a validation failure.
   */
  fieldErrors: Record<string, string>;
}

/**
 * Converts an Angular HttpErrorResponse into a structured, user-friendly error.
 *
 * Response shape produced by the backend GlobalExceptionHandler:
 *   ApiResponse<ErrorResponse> {
 *     status, message,
 *     errors: ErrorResponse {
 *       timeStamp, status, error, message, path,
 *       errors?: ValidationError[]   // only on 400
 *     }
 *   }
 */
export function parseApiError(err: HttpErrorResponse): ParsedApiError {
  // ── Offline / network failure ──────────────────────────────────────────────
  if (!navigator.onLine || err.status === 0) {
    return {
      message: 'No internet connection. Check your network and try again.',
      fieldErrors: {},
    };
  }

  // ── Try to read the structured ApiResponse body ────────────────────────────
  const body = err.error as ApiResponse<ApiErrorBody> | null | undefined;

  // The nested ErrorResponse object the backend places in ApiResponse.errors
  const errorBody: ApiErrorBody | null =
    (body?.errors && typeof body.errors === 'object' && !Array.isArray(body.errors))
      ? (body.errors as ApiErrorBody)
      : null;

  switch (err.status) {
    // ── 400 Validation ───────────────────────────────────────────────────────
    case 400: {
      const fieldErrors: Record<string, string> = {};
      const validationList: ValidationError[] = errorBody?.errors ?? [];
      for (const ve of validationList) {
        if (ve.field) {
          fieldErrors[ve.field] = ve.message ?? 'Invalid value.';
        }
      }
      const hasFields = Object.keys(fieldErrors).length > 0;
      return {
        message: hasFields
          ? `Please fix ${Object.keys(fieldErrors).length} field error(s) and try again.`
          : (errorBody?.message ?? body?.message ?? 'Validation failed. Please review your input.'),
        fieldErrors,
      };
    }

    // ── 401 Unauthenticated ──────────────────────────────────────────────────
    case 401:
      return {
        message: 'Your session has expired. Please log in again.',
        fieldErrors: {},
      };

    // ── 403 Forbidden ────────────────────────────────────────────────────────
    case 403:
      return {
        message: "You don't have permission to perform this action.",
        fieldErrors: {},
      };

    // ── 404 Not Found ────────────────────────────────────────────────────────
    case 404:
      return {
        message: errorBody?.message ?? body?.message ?? 'The requested resource was not found.',
        fieldErrors: {},
      };

    // ── 409 Conflict ─────────────────────────────────────────────────────────
    case 409:
      return {
        message: errorBody?.message ?? body?.message ?? 'A conflict occurred. Please check your input.',
        fieldErrors: {},
      };

    // ── 5xx Server / Unknown ─────────────────────────────────────────────────
    default:
      return {
        message: 'Something went wrong on our end. Please try again in a few minutes.',
        fieldErrors: {},
      };
  }
}

// ─── Profile Service ──────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/profile`;

  private get authHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  getProfile(userId: number | string): Observable<ApiResponse<UserProfileData>> {
    return this.http.get<ApiResponse<UserProfileData>>(
      `${this.baseUrl}/${userId}`,
      { headers: this.authHeaders }
    );
  }

  /**
   * Updates the authenticated user's profile.
   * Endpoint: PUT /api/v1/profile (user resolved from JWT on the backend).
   */
  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserProfileData>> {
    return this.http.put<ApiResponse<UserProfileData>>(
      this.baseUrl,
      data,
      { headers: this.authHeaders }
    );
  }
}
