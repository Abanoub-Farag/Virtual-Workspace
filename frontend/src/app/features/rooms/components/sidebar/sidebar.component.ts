import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutDashboard, MonitorPlay, Trophy, Users, Settings, User as UserIcon } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';

import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon: any;
  active?: boolean;
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  userName = 'Guest User';

  get userInitials(): string {
    if (!this.userName || this.userName === 'Guest User') return 'U';
    const nameParts = this.userName.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'U';
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  navItems: NavItem[] = [
    { label: 'Profile', icon: UserIcon, route: '/profile' },
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Rooms', icon: MonitorPlay, route: '/rooms' },
    { label: 'Leaderboard', icon: Trophy },
    { label: 'Communities', icon: Users },
    { label: 'Settings', icon: Settings },
  ];

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      const firstName = user.firstName || user.first_name || user.given_name;
      const lastName = user.lastName || user.last_name || user.family_name;
      
      if (firstName && lastName) {
        this.userName = `${firstName} ${lastName}`;
      } else if (firstName) {
        this.userName = firstName;
      } else if (user.name) {
        this.userName = user.name;
      } else if (user.sub) {
        // Fallback: format email if it's the only thing available
        const emailPrefix = user.sub.split('@')[0];
        this.userName = emailPrefix
          .split('.')
          .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }
    }
  }
}
