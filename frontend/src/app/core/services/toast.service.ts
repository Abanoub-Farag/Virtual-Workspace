import { Injectable, signal, computed } from '@angular/core';

// ─── Toast Types ──────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number; // ms
}

// ─── Toast Service ────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);

  /** Read-only list of active toasts. */
  readonly toasts = computed(() => this._toasts());

  // ─── Public API ────────────────────────────────────────────────────────────

  success(message: string, duration = 4000): void {
    this.add({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.add({ type: 'error', message, duration });
  }

  info(message: string, duration = 4000): void {
    this.add({ type: 'info', message, duration });
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private add(toast: Omit<Toast, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this._toasts.update((list) => [...list, { ...toast, id }]);

    // Auto-dismiss after `duration` ms
    setTimeout(() => this.dismiss(id), toast.duration);
  }
}
