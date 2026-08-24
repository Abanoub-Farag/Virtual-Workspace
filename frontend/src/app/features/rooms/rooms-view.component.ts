import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
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
  private readonly router = inject(Router);

  tabs: Tab[] = ['All Rooms', 'My Teams', 'Favorites'];
  activeTab = signal<Tab>('All Rooms');
  searchQuery = signal<string>('');
  
  // Rooms and Favorite States
  rooms = signal<Room[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  favoriteRoomIds = signal<Set<string>>(new Set());
  favPage = signal<number>(0);
  favTotalPages = signal<number>(1);
  favIsFirst = signal<boolean>(true);
  favIsLast = signal<boolean>(true);

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
      if (tab === 'Favorites') return true;
      
      return true;
    });
  });

  ngOnInit() {
    this.loadFavoriteSet();
    this.fetchRooms();
  }

  loadFavoriteSet() {
    this.roomService.getFavorites(0, 100).subscribe({
      next: (res) => {
        const favContent = res.data?.content || [];
        const set = new Set(favContent.map(f => f.roomId.toString()));
        this.favoriteRoomIds.set(set);
        this.rooms.update(list => list.map(r => ({ ...r, isFavorite: set.has(r.id) })));
      },
      error: (err) => {
        console.error('Error preloading favorites:', err);
      }
    });
  }

  fetchRooms() {
    this.isLoading.set(true);
    this.error.set(null);

    this.roomService.getRooms(0, 50).subscribe({
      next: (response) => {
        const fetchedRooms = response.data?.content || [];
        const favSet = this.favoriteRoomIds();
        const mappedRooms: Room[] = fetchedRooms
          .filter((r: any) => r.id != null)
          .map((r: any) => ({
            id: r.id.toString(),
            title: r.title || 'Untitled Room',
            description: r.description || 'No description provided.',
            tags: r.tags || [],
            actionType: r.actionType || 'view',
            isFavorite: favSet.has(r.id.toString())
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

  fetchFavorites(page: number = 0) {
    this.isLoading.set(true);
    this.error.set(null);
    this.favPage.set(page);

    this.roomService.getFavorites(page, 20).subscribe({
      next: (response) => {
        const data = response.data;
        const items = data?.content || [];
        this.favIsFirst.set(data?.first ?? true);
        this.favIsLast.set(data?.last ?? true);
        this.favTotalPages.set(data?.totalPages ?? 1);

        const mapped: Room[] = items.map((f) => ({
          id: f.roomId.toString(),
          title: f.title || 'Untitled Room',
          description: f.description || 'No description provided.',
          tags: ['favorite'],
          actionType: 'join',
          isFavorite: true,
          addedAt: f.addedAt
        }));

        this.rooms.set(mapped);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching favorites:', err);
        const errorMsg = this.extractErrorMessage(err, 'Failed to load favorite rooms.');
        this.error.set(errorMsg);
        this.isLoading.set(false);
      }
    });
  }

  setActiveTab(tab: Tab) {
    this.activeTab.set(tab);
    if (tab === 'Favorites') {
      this.fetchFavorites(0);
    } else {
      this.fetchRooms();
    }
  }

  onToggleFavorite(room: Room) {
    const isCurrentlyFav = !!room.isFavorite;
    const targetState = !isCurrentlyFav;

    // Optimistic UI update
    this.rooms.update(list => list.map(r => r.id === room.id ? { ...r, isFavorite: targetState, isPendingFavorite: true } : r));

    const request$ = targetState 
      ? this.roomService.addToFavorites(room.id)
      : this.roomService.removeFromFavorites(room.id);

    request$.subscribe({
      next: () => {
        // Confirm state
        this.rooms.update(list => {
          if (!targetState && this.activeTab() === 'Favorites') {
            return list.filter(r => r.id !== room.id);
          }
          return list.map(r => r.id === room.id ? { ...r, isFavorite: targetState, isPendingFavorite: false } : r);
        });

        // Update set
        this.favoriteRoomIds.update(set => {
          const next = new Set(set);
          if (targetState) next.add(room.id);
          else next.delete(room.id);
          return next;
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Failed to toggle favorite:', err);
        // Revert UI state on error
        this.rooms.update(list => list.map(r => r.id === room.id ? { ...r, isFavorite: isCurrentlyFav, isPendingFavorite: false } : r));
        const alertMsg = this.extractErrorMessage(err, 'Could not update favorite status.');
        alert(alertMsg);
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  onRoomAction(roomId: string) {
    const numericId = parseInt(roomId, 10);
    if (!isNaN(numericId) && numericId > 0) {
      this.roomService.joinRoom(numericId).subscribe({
        next: (res) => {
          console.log(`Joined room ${numericId} successfully:`, res);
          this.router.navigate(['/rooms', roomId]);
        },
        error: (err) => {
          console.error(`Failed to join room ${numericId}:`, err);
          this.router.navigate(['/rooms', roomId]);
        }
      });
    } else {
      this.router.navigate(['/rooms', roomId]);
    }
  }

  private extractErrorMessage(err: HttpErrorResponse | any, defaultMsg: string): string {
    if (err?.status === 0) return 'Network Error: Unable to connect to server.';
    const msg = err?.error?.message;
    const errs = err?.error?.errors;
    if (errs && typeof errs === 'object' && Object.keys(errs).length > 0) {
      return Object.entries(errs).map(([k, v]) => `${k}: ${v}`).join('; ');
    }
    return msg || defaultMsg;
  }
}
