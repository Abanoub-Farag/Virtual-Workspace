import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutDashboard, MonitorPlay, Trophy, Users, Settings } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: any;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  userName = 'Guest User';

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Rooms', icon: MonitorPlay, active: true },
    { label: 'Leaderboard', icon: Trophy },
    { label: 'Communities', icon: Users },
    { label: 'Settings', icon: Settings },
  ];

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      if (user.firstName && user.lastName) {
        this.userName = `${user.firstName} ${user.lastName}`;
      } else if (user.firstName) {
        this.userName = user.firstName;
      } else if (user.name) {
        this.userName = user.name;
      } else if (user.sub) {
        this.userName = user.sub;
      }
    }
  }
}
