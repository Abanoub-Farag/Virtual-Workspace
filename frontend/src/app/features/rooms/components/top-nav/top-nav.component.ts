import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Bell, Plus } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  @Output() searchChange = new EventEmitter<string>();
  @Output() createRoom = new EventEmitter<void>();

  searchQuery = '';

  readonly SearchIcon = Search;
  readonly BellIcon = Bell;
  readonly PlusIcon = Plus;

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    this.searchChange.emit(value);
  }

  onCreateRoom() {
    this.createRoom.emit();
  }
}
