import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LogIn, Plus } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { getUserRoomId } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-room-action-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './room-action-button.component.html',
  styleUrls: ['./room-action-button.component.scss']
})
export class RoomActionButtonComponent {
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);

  readonly LogInIcon = LogIn;
  readonly PlusIcon = Plus;

  // Computed helper for room ownership check based on global UserData state
  readonly userRoomId = computed<number | null>(() => {
    return getUserRoomId(this.authService.currentUser());
  });


  // Check if current route is inside a specific room or room creation view
  readonly isAlreadyInRoom = computed<boolean>(() => {
    const url = this.router.url;
    return url.startsWith('/rooms/') && url !== '/rooms';
  });

  onActionClick(): void {
    const roomId = this.userRoomId();
    if (roomId !== null) {
      this.router.navigate(['/rooms', roomId]);
    } else {
      this.router.navigate(['/rooms/create']);
    }
  }
}
