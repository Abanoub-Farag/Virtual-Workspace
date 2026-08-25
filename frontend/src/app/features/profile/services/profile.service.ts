import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  timeStamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  errors?: ValidationError[];
}

export interface ApiResponse<T> {
  localDateTime: string;
  status: number;
  message: string;
  data: T;
  errors: ApiErrorBody | null;
}

export interface UserProfileData {
  bio: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  displayName?: string;
  professionalHeadline?: string;
  githubUrl?: string;
  linkedinProfile?: string;
  twitterUsername?: string;
  websitePortfolio?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  bio: string;
  gender?: 'MALE' | 'FEMALE' | string;
  dateOfBirth?: string;
}

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
}

export function parseApiError(err: HttpErrorResponse): ParsedApiError {
  if (!navigator.onLine || err.status === 0) {
    return {
      message: 'No internet connection. Check your network and try again.',
      fieldErrors: {},
    };
  }

  const body = err.error as ApiResponse<ApiErrorBody> | null | undefined;
  const errorBody: ApiErrorBody | null =
    (body?.errors && typeof body.errors === 'object' && !Array.isArray(body.errors))
      ? (body.errors as ApiErrorBody)
      : null;

  if (err.status === 400) {
    return parseValidationError(errorBody, body);
  }

  const fallbackMsg = errorBody?.message ?? body?.message;
  const errorMessages: Record<number, string> = {
    401: 'Your session has expired. Please log in again.',
    403: "You don't have permission to perform this action.",
    404: fallbackMsg ?? 'The requested resource was not found.',
    409: fallbackMsg ?? 'A conflict occurred. Please check your input.',
  };

  return {
    message: errorMessages[err.status] ?? 'Something went wrong on our end. Please try again in a few minutes.',
    fieldErrors: {},
  };
}

function parseValidationError(errorBody: ApiErrorBody | null, body: ApiResponse<ApiErrorBody> | null | undefined): ParsedApiError {
  const fieldErrors: Record<string, string> = {};
  const validationList: ValidationError[] = errorBody?.errors ?? [];

  for (const ve of validationList) {
    if (ve.field) {
      fieldErrors[ve.field] = ve.message ?? 'Invalid value.';
    }
  }

  const hasFields = Object.keys(fieldErrors).length > 0;
  const message = hasFields
    ? `Please fix ${Object.keys(fieldErrors).length} field error(s) and try again.`
    : (errorBody?.message ?? body?.message ?? 'Validation failed. Please review your input.');

  return { message, fieldErrors };
}

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

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserProfileData>> {
    return this.http.put<ApiResponse<UserProfileData>>(
      this.baseUrl,
      data,
      { headers: this.authHeaders }
    );
  }
}
