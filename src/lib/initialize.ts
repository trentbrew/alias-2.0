import { importAliases, aliases, addAlias } from './stores/aliases';
import { showToast } from './stores/toast';
import { get } from 'svelte/store';
import examplesData from '../../examples.json';

// Initialize the application with example data if first time
export function initializeApp() {
  console.log('Initializing app...');

  // Check if this is the first time loading the app
  const hasInitialized = localStorage.getItem('alia_initialized');

  if (!hasInitialized) {
    console.log('First time initialization - importing examples');

    // Import the example aliases
    try {
      // First try directly importing a sample of examples
      const sampleExamples = {
        gh: 'https://github.com/',
        yt: 'https://youtube.com',
        google: 'https://google.com',
        docs: 'https://docs.google.com',
      };

      // Add example aliases one by one to ensure they're added properly
      Object.entries(sampleExamples).forEach(([name, url]) => {
        addAlias(name, url);
      });

      // Mark as initialized
      localStorage.setItem('alia_initialized', 'true');

      // Show success toast
      showToast(
        `Imported ${Object.keys(sampleExamples).length} example aliases`,
        'success',
      );

      // Check current store state
      const currentAliases = get(aliases);
      console.log(
        `Current aliases after initialization: ${currentAliases.length}`,
      );
    } catch (error) {
      console.error('Failed to initialize with example aliases:', error);
      showToast('Failed to load example aliases', 'error');
    }
  } else {
    console.log('App already initialized');
    // Check current store state
    const currentAliases = get(aliases);
    console.log(
      `Current aliases (already initialized): ${currentAliases.length}`,
    );
  }
}
