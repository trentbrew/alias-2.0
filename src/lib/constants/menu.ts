import type { MenuItem } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: 'home',
    label: 'Home',
    active: true,
    action: () => console.log('Home clicked'),
  },
  {
    icon: 'add',
    label: 'Add',
    active: false,
    action: () => console.log('Add clicked'),
  },
  {
    icon: 'settings',
    label: 'Settings',
    active: false,
    action: () => console.log('Settings clicked'),
  },
];
