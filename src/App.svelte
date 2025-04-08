<script lang="ts">
  import { onMount } from 'svelte';
  import { theme, initializeTheme } from './lib/stores/theme';
  import { writable } from 'svelte/store';
  import { initializeApp } from './lib/initialize';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import Home from './lib/components/Home.svelte';
  import AddAlias from './lib/components/AddAlias.svelte';
  import Settings from './lib/components/Settings.svelte';
  import ToastContainer from './lib/components/ToastContainer.svelte';

  // Simple routing
  const currentRoute = writable('home');

  // Initialize theme and app
  onMount(() => {
    initializeTheme();
    initializeApp();
  });

  // Handle route changes from sidebar
  function handleRouteChange(route: string) {
    currentRoute.set(route);
  }
</script>

<div class="h-screen bg-base-300" data-theme={$theme}>
  <div class="flex h-full flex-col">
    <header class="px-4 pt-2 flex justify-between items-center border-base-300">
      <h1 class="text-2xl font-bold">Alia</h1>
      <ThemeToggle />
    </header>

    <main
      class="flex-1 overflow-y-auto border-[8px] border-base-300 rounded-3xl bg-base-100"
    >
      {#if $currentRoute === 'home'}
        <Home />
      {:else if $currentRoute === 'add'}
        <AddAlias />
      {:else if $currentRoute === 'settings'}
        <Settings />
      {/if}
    </main>

    <Sidebar onRouteChange={handleRouteChange} />

    <!-- Toast container for notifications -->
    <ToastContainer />
  </div>
</div>
