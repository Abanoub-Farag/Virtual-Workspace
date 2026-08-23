import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface ApiResponse<T> {
  localDateTime: string;
  status: number;
  message: string;
  data: T;
  errors: any;
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
  // Included fields that map to the visual design but aren't explicitly in the raw backend model
  displayName?: string;
  professionalHeadline?: string;
  githubUrl?: string;
  linkedinProfile?: string;
  twitterUsername?: string;
  websitePortfolio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/profile`;

  getProfile(userId: number | string): Observable<ApiResponse<UserProfileData>> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<UserProfileData>>(`${this.baseUrl}/${userId}`, { headers });
  }

  // Placeholder for when you implement updates
  updateProfile(userId: number | string, data: Partial<UserProfileData>): Observable<ApiResponse<UserProfileData>> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.put<ApiResponse<UserProfileData>>(`${this.baseUrl}/${userId}`, data, { headers });
  }
}
