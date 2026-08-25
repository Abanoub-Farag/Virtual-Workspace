import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse, RoomMember } from '../../../core/models/room-member.model';

@Injectable({
  providedIn: 'root'
})
export class RoomMemberService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get headers(): HttpHeaders {
    let headers = new HttpHeaders({
      'ngrok-skip-browser-warning': 'true'
    });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Fetches members for a given room ID.
   * @param roomId The room ID string or number
   */
  getRoomMembers(roomId: number | string): Observable<RoomMember[]> {
    const url = environment.apiUrl 
      ? `${environment.apiUrl}/api/v1/rooms/${roomId}/members`
      : `/api/v1/rooms/${roomId}/members`;

    return this.http
      .get<ApiResponse<RoomMember[]>>(url, { headers: this.headers })
      .pipe(
        map((response) => response.data ?? []),
        catchError((error) => {
          const message =
            error?.error?.message ||
            error?.message ||
            'Failed to load room members. Please try again.';
          return throwError(() => new Error(message));
        })
      );
  }
}
