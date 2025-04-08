<script lang="ts">
  import { onMount } from 'svelte';
  import type { ToastType } from '../stores/toast';

  // Props
  const {
    message,
    type = 'success',
    duration = 3000,
    onClose,
  } = $props<{
    message: string;
    type?: ToastType;
    duration?: number;
    onClose?: () => void;
  }>();

  let visible = $state(false);

  onMount(() => {
    // Make the toast visible after a short delay
    setTimeout(() => {
      visible = true;
    }, 10);

    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        handleClose();
      }, duration);
    }
  });

  function handleClose() {
    visible = false;
    // Call onClose after animation completes
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }

  // Helper function to get background color class
  function getBgColorClass(toastType: ToastType): string {
    switch (toastType) {
      case 'success':
        return 'bg-success text-success-content';
      case 'error':
        return 'bg-error text-error-content';
      case 'info':
        return 'bg-info text-info-content';
      case 'warning':
        return 'bg-warning text-warning-content';
      default:
        return 'bg-success text-success-content';
    }
  }
</script>

<div
  class="px-4 py-2 rounded-lg shadow-lg {getBgColorClass(
    type,
  )} transition-all duration-300 min-w-48 max-w-xs flex items-center justify-between"
  class:opacity-0={!visible}
  class:translate-y-8={!visible}
  class:opacity-100={visible}
  class:translate-y-0={visible}
>
  <span class="text-sm font-medium">{message}</span>
  <button type="button" class="ml-2 text-sm opacity-80" onclick={handleClose}>
    ✕
  </button>
</div>
