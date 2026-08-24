import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RoomService } from '../../services/room.service';

type RequestState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-room-join',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-join.component.html',
  styles: [`
    .join-container { margin: 16px 0; }
    .join-btn { padding: 8px 16px; cursor: pointer; border-radius: 8px; border: 1px solid #232145; background: #1A1933; color: white; }
    .join-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert { padding: 12px; margin-top: 12px; border-radius: 8px; font-size: 0.875rem; }
    .alert-success { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
    .alert-error { background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }
  `]
})
export class RoomJoinComponent {
  private readonly roomService = inject(RoomService);
  
  joinState = signal<RequestState>('idle');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  joinRoom(roomId: number): void {
    if (!Number.isInteger(roomId) || roomId <= 0) {
      this.handleErrorState('Invalid room identifier provided.');
      return;
    }

    this.joinState.set('loading');
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.roomService.joinRoom(roomId).subscribe({
      next: (res) => {
        this.joinState.set('success');
        this.successMessage.set(res.message || 'Successfully joined the room.');
      },
      error: (err: HttpErrorResponse) => {
        this.joinState.set('error');
        this.handleErrorState(this.extractErrorMessage(err));
      }
    });
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.error instanceof ErrorEvent || err.status === 0) {
      return 'Network error: The server is unreachable or offline. Please check your connection.';
    }

    const payloadMessage = err.error?.message;
    const payloadErrors = err.error?.errors;

    if (payloadErrors && Object.keys(payloadErrors).length > 0) {
      return Object.entries(payloadErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
    }

    switch (err.status) {
      case 400: return payloadMessage || 'Bad Request: The provided data is invalid.';
      case 401: return payloadMessage || 'Unauthorized: Please log in to join.';
      case 403: return payloadMessage || 'Forbidden: You do not have permission to join this room.';
      case 404: return payloadMessage || 'Room Not Found: The specified room does not exist.';
      case 409: return payloadMessage || 'Conflict: You are already in this room.';
      case 500: return payloadMessage || 'Server Error: An unexpected error occurred on the server.';
      case 504: return 'Timeout: The server took too long to respond.';
      default: return payloadMessage || `Unexpected Error (${err.status}): Please try again later.`;
    }
  }

  private handleErrorState(msg: string): void {
    this.errorMessage.set(msg);
  }
}
