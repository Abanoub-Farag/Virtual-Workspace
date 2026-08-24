import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface ApiErrorDetail {
  [key: string]: string | string[] | any;
}

export interface ApiResponse<T = any> {
  localDateTime: string;
  status: number;
  message: string;
  data: T;
  errors: ApiErrorDetail | string[] | string | null;
}

export interface RoomData {
  id: number;
  title: string;
  description: string;
  // To satisfy our components which might look for these:
  tags?: string[];
  status?: string;
  count?: number;
  countType?: string;
  actionType?: string;
  [key: string]: any;
}

export interface PageableResponse {
  content: RoomData[];
  [key: string]: any; // To cover pageable info
}

export interface CreateRoomDto {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/rooms`;

  // State to track if the current user owns an active room
  userRoomId = signal<number | null>(null);

  getRooms(page: number = 0, size: number = 20): Observable<ApiResponse<PageableResponse>> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<ApiResponse<PageableResponse>>(this.baseUrl, {
      headers,
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  createRoom(dto: CreateRoomDto): Observable<ApiResponse<RoomData>> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<ApiResponse<RoomData>>(this.baseUrl, dto, { headers });
  }

  getRoomById(id: number | string): Observable<ApiResponse<RoomData>> {
    const numericId = typeof id === 'number' ? id : parseInt(String(id), 10);
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<ApiResponse<RoomData>>(`${this.baseUrl}/${numericId}`, { headers });
  }

  joinRoom(roomId: number | string): Observable<ApiResponse<any>> {
    const numericId = typeof roomId === 'number' ? roomId : parseInt(String(roomId), 10);
    if (!numericId || isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
      return throwError(() => new Error('Invalid room ID: must be a positive 64-bit integer.'));
    }
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${numericId}/join`, {}, { headers });
  }
}
