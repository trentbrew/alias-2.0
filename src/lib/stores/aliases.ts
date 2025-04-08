import { writable, get } from 'svelte/store';
import type { Alias } from '../types';
import { nanoid } from 'nanoid';
import { showToast } from './toast';

// Create a writable store for the aliases
const STORAGE_KEY = 'aliases';

// Helper function to load aliases from storage
function loadAliases(): Alias[] {
  try {
    const storedAliases = localStorage.getItem(STORAGE_KEY);
    if (storedAliases) {
      const parsedAliases = JSON.parse(storedAliases);
      console.log('Loaded aliases from storage:', parsedAliases);
      return parsedAliases;
    }
  } catch (error) {
    console.error('Error loading aliases from storage:', error);
  }
  return [];
}

// Helper function to save aliases to storage
function saveAliases(aliases: Alias[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aliases));
    console.log('Saved aliases to storage:', aliases);
    return true;
  } catch (error) {
    console.error('Error saving aliases to storage:', error);
    return false;
  }
}

// Create the store with initial value from storage
export const aliases = writable<Alias[]>(loadAliases());

// Subscribe to store changes to persist to storage
aliases.subscribe((value) => {
  if (value) {
    saveAliases(value);
  }
});

// Add an alias
export function addAlias(alias: Alias): boolean {
  try {
    aliases.update((currentAliases) => {
      // Check if alias name already exists
      const nameExists = currentAliases.some(
        (a) => a.name.toLowerCase() === alias.name.toLowerCase(),
      );
      if (nameExists) {
        showToast(`Alias "${alias.name}" already exists`, 'error');
        return currentAliases; // Return unchanged if name exists
      }

      // Add new alias
      const updatedAliases = [...currentAliases, alias];
      showToast(`Alias "${alias.name}" added successfully`, 'success');
      return updatedAliases;
    });
    return true;
  } catch (error) {
    console.error('Error adding alias:', error);
    return false;
  }
}

// Delete an alias by ID
export function deleteAlias(id: string): boolean {
  try {
    aliases.update((currentAliases) => {
      const alias = currentAliases.find((a) => a.id === id);
      if (!alias) {
        return currentAliases; // Return unchanged if alias not found
      }

      const updatedAliases = currentAliases.filter((a) => a.id !== id);
      showToast(`Alias "${alias.name}" deleted successfully`, 'success');
      return updatedAliases;
    });
    return true;
  } catch (error) {
    console.error('Error deleting alias:', error);
    return false;
  }
}

// Increment the count for an alias
export function incrementAliasCount(id: string): boolean {
  try {
    aliases.update((currentAliases) => {
      return currentAliases.map((alias) => {
        if (alias.id === id) {
          return { ...alias, count: (alias.count || 0) + 1 };
        }
        return alias;
      });
    });
    return true;
  } catch (error) {
    console.error('Error incrementing alias count:', error);
    return false;
  }
}

// Import aliases from JSON
export function importAliases(data: any): {
  success: boolean;
  added: number;
} {
  try {
    let addedCount = 0;
    let processedAliases: Alias[] = [];

    console.log('Importing data:', data);

    // Handle different formats:
    // 1. Array of Alias objects (export format)
    if (Array.isArray(data)) {
      processedAliases = data
        .filter(
          (item) =>
            item &&
            typeof item === 'object' &&
            item.name &&
            typeof item.name === 'string' &&
            item.url &&
            typeof item.url === 'string',
        )
        .map((item) => {
          return {
            id: item.id || nanoid(),
            name: item.name,
            url: item.url,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            count: typeof item.count === 'number' ? item.count : 0,
          };
        });
    }
    // 2. Object with key-value pairs (shortname: url format)
    else if (typeof data === 'object' && data !== null) {
      Object.entries(data).forEach(([name, url]) => {
        // Ensure both name and url are valid strings and not empty
        if (
          name &&
          typeof name === 'string' &&
          url !== null &&
          url !== undefined &&
          typeof url === 'string' &&
          url.trim() !== ''
        ) {
          processedAliases.push({
            id: nanoid(),
            name,
            url: url as string,
            createdAt: new Date(),
            count: 0,
          });
        } else {
          console.log(`Skipping invalid entry - name: ${name}, url: ${url}`);
        }
      });
    } else {
      console.error('Invalid import data format:', data);
      return { success: false, added: 0 };
    }

    if (processedAliases.length === 0) {
      console.error('No valid aliases found in import data');
      showToast('No valid aliases found in import data', 'error');
      return { success: false, added: 0 };
    }

    console.log('Processed aliases for import:', processedAliases);

    // Now add the processed aliases to the store
    aliases.update((currentAliases) => {
      const updatedAliases = [...currentAliases];

      processedAliases.forEach((importedAlias) => {
        // Check for duplicate name
        if (
          !currentAliases.some(
            (a) =>
              a.name &&
              importedAlias.name &&
              a.name.toLowerCase() === importedAlias.name.toLowerCase(),
          )
        ) {
          updatedAliases.push(importedAlias);
          addedCount++;
        }
      });

      return updatedAliases;
    });

    if (addedCount > 0) {
      showToast(`Imported ${addedCount} aliases successfully`, 'success');
    } else {
      showToast('No new aliases imported (duplicates found)', 'info');
    }

    return { success: true, added: addedCount };
  } catch (error) {
    console.error('Error importing aliases:', error);
    showToast(
      `Failed to import aliases: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      'error',
    );
    return { success: false, added: 0 };
  }
}

// Export aliases to JSON string
export function exportAliases(): string {
  let aliasesData = '';
  aliases.subscribe((value) => {
    aliasesData = JSON.stringify(value, null, 2);
  })();

  return aliasesData;
}
