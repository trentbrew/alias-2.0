import { writable, get } from 'svelte/store';

type Theme = 'light' | 'dark' | 'business' | 'retro';

// Default to dark theme
export const theme = writable<Theme>('dark');

export function initializeTheme(): void {
  // Try to get theme from localStorage
  const savedTheme = localStorage.getItem('alia-theme');

  // If saved theme exists, use it; otherwise use the default (dark)
  const themeValue = (savedTheme as Theme) || 'dark';
  theme.set(themeValue);

  // Apply theme to the document
  const root = document.querySelector('div[data-theme]');
  if (root) {
    root.setAttribute('data-theme', themeValue);
  }
}

export function toggleTheme(): void {
  theme.update((current) => {
    // Cycle through themes: light -> dark -> business -> retro -> light
    let newTheme: Theme;
    switch (current) {
      case 'light':
        newTheme = 'dark';
        break;
      case 'dark':
        newTheme = 'business';
        break;
      case 'business':
        newTheme = 'retro';
        break;
      case 'retro':
        newTheme = 'light';
        break;
      default:
        newTheme = 'dark';
    }

    // Save to localStorage
    localStorage.setItem('alia-theme', newTheme);

    // Apply to document
    const root = document.querySelector('div[data-theme]');
    if (root) {
      root.setAttribute('data-theme', newTheme);
    }

    return newTheme;
  });
}
