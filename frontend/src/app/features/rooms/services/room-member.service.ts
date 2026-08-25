import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiResponse, RoomMember } from '../../../core/models/room-member.model';

@Injectable({
  providedIn: 'root'
})
export class RoomMemberService {
  private http = inject(HttpClient);

  /**
   * Fetches members for a given room ID using Angular HttpClient.
   * @param roomId The room ID string or number
   */
  getRoomMembers(roomId: number | string): Observable<RoomMember[]> {
    return this.http
      .get<ApiResponse<RoomMember[]>>(`/api/v1/rooms/${roomId}/members`)
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
