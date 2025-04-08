<script lang="ts">
  import { aliases, exportAliases, importAliases } from '../stores/aliases';

  let message = $state('');
  let messageType = $state('success');
  let showMessage = $state(false);
  let importFile = $state(null);

  // Show message helper
  function showMsg(msg: string, type: 'success' | 'error') {
    message = msg;
    messageType = type;
    showMessage = true;
    setTimeout(() => {
      showMessage = false;
    }, 3000);
  }

  // Handle export
  function handleExport() {
    try {
      const exportData = exportAliases();

      // Create download link
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `alia-aliases-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success message
      showMsg('Aliases exported successfully!', 'success');
    } catch (error) {
      showMsg('Failed to export aliases', 'error');
    }
  }

  // Handle file upload for import
  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        try {
          const parsed = JSON.parse(e.target.result);
          const result = importAliases(parsed);

          if (result.success) {
            showMsg(
              `${result.added} aliases imported successfully!`,
              'success',
            );
            input.value = ''; // Reset input
          } else {
            showMsg('Invalid import data format', 'error');
          }
        } catch (error) {
          showMsg('Failed to import aliases: Invalid JSON', 'error');
        }
      }
    };

    reader.readAsText(file);
  }
</script>

<div class="p-4">
  <h2 class="text-xl font-medium mb-4">Settings</h2>

  {#if showMessage}
    <div
      class="alert mb-4 {messageType === 'success'
        ? 'alert-success'
        : 'alert-error'}"
    >
      {message}
    </div>
  {/if}

  <div class="card bg-base-content/10 mb-4">
    <div class="card-body">
      <h3 class="card-title">Export Aliases</h3>
      <p class="text-sm opacity-70 mb-4">
        Download your aliases as a JSON file for backup or transfer
      </p>

      <div class="flex justify-between items-center">
        <span class="text-sm">Total aliases: {$aliases.length}</span>
        <button
          class="btn btn-primary"
          onclick={handleExport}
          disabled={$aliases.length === 0}
        >
          Export JSON
        </button>
      </div>
    </div>
  </div>

  <div class="card bg-base-content/10">
    <div class="card-body">
      <h3 class="card-title">Import Aliases</h3>
      <p class="text-sm opacity-70 mb-4">Import aliases from a JSON file</p>

      <div>
        <label for="importFile" class="block mb-1 font-medium"
          >Upload JSON file</label
        >
        <input
          type="file"
          id="importFile"
          accept=".json"
          onchange={handleFileUpload}
          class="file-input file-input-bordered w-full"
        />
        <p class="text-xs opacity-70 mt-1">
          Select a JSON file exported from Alia or formatted as
          &#123;"shortname": "url", ...&#125;
        </p>
      </div>
    </div>
  </div>
</div>
