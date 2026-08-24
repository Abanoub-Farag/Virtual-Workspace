import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Bell, Plus, Home } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../services/room.service';
import { RoomActionButtonComponent } from '../room-action-button/room-action-button.component';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RoomActionButtonComponent],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {

  private readonly router = inject(Router);
  public readonly roomService = inject(RoomService);

  @Output() searchChange = new EventEmitter<string>();
  
  searchQuery = '';

  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly PlusIcon = Plus;
  readonly HomeIcon = Home; // Dedicated room icon

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.searchChange.emit(value);
  }

  onActionClick() {
    const roomId = this.roomService.userRoomId();
    if (roomId) {
      // Navigate to the specific room if they own one
      this.router.navigate(['/rooms', roomId]);
    } else {
      // Navigate to create room form
      this.router.navigate(['/rooms/create']);
    }
  }
}
