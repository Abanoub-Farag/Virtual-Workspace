import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface RoomResponse {
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

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/rooms`;

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
}
