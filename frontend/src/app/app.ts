import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './core/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';

@Component({
  imports: [RouterOutlet, ToastComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  protected readonly title = signal('frontend');

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.loadCurrentUser().subscribe();
    }
  }
}

