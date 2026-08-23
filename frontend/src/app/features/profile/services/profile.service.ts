import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

// ─── Response Wrapper ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  localDateTime: string;
  status: number;
  message: string;
  data: T;
  errors: Record<string, string> | null;
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
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string; // YYYY-MM-DD
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
