import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { RoomCardComponent, Room } from './components/room-card/room-card.component';

type Tab = 'All Rooms' | 'My Teams' | 'Favorites';

@Component({
  selector: 'app-rooms-view',
  standalone: true,
  imports: [CommonModule, SidebarComponent, TopNavComponent, RoomCardComponent],
  templateUrl: './rooms-view.component.html',
  styleUrls: ['./rooms-view.component.scss']
})
export class RoomsViewComponent {
  tabs: Tab[] = ['All Rooms', 'My Teams', 'Favorites'];
  activeTab = signal<Tab>('All Rooms');
  searchQuery = signal<string>('');

  mockRooms: Room[] = [
    {
      id: '1',
      title: 'Design System Team',
      description: 'Core team working on the new Horizon UI design system components and documentation.',
      tags: ['ui/ux', 'design', 'components'],
      status: 'ACTIVE',
      count: 12,
      countType: 'Online',
      actionType: 'join'
    },
    {
      id: '2',
      title: 'Frontend Architecture',
      description: 'Discussions about micro-frontends, state management, and performance optimization.',
      tags: ['architecture', 'frontend', 'react', 'angular'],
      status: 'ACTIVE',
      count: 8,
      countType: 'Online',
      actionType: 'join'
    },
    {
      id: '3',
      title: 'Product Sync - Q3',
      description: 'Weekly sync for Q3 product roadmap planning and feature prioritization.',
      tags: ['product', 'planning', 'q3'],
      status: 'IDLE',
      count: 45,
      countType: 'Members',
      actionType: 'view'
    },
    {
      id: '4',
      title: 'Marketing Campaign',
      description: 'Collaborative space for the upcoming launch campaign assets and strategy.',
      tags: ['marketing', 'campaign', 'assets'],
      status: 'ACTIVE',
      count: 5,
      countType: 'Online',
      actionType: 'join'
    },
    {
      id: '5',
      title: 'Engineering All Hands',
      description: 'Monthly department-wide meeting to share updates, celebrate wins, and discuss goals.',
      tags: ['engineering', 'all-hands', 'updates'],
      status: 'IDLE',
      count: 120,
      countType: 'Members',
      actionType: 'view'
    },
    {
      id: '6',
      title: 'User Research',
      description: 'Sharing findings from recent user interviews and usability testing sessions.',
      tags: ['research', 'ux', 'testing'],
      status: 'ACTIVE',
      count: 3,
      countType: 'Online',
      actionType: 'join'
    }
  ];

  filteredRooms = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const tab = this.activeTab();
    
    return this.mockRooms.filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(query) || 
                            room.description.toLowerCase().includes(query) ||
                            room.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
      
      if (tab === 'All Rooms') return true;
      if (tab === 'My Teams') return room.tags.includes('engineering') || room.tags.includes('frontend') || room.tags.includes('design'); // Mock logic
      if (tab === 'Favorites') return room.status === 'ACTIVE'; // Mock logic for favorites
      
      return true;
    });
  });

  setActiveTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  onCreateRoom() {
    console.log('Create new room triggered');
  }

  onRoomAction(roomId: string) {
    console.log('Room action triggered for:', roomId);
  }
}
