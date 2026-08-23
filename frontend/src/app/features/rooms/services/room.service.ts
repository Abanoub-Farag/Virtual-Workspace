import { Injectable, inject, signal } from '@angular/core';
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
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

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
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApiResponse<RoomData>>(this.baseUrl, dto, { headers });
  }

  getRoomById(id: number): Observable<ApiResponse<RoomData>> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiResponse<RoomData>>(`${this.baseUrl}/${id}`, { headers });
  }
}
