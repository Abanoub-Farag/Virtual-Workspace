import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface RoomResponse {
  id?: string;
  title: string;
  description: string;
  // Other fields might exist in the backend response
  [key: string]: any;
}

export interface PageableResponse {
  content: RoomResponse[];
  [key: string]: any; // To cover pageable info
}

export interface ApiRoomsResponse {
  localDateTime: string;
  status: number;
  message: string;
  data: PageableResponse;
}

export interface ApiSingleRoomResponse {
  localDateTime: string;
  status: number;
  message: string;
  data: RoomResponse;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/rooms`;

  // State to track if the current user has created a room in this session
  userOwnedRoomId = signal<string | null>(null);

  getRooms(page: number = 0, size: number = 20): Observable<ApiRoomsResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ApiRoomsResponse>(this.baseUrl, {
      headers,
      params: {
        page: page.toString(),
        size: size.toString()
      }
    });
  }

  createRoom(payload: { title: string; description?: string }): Observable<ApiSingleRoomResponse> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<ApiSingleRoomResponse>(this.baseUrl, payload, { headers });
  }
}
