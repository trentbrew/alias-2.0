import { writable } from 'svelte/store';

// Toast type
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast message interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Create toast store
export const toasts = writable<Toast[]>([]);

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Add toast
export function showToast(
  message: string,
  type: ToastType = 'info',
  duration: number = 3000,
) {
  const id = generateId();

  const toast: Toast = {
    id,
    message,
    type,
    duration,
  };

  // Add toast to store
  toasts.update((all) => [...all, toast]);

  // Remove toast after duration
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

// Remove toast
export function dismissToast(id: string) {
  toasts.update((all) => all.filter((t) => t.id !== id));
}

// Clear all toasts
export function clearToasts() {
  toasts.set([]);
}
