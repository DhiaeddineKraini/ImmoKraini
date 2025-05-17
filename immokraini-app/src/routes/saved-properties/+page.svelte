<!-- src/routes/saved-properties/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types';
    import { onDestroy, onMount } from 'svelte';
    import savedPropertyIdsStore from '$lib/stores/favoritesStore';
    import PropertyCard from '$lib/components/PropertyCard.svelte';
	import L from 'leaflet';
    import { t } from '$lib/i18n/i18n.js'; // Import translation store
                                          // We need an API endpoint or load all via PageData

    // --- Corrected Approach: Fetch data for saved properties ---
    // Type for individual property matching PropertyCard props + id/slug
    interface DisplayProperty {
        id: string;
        slug: string;
        title: string;
        address: string;
        price: number;
        beds: number | null;
        baths: number | null;
        area: number | null;
        imageUrl: string | null;
        propertyType: string | null;
        // Add any other fields your PropertyCard might use or your DB has
    }

    export let data: PageData & { allProperties?: DisplayProperty[], error?: string }; // Ensure allProperties is typed // Receives data from +page.server.ts (if any)
    
    let savedPropertiesDetails: DisplayProperty[] = [];
    let isLoading = true;
    let errorMessage: string | null = data?.error || null; // Use error from load if present

    let currentSavedIds: string[] = [];
    // Subscribe to the store to react to changes
    const unsubscribe = savedPropertyIdsStore.subscribe(ids => {
        currentSavedIds = ids;
        // If already mounted and IDs change, re-fetch (optional, can be complex)
        if (!isLoading && document.readyState === 'complete') { // L check to see if onMount ran
             loadSavedPropertyDetails();
        }
    });

    async function loadSavedPropertyDetails() {
        isLoading = true;
        if (currentSavedIds.length === 0) {
            savedPropertiesDetails = [];
            isLoading = false;
            return;
        }

        try {
          // Use allProperties passed from the server via the load function
          if (data.allProperties && Array.isArray(data.allProperties)) {
                 savedPropertiesDetails = data.allProperties.filter(p => p.id && currentSavedIds.includes(p.id));
            } else if (!data.error) { // Only show this if no server error already set
                console.warn("No 'allProperties' in data prop for saved page. Check +page.server.ts.");
                errorMessage = "Could not load property details for saved items.";
                 savedPropertiesDetails = []; // Clear if no base data
            }
        } catch (error: any) {
            console.error("Error client-side filtering saved property details:", error);
            errorMessage = error.message || "Could not process saved properties.";
            savedPropertiesDetails = [];
        }
        isLoading = false;
    }

    onMount(() => {
        // Initial load
        loadSavedPropertyDetails();
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

</script>


<svelte:head>
    <title>{$t('saved.metaTitle')}</title>
</svelte:head>

<div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-8 text-muted-blue">{$t('saved.title')}</h1>

    {#if isLoading}
        <p class="text-center text-gray-600 py-16">{$t('saved.loading')}</p>
    {:else if errorMessage}
        <div class="text-center py-16 px-6 bg-red-50 text-red-700 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-2">{$t('saved.errorTitle')}</h2>
            <p>{errorMessage}</p>
        </div>
    {:else if savedPropertiesDetails.length > 0}
        <p class="mb-6 text-gray-700">{$t('saved.count', { count: savedPropertiesDetails.length })}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {#each savedPropertiesDetails as property (property.id)}
                <div class="h-full"> 
                    <PropertyCard 
                        id={property.id}
                        imageUrl={property.imageUrl ?? undefined}
                        detailUrl={`/properties/${property.slug}`}
                        title={property.title}
                        address={property.address}
                        price={property.price}
                        beds={property.beds}
                        baths={property.baths}
                        area={property.area}
                    />
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-center text-gray-600 py-16">{$t('saved.empty')}</p>
    {/if}
</div>