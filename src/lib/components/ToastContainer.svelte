<script lang="ts">
  import { toasts, dismissToast } from '../stores/toast';
  import Toast from './Toast.svelte';
</script>

<div
  class="toast-container fixed bottom-20 left-0 right-0 flex flex-col items-center justify-center gap-2 z-50 pointer-events-none"
>
  {#each $toasts as toast (toast.id)}
    <div class="pointer-events-auto">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={() => dismissToast(toast.id)}
      />
    </div>
  {/each}
</div>
