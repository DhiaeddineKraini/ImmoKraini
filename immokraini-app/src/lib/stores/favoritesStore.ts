// src/lib/stores/favoritesStore.ts
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment'; // To check if running in browser

const LOCAL_STORAGE_KEY = 'immokraini_savedPropertyIds';

// Function to get initial favorites from localStorage
function getInitialFavorites(): string[] {
    if (browser) { // Only access localStorage in the browser
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        try {
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure it's an array of strings
                if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Error parsing saved favorites from localStorage:", e);
            // Fallback to empty if parsing fails
        }
    }
    return []; // Default to empty array on server or if no valid data
}

// Create a writable store, initialized with data from localStorage
const savedPropertyIdsStore = writable<string[]>(getInitialFavorites());

// Subscribe to changes in the store and update localStorage (only in browser)
if (browser) {
    savedPropertyIdsStore.subscribe(ids => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ids));
    });
}

// Helper function to check if a property is a favorite
export function isFavorite(propertyId: string): boolean {
    // Use get() to access the current value of the store synchronously
    return get(savedPropertyIdsStore).includes(propertyId);
}

// Helper function to toggle a property's favorite status
export function toggleFavorite(propertyId: string): void {
    savedPropertyIdsStore.update(ids => {
        if (ids.includes(propertyId)) {
            // Property is already saved, so remove it
            return ids.filter(id => id !== propertyId);
        } else {
            // Property is not saved, so add it
            return [...ids, propertyId];
        }
    });
    // The subscription above will automatically update localStorage
}

// Export the store itself for direct subscription if needed
export default savedPropertyIdsStore; 