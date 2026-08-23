import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { RoomCardComponent, Room } from './components/room-card/room-card.component';
import { RoomService } from './services/room.service';

type Tab = 'All Rooms' | 'My Teams' | 'Favorites';

@Component({
  selector: 'app-rooms-view',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopNavComponent, RoomCardComponent],
  templateUrl: './rooms-view.component.html',
  styleUrls: ['./rooms-view.component.scss']
})
export class RoomsViewComponent implements OnInit {
  private readonly roomService = inject(RoomService);

  tabs: Tab[] = ['All Rooms', 'My Teams', 'Favorites'];
  activeTab = signal<Tab>('All Rooms');
  searchQuery = signal<string>('');
  
  // Use a signal to hold rooms fetched from API
  rooms = signal<Room[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  filteredRooms = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const tab = this.activeTab();
    const currentRooms = this.rooms();
    
    return currentRooms.filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(query) || 
                            room.description.toLowerCase().includes(query) ||
                            room.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
      
      if (tab === 'All Rooms') return true;
      if (tab === 'My Teams') return room.tags.includes('engineering') || room.tags.includes('frontend') || room.tags.includes('design');
      if (tab === 'Favorites') return room.status === 'ACTIVE';
      
      return true;
    });
  });

  ngOnInit() {
    this.fetchRooms();
  }

  fetchRooms() {
    this.isLoading.set(true);
    this.error.set(null);

    this.roomService.getRooms(0, 50).subscribe({
      next: (response) => {
        const fetchedRooms = response.data?.content || [];
        // Map backend API data to our Room interface expectations
        const mappedRooms: Room[] = fetchedRooms.map((r: any, index: number) => ({
          id: r.id ? r.id.toString() : `room-${index}`,
          title: r.title || 'Untitled Room',
          description: r.description || 'No description provided.',
          tags: r.tags || [],
          status: r.status || 'ACTIVE',
          count: r.count || Math.floor(Math.random() * 50) + 1, // fallback if backend doesn't provide
          countType: r.countType || 'Members',
          actionType: r.actionType || 'view'
        }));
        this.rooms.set(mappedRooms);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching rooms:', err);
        this.error.set('Failed to load rooms.');
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  onRoomAction(roomId: string) {
    console.log('Room action triggered for:', roomId);
  }
}
