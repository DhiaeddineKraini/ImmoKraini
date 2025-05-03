<script lang="ts">
    import { page } from '$app/stores'; 
    import type { PageData } from './$types';
    import PropertyCard from '$lib/components/PropertyCard.svelte'; // Import PropertyCard

    export let data: PageData; // Data loaded from +page.server.ts

    // Destructure for easier access
    const { properties, searchCriteria } = data;

    // Reactive statement to format criteria string (optional)
    $: criteriaString = [
        searchCriteria.location ? `Location: "${searchCriteria.location}"` : '',
        searchCriteria.type ? `Type: ${searchCriteria.type}` : '',
        searchCriteria.minPrice ? `Min Price: ${searchCriteria.minPrice}` : '',
        searchCriteria.maxPrice ? `Max Price: ${searchCriteria.maxPrice}` : ''
    ].filter(Boolean).join(', '); // Filter out empty strings and join

</script>

<div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-6 text-muted-blue">Property Search Results</h1>

    <!-- Display Search Criteria -->
    <div class="bg-sky-blue/10 p-4 rounded mb-8 text-sm border border-sky-blue/30">
        {#if criteriaString}
            <p>Showing results for: <strong class="font-medium">{criteriaString}</strong></p>
        {:else}
            <p>Showing all properties.</p>
        {/if}
        <a href="/#search-section" class="text-brand-blue hover:underline text-xs mt-1 inline-block">Modify Search</a>
    </div>

    <!-- Results Grid -->
    {#if properties && properties.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {#each properties as property (property.id)}
                <!-- Use PropertyCard component -->
                 <div class="property-card-wrapper h-full"> 
                    <PropertyCard 
                        imageUrl={property.imageUrl} 
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
        <!-- No Results Message -->
        <div class="text-center py-16 px-6 bg-gray-50 rounded-lg shadow">
            <h2 class="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h2>
            <p class="text-gray-500">
                We couldn't find any properties matching your search criteria. Try adjusting your filters or <a href="/properties" class="text-brand-blue hover:underline">view all properties</a>.
            </p>
        </div>
    {/if}
    <!-- End Results Grid -->

</div>

<style>
    /* Add specific styles for search results page if needed */
</style> 