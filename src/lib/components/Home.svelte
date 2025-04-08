<script lang="ts">
  import { onMount } from 'svelte';
  import { aliases, deleteAlias } from '../stores/aliases';
  import { showToast } from '../stores/toast';
  import type { Alias } from '../types';

  // Use $state for reactive variables
  let searchQuery = $state('');
  let showCopyMessage = $state(false);
  let copiedUrl = $state('');
  let filteredAliases = $state<Alias[]>([]);
  let lastAliasesLength = $state(0);
  let mainElement: HTMLElement; // Reference to main element
  let isCommandMode = $state(false);
  let isMathMode = $state(false);
  let mathResult = $state('');
  let isUrlMode = $state(false);
  let selectedIndex = $state(-1);
  let searchInput: HTMLInputElement;

  // Regular expressions for detection
  const mathRegex = /^[\d\s\+\-=\(\)\*\/\.]+$/;
  const urlRegex =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;

  // Define available commands
  const commands = [
    {
      prefix: '/',
      command: 'new',
      description: 'Create a new alias',
      action: () => goToRoute('add'),
    },
    {
      prefix: '/',
      command: 'settings',
      description: 'Go to settings',
      action: () => goToRoute('settings'),
    },
    {
      prefix: '/',
      command: 'help',
      description: 'Show help',
      action: () =>
        showToast(
          'Keyboard shortcuts: ↑↓ to navigate, Enter to select, Esc to clear, / for commands',
          'info',
        ),
    },
    {
      prefix: '/',
      command: 'clear',
      description: 'Clear all aliases',
      action: clearAliases,
    },
  ];

  // Function to navigate between routes
  function goToRoute(route: string) {
    // We need to dispatch a custom event to the parent component
    const event = new CustomEvent('routeChange', { detail: { route } });
    window.dispatchEvent(event);
  }

  // Clear all aliases function
  function clearAliases() {
    if (
      confirm(
        'Are you sure you want to delete all aliases? This cannot be undone.',
      )
    ) {
      aliases.set([]);
      showToast('All aliases cleared', 'success');
    }
  }

  // Safely evaluate math expressions
  function evaluateMathExpression(expression: string): string {
    try {
      // Create a safe function from the expression
      const sanitizedExpression = expression
        .replace(/[^0-9+\-*/().% ]/g, '')
        .trim();

      // Use Function constructor to evaluate the expression
      // This is more secure than eval
      const result = new Function(`return ${sanitizedExpression}`)();

      // Format the result
      return typeof result === 'number' ? result.toString() : 'Error';
    } catch (error) {
      console.error('Math evaluation error:', error);
      return 'Error';
    }
  }

  // Search aliases function
  function searchAliases(query: string): Alias[] {
    if (!query.trim()) {
      isMathMode = false;
      isUrlMode = false;
      return $aliases;
    }

    // Handle command mode (starts with /)
    if (query.startsWith('/')) {
      isCommandMode = true;
      isMathMode = false;
      isUrlMode = false;
      return [];
    } else {
      isCommandMode = false;
    }

    // Check if it's a math expression
    if (mathRegex.test(query)) {
      isMathMode = true;
      isUrlMode = false;
      mathResult = evaluateMathExpression(query);
      // Still return matching aliases in case there are any
    } else {
      isMathMode = false;
    }

    // Check if it's a URL
    if (urlRegex.test(query)) {
      isUrlMode = true;
    } else {
      isUrlMode = false;
    }

    const lowercaseQuery = query.toLowerCase();

    // Return aliases that start with the query first, then include other matches
    const exactMatches = $aliases.filter(
      (alias) =>
        alias.name &&
        typeof alias.name === 'string' &&
        alias.name.toLowerCase() === lowercaseQuery,
    );

    const startsWithMatches = $aliases.filter(
      (alias) =>
        alias.name &&
        typeof alias.name === 'string' &&
        alias.name.toLowerCase().startsWith(lowercaseQuery) &&
        alias.name.toLowerCase() !== lowercaseQuery, // Exclude exact matches already included
    );

    const otherMatches = $aliases.filter(
      (alias) =>
        (alias.name &&
          typeof alias.name === 'string' &&
          alias.name.toLowerCase().includes(lowercaseQuery) &&
          !alias.name.toLowerCase().startsWith(lowercaseQuery)) || // Exclude starts-with matches
        (alias.url &&
          typeof alias.url === 'string' &&
          alias.url.toLowerCase().includes(lowercaseQuery)),
    );

    // Combine all matches with priority ordering
    return [...exactMatches, ...startsWithMatches, ...otherMatches];
  }

  // Filter commands based on input
  function getFilteredCommands(query: string): typeof commands {
    if (!query.startsWith('/')) return [];

    const commandText = query.slice(1).toLowerCase();
    if (!commandText) return commands;

    return commands.filter(
      (cmd) =>
        cmd.command.toLowerCase().includes(commandText) ||
        cmd.description.toLowerCase().includes(commandText),
    );
  }

  // Handle search input changes directly
  function handleSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    updateFilteredAliases();

    // Reset selection when query changes
    selectedIndex = -1;

    // Scroll main element to the top instead of the window
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Handle actions based on input type
  function handleInputAction(input: string) {
    // 1. Check if input exactly matches an alias name
    const exactAlias = $aliases.find(
      (alias) => alias.name && alias.name.toLowerCase() === input.toLowerCase(),
    );

    if (exactAlias) {
      openUrl(exactAlias.url);
      return;
    }

    // 2. Check if it's a valid URL
    if (isUrlMode) {
      // Make sure it has http/https
      let url = input;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      openUrl(url);
      return;
    }

    // 3. Check if it's a math expression
    if (isMathMode && mathResult !== 'Error') {
      // Copy result to clipboard
      navigator.clipboard
        .writeText(mathResult)
        .then(() => {
          showToast(`Copied result: ${mathResult}`, 'success');
        })
        .catch((err) => {
          console.error('Failed to copy math result:', err);
        });
      return;
    }

    // 4. Default to google search if no other actions apply
    const searchUrl = `https://google.com/search?q=${encodeURIComponent(input)}`;
    openUrl(searchUrl);
  }

  // Handle keyboard navigation
  function handleKeyDown(event: KeyboardEvent) {
    const filteredCommands = getFilteredCommands(searchQuery);
    const currentList = isCommandMode ? filteredCommands : filteredAliases;
    const listLength = currentList.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % Math.max(1, listLength);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex =
          selectedIndex <= 0 ? Math.max(0, listLength - 1) : selectedIndex - 1;
        break;
      case 'Enter':
        event.preventDefault();
        if (isCommandMode) {
          if (selectedIndex >= 0 && filteredCommands.length > 0) {
            // Execute selected command
            filteredCommands[selectedIndex].action();
          } else if (filteredCommands.length > 0) {
            // Execute first command if none selected
            filteredCommands[0].action();
          }
          searchQuery = '';
          isCommandMode = false;
        } else if (selectedIndex >= 0 && filteredAliases.length > 0) {
          // Open selected alias
          openUrl(filteredAliases[selectedIndex].url);
        } else {
          // Handle direct input action
          handleInputAction(searchQuery);
        }
        break;
      case 'Escape':
        event.preventDefault();
        searchQuery = '';
        updateFilteredAliases();
        break;
      case '/':
        // Auto-focus the search input when / is pressed anywhere
        if (document.activeElement !== searchInput) {
          event.preventDefault();
          searchInput.focus();
          searchQuery = '/';
          updateFilteredAliases();
        }
        break;
    }
  }

  // Update filtered aliases helper function
  function updateFilteredAliases() {
    filteredAliases = searchAliases(searchQuery);
  }

  // One-time initialization
  onMount(() => {
    // Initialize filtered aliases once
    updateFilteredAliases();

    // Add global keyboard listener
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchQuery = '/';
        updateFilteredAliases();
      }
    });
  });

  // Watch for changes to aliases store
  $effect(() => {
    const currentLength = $aliases.length;
    // Only update if length has changed to avoid circular updates
    if (lastAliasesLength !== currentLength) {
      lastAliasesLength = currentLength;
      updateFilteredAliases();
    }
  });

  // Watch for search query changes
  $effect(() => {
    // Only respond to search query changes
    updateFilteredAliases();
  });

  // Handle alias deletion
  function handleDelete(id: string | undefined) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this alias?')) {
      const success = deleteAlias(id);

      if (success) {
        // The toast is handled in the aliases store
        console.log('Alias deleted successfully');
      } else {
        showToast('Could not delete alias - ID not found', 'error');
      }
    }
  }

  // Copy URL to clipboard
  async function copyToClipboard(url: string, name: string) {
    try {
      await navigator.clipboard.writeText(url);
      copiedUrl = name;
      showCopyMessage = true;
      showToast(`Copied "${name}" URL to clipboard`, 'success');

      setTimeout(() => {
        showCopyMessage = false;
      }, 1000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      showToast('Failed to copy URL to clipboard', 'error');
    }
  }

  // Open the URL in a new tab
  function openUrl(url: string) {
    window.open(url, '_blank');
  }

  // Format count for display
  function formatCount(count: number): string {
    if (count > 999) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }

  // SVG icons
  const copyIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8H10C8.89543 8 8 8.89543 8 10V20C8 21.1046 8.89543 22 10 22H20C21.1046 22 22 21.1046 22 20V10C22 8.89543 21.1046 8 20 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 16C2.9 16 2 15.1 2 14V4C2 2.9 2.9 2 4 2H14C15.1 2 16 2.9 16 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const deleteIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const searchIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M21.7099 20.29L17.9999 16.61C19.44 14.8144 20.1374 12.5353 19.9487 10.2413C19.76 7.94733 18.6996 5.81281 16.9854 4.27667C15.2713 2.74053 13.0337 1.91954 10.7328 1.9825C8.43194 2.04546 6.24263 2.98759 4.61505 4.61517C2.98747 6.24275 2.04534 8.43207 1.98237 10.7329C1.91941 13.0338 2.74041 15.2714 4.27655 16.9855C5.81269 18.6997 7.94721 19.7601 10.2412 19.9488C12.5352 20.1375 14.8143 19.4401 16.6099 18L20.2899 21.68C20.3829 21.7738 20.4935 21.8481 20.6153 21.8989C20.7372 21.9497 20.8679 21.9758 20.9999 21.9758C21.1319 21.9758 21.2626 21.9497 21.3845 21.8989C21.5063 21.8481 21.6169 21.7738 21.7099 21.68C21.8901 21.4936 21.9909 21.2444 21.9909 20.985C21.9909 20.7257 21.8901 20.4765 21.7099 20.29V20.29ZM10.9999 18C9.61544 18 8.26206 17.5895 7.11091 16.8203C5.95977 16.0511 5.06256 14.9579 4.53275 13.6788C4.00293 12.3997 3.86431 10.9923 4.13441 9.63439C4.4045 8.27653 5.07119 7.02925 6.05016 6.05028C7.02912 5.07131 8.27641 4.40463 9.63427 4.13453C10.9921 3.86443 12.3996 4.00306 13.6787 4.53287C14.9578 5.06268 16.051 5.95989 16.8202 7.11103C17.5894 8.26218 17.9999 9.61556 17.9999 11C17.9999 12.8565 17.2624 14.637 15.9497 15.9498C14.6369 17.2625 12.8564 18 10.9999 18V18Z" fill="currentColor"/> </svg>`;
</script>

<div class="p-2 pt-0" bind:this={mainElement}>
  <div class="mb-4 sticky top-0 pt-2 z-10 backdrop-blur-2xl bg-base-100/0">
    <div>
      <span
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
      >
        {#if isCommandMode}
          <span class="text-primary font-bold">/</span>
        {:else if isMathMode}
          <span class="text-accent font-bold">=</span>
        {:else if isUrlMode}
          <span class="text-success font-bold">→</span>
        {:else}
          {@html searchIcon}
        {/if}
      </span>
      <input
        type="text"
        placeholder="Search or type / for commands..."
        class="input bg-base-content/25 w-full pl-12 pr-12"
        value={searchQuery}
        oninput={handleSearchChange}
        onkeydown={handleKeyDown}
        bind:this={searchInput}
      />
      {#if searchQuery}
        <button
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          onclick={() => {
            searchQuery = '';
            updateFilteredAliases();
          }}
          aria-label="Clear search"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      {/if}
    </div>

    {#if isMathMode && mathResult !== 'Error'}
      <div class="mt-2 card px-3 py-2 bg-base-content/5 text-accent">
        <div class="flex justify-between items-center">
          <span class="text-sm font-mono"
            >{searchQuery} = <span class="font-bold">{mathResult}</span></span
          >
          <button
            class="btn btn-ghost btn-xs"
            onclick={() => {
              navigator.clipboard.writeText(mathResult);
              showToast('Result copied to clipboard', 'success');
            }}
            aria-label="Copy result"
          >
            {@html copyIcon}
          </button>
        </div>
      </div>
    {/if}

    {#if isUrlMode}
      <div class="mt-2 card px-3 py-2 bg-base-content/5 text-success">
        <div class="flex justify-between items-center">
          <span class="text-sm">
            <span class="opacity-60">Go to:</span>
            <span class="font-medium ml-1">
              {searchQuery.startsWith('http')
                ? searchQuery
                : `https://${searchQuery}`}
            </span>
          </span>
          <button
            class="btn btn-ghost btn-xs"
            onclick={() => {
              openUrl(
                searchQuery.startsWith('http')
                  ? searchQuery
                  : `https://${searchQuery}`,
              );
            }}
            aria-label="Open URL"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15 3H21V9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10 14L21 3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- Command results -->
  {#if isCommandMode}
    <div class="mb-4">
      <h3 class="font-medium text-xs uppercase opacity-60 mb-2">Commands</h3>
      {#if getFilteredCommands(searchQuery).length === 0}
        <div class="text-center py-4 card bg-base-content/5">
          <p class="opacity-70">No commands found</p>
        </div>
      {:else}
        <div class="space-y-1">
          {#each getFilteredCommands(searchQuery) as command, i}
            <div
              class="card card-compact p-2 flex flex-row gap-2 items-center cursor-pointer hover:bg-base-300 transition-colors"
              class:bg-base-300={selectedIndex === i}
              onclick={() => {
                command.action();
                searchQuery = '';
                isCommandMode = false;
              }}
            >
              <div class="font-mono text-primary">
                {command.prefix}{command.command}
              </div>
              <div class="opacity-60 text-sm">{command.description}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <div class="mb-4 flex justify-between items-center">
    <h3 class="font-medium">
      <span class="text-sm opacity-80">{filteredAliases.length}</span>
      <span class="text-sm opacity-80"
        >{searchQuery && !isCommandMode ? 'search results' : 'aliases'}</span
      >
    </h3>

    {#if searchQuery && !isCommandMode && !isMathMode && !isUrlMode && filteredAliases.length > 0}
      <div class="text-xs opacity-60">
        Press Enter to {filteredAliases[0]?.name?.toLowerCase() ===
        searchQuery.toLowerCase()
          ? `open "${filteredAliases[0].name}"`
          : 'search Google'}
      </div>
    {/if}
  </div>

  {#if $aliases.length === 0}
    <div class="text-center py-8">
      <p class="text-lg opacity-70">No aliases found</p>
      <p class="text-sm opacity-50 mt-2">
        Add your first alias using the + button below
      </p>
    </div>
  {:else if filteredAliases.length === 0 && !isCommandMode}
    <div class="text-center py-8 w-full justify-center items-center">
      <p class="text-lg opacity-70">No matching aliases</p>
      <p class="text-sm opacity-50 mt-2">Try a different search term</p>
    </div>
  {:else if !isCommandMode}
    <div class="space-y-2">
      {#each filteredAliases as alias, i (alias.id)}
        {@const isExactMatch =
          alias.name &&
          searchQuery &&
          alias.name.toLowerCase() === searchQuery.toLowerCase()}
        {@const isPartialMatch =
          alias.name &&
          searchQuery &&
          alias.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !isExactMatch}

        <div
          class="card card-compact bg-base-content/5 hover:bg-base-300 transition-colors"
          class:bg-base-300={selectedIndex === i}
          class:border-l-4={isExactMatch}
          class:border-primary={isExactMatch}
        >
          <div class="card-body">
            <div class="flex justify-between items-center">
              <div
                class="flex-1 cursor-pointer"
                role="button"
                tabindex="0"
                onclick={() => openUrl(alias.url)}
                onkeydown={(e) => e.key === 'Enter' && openUrl(alias.url)}
              >
                <h3 class="font-medium flex items-center gap-2">
                  <span class="text-primary truncate max-w-[80%]">
                    {alias.name}
                  </span>
                  {#if isExactMatch && searchQuery}
                    <span class="badge badge-sm badge-primary">exact match</span
                    >
                  {/if}
                </h3>
                <p class="text-sm opacity-70 truncate max-w-[150px]">
                  {alias.url}
                </p>
              </div>
              <div class="flex gap-0">
                <button
                  type="button"
                  class="btn btn-ghost btn-sm tooltip px-2"
                  data-tip="Copy URL"
                  onclick={() => copyToClipboard(alias.url, alias.name)}
                >
                  {@html copyIcon}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm tooltip px-2"
                  data-tip="Delete"
                  onclick={() => handleDelete(alias.id)}
                >
                  {@html deleteIcon}
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
