import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Compass, Home, ArrowLeft, Sun, Moon, Sparkles } from 'lucide-angular';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  readonly themeService = inject(ThemeService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  // Lucide Icons
  readonly CompassIcon = Compass;
  readonly HomeIcon = Home;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SunIcon = Sun;
  readonly MoonIcon = Moon;
  readonly SparklesIcon = Sparkles;

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/rooms']);
    }
  }
}
