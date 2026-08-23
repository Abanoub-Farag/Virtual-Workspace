import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const THEME_KEY = 'pcenter_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Single source of truth for dark-mode state across all pages. */
  readonly isDarkMode = signal<boolean>(this.resolveInitialTheme());

  constructor() {
    // Whenever the signal changes, sync the DOM class and localStorage.
    effect(() => {
      const dark = this.isDarkMode();
      if (!this.isBrowser) return;
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDarkMode.update((v) => !v);
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private resolveInitialTheme(): boolean {
    if (!this.isBrowser) return true; // SSR: default to dark

    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === 'dark';

    // Fall back to the OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
