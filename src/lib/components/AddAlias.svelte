<script lang="ts">
  import { addAlias } from '../stores/aliases';
  import { showToast } from '../stores/toast';
  import type { Alias } from '../types';
  import { nanoid } from 'nanoid';

  // Use $state for reactive variables
  let name = $state('');
  let url = $state('');
  let validationError = $state('');

  // Check if URL string is valid
  function isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Handle form submission
  function handleSubmit(event: Event) {
    event.preventDefault();

    // Reset validation error
    validationError = '';

    // Form validation
    if (!name.trim()) {
      validationError = 'Please enter a name for this alias';
      showToast('Please enter a name for this alias', 'error');
      return;
    }

    if (!url.trim()) {
      validationError = 'Please enter a URL';
      showToast('Please enter a URL', 'error');
      return;
    }

    if (!isValidUrl(url)) {
      validationError = 'Please enter a valid URL';
      showToast('Please enter a valid URL', 'error');
      return;
    }

    // Create new alias object
    const newAlias: Alias = {
      id: nanoid(),
      name: name.trim(),
      url: url.trim(),
      createdAt: new Date(),
      count: 0,
    };

    console.log('Adding new alias:', newAlias);

    // Add to store
    const success = addAlias(newAlias);

    if (success) {
      console.log('Successfully added alias to store');
      // Reset form
      name = '';
      url = '';

      // Navigate back (if in popup)
      if (window.history.length > 1) {
        window.history.back();
      }
    } else {
      showToast('Failed to add alias', 'error');
    }
  }
</script>

<div class="p-4">
  <h2 class="text-xl font-bold mb-4">Add New Alias</h2>

  <form onsubmit={handleSubmit} class="space-y-4">
    <div class="form-control">
      <label for="name" class="label">
        <span class="label-text">Alias Name</span>
      </label>
      <input
        id="name"
        type="text"
        placeholder="e.g., GitHub"
        class="input input-bordered w-full"
        bind:value={name}
        required
      />
    </div>

    <div class="form-control">
      <label for="url" class="label">
        <span class="label-text">URL</span>
      </label>
      <input
        id="url"
        type="url"
        placeholder="e.g., https://github.com"
        class="input input-bordered w-full"
        bind:value={url}
        required
      />
    </div>

    {#if validationError}
      <div class="alert alert-error text-sm">{validationError}</div>
    {/if}

    <div class="flex justify-end space-x-2 mt-6">
      <button
        type="button"
        class="btn btn-ghost"
        onclick={() => window.history.back()}
      >
        Cancel
      </button>
      <button type="submit" class="btn btn-primary"> Save Alias </button>
    </div>
  </form>
</div>
