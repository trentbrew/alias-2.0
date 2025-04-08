<script lang="ts">
  import { MENU_ITEMS } from '../constants/menu';
  import { writable } from 'svelte/store';
  import type { MenuItem } from '../types';
  import Icon from './Icon.svelte';

  // Props using Svelte 5 runes
  const { onRouteChange } = $props<{
    onRouteChange: (route: string) => void;
  }>();

  // Create a store to manage active tab state
  const activeTab = writable('Home');

  // Function to handle tab changes
  function handleTabClick(item: MenuItem) {
    activeTab.set(item.label);

    // Map menu labels to route names and icons
    const routeMap: Record<string, { route: string; icon: string }> = {
      Home: { route: 'home', icon: 'home' },
      Add: { route: 'add', icon: 'add' },
      Settings: { route: 'settings', icon: 'settings' },
    };

    // Call the route change handler if provided
    if (item.label in routeMap) {
      onRouteChange(routeMap[item.label].route);
    }

    // Call the original action if it exists
    if (item.action) {
      item.action();
    }
  }
</script>

<aside class="h-16 bg-base-300 border-t border-base-300 z-50">
  <nav class="flex flex-row justify-around items-center h-full px-12 pb-3">
    {#each MENU_ITEMS as item}
      <button
        class="flex flex-col items-center justify-center px-1 transition-colors duration-200"
        class:text-primary={$activeTab === item.label}
        class:font-medium={$activeTab === item.label}
        onclick={() => handleTabClick(item)}
      >
        <span class="text-xl">
          <Icon icon={item.icon} />
        </span>
        <span class="text-xs mt-1">{item.label}</span>
        {#if $activeTab === item.label}
          <div
            class="h-0.5 w-6 bg-primary absolute -bottom-1 rounded-full"
          ></div>
        {/if}
      </button>
    {/each}
  </nav>
</aside>
