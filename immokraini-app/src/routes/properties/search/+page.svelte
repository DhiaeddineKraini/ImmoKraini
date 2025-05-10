<script lang="ts">
    import { page } from '$app/stores';
    import type { PageData } from './$types';
    import PropertyCard from '$lib/components/PropertyCard.svelte';
    import { goto } from '$app/navigation';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;
    
    // Make properties reactive to data changes
    $: ({ properties, searchCriteria, pagination } = data);

    // Get initial values from URL parameters
    $: minBeds = $page.url.searchParams.get('minBeds') || '';
    $: minBaths = $page.url.searchParams.get('minBaths') || '';
    $: sortValue = `${searchCriteria.sortBy}-${searchCriteria.sortOrder}`;

    // Reactive statement to format criteria string
    $: criteriaString = [
        searchCriteria.location ? `Location: "${searchCriteria.location}"` : '',
        searchCriteria.type ? `Type: ${searchCriteria.type}` : '',
        searchCriteria.minPrice ? `Min Price: ${searchCriteria.minPrice}` : '',
        searchCriteria.maxPrice ? `Max Price: ${searchCriteria.maxPrice}` : '',
        searchCriteria.minBeds ? `Min Beds: ${searchCriteria.minBeds}` : '',
        searchCriteria.minBaths ? `Min Baths: ${searchCriteria.minBaths}` : ''
    ].filter(Boolean).join(', ');

    // Function to update search parameters
    async function updateSearchParams(params: Record<string, string>) {
        const url = new URL($page.url);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            } else {
                url.searchParams.delete(key);
            }
        });
        // Reset to page 1 when changing filters
        url.searchParams.set('page', '1');
        console.log('Updating URL to:', url.toString());
        await goto(url.toString(), { replaceState: true });
        await invalidateAll();
    }

    // Function to handle filter changes
    async function handleFilterChange(filterName: string, value: string) {
        console.log(`Updating ${filterName} to ${value}`);
        if (value === '') {
            console.log(`Removing ${filterName} filter`);
        }
        await updateSearchParams({ [filterName]: value });
    }

    // Function to handle sorting
    async function handleSort(sortBy: string) {
        const currentOrder = searchCriteria.sortOrder;
        const newOrder = searchCriteria.sortBy === sortBy && currentOrder === 'asc' ? 'desc' : 'asc';
        console.log(`Updating sort to ${sortBy} ${newOrder}`);
        await updateSearchParams({ sortBy, sortOrder: newOrder });
    }

    // Function to handle pagination
    async function goToPage(page: number) {
        console.log(`Going to page ${page}`);
        await updateSearchParams({ page: page.toString() });
    }

    // Make the component reactive to URL changes
    $: {
        const currentParams = $page.url.searchParams.toString();
        console.log('URL params changed:', currentParams);
    }

    // Make the component reactive to data changes
    $: {
        console.log('Data updated:', {
            properties: properties?.length,
            criteria: searchCriteria,
            pagination
        });
    }
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

    <!-- Advanced Filters -->
    <div class="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Beds Filter -->
        <div>
            <label for="minBeds" class="block text-sm font-medium text-gray-700 mb-1">Min Bedrooms</label>
            <select
                id="minBeds"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
                value={minBeds}
                on:change={(e) => handleFilterChange('minBeds', e.currentTarget.value)}
            >
                <option value="">Any</option>
                {#each [1, 2, 3, 4, 5, 6] as num}
                    <option value={num.toString()}>{num}+</option>
                {/each}
            </select>
        </div>

        <!-- Baths Filter -->
        <div>
            <label for="minBaths" class="block text-sm font-medium text-gray-700 mb-1">Min Bathrooms</label>
            <select
                id="minBaths"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
                value={minBaths}
                on:change={(e) => handleFilterChange('minBaths', e.currentTarget.value)}
            >
                <option value="">Any</option>
                {#each [1, 2, 3, 4, 5] as num}
                    <option value={num.toString()}>{num}+</option>
                {/each}
            </select>
        </div>

        <!-- Sort Options -->
        <div>
            <label for="sortBy" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
                id="sortBy"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
                value={sortValue}
                on:change={(e) => {
                    const [sortBy, sortOrder] = e.currentTarget.value.split('-');
                    handleSort(sortBy);
                }}
            >
                <option value="createdAt-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="area-desc">Largest Area</option>
                <option value="area-asc">Smallest Area</option>
            </select>
        </div>
    </div>

    <!-- Results Grid -->
    {#if properties && properties.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {#each properties as property (property.id)}
                <div class="property-card-wrapper h-full">
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

        <!-- Pagination -->
        {#if pagination.totalPages > 1}
            <div class="mt-8 flex justify-center items-center space-x-2">
                <button
                    class="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                    disabled={pagination.currentPage === 1}
                    on:click={() => goToPage(pagination.currentPage - 1)}
                >
                    Previous
                </button>

                {#each Array(pagination.totalPages) as _, i}
                    {@const pageNum = i + 1}
                    <button
                        class="px-3 py-1 rounded-md border {pagination.currentPage === pageNum ? 'bg-brand-blue text-white' : 'border-gray-300'}"
                        on:click={() => goToPage(pageNum)}
                    >
                        {pageNum}
                    </button>
                {/each}

                <button
                    class="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
                    disabled={pagination.currentPage === pagination.totalPages}
                    on:click={() => goToPage(pagination.currentPage + 1)}
                >
                    Next
                </button>
            </div>
        {/if}
    {:else}
        <!-- No Results Message -->
        <div class="text-center py-16 px-6 bg-gray-50 rounded-lg shadow">
            <h2 class="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h2>
            <p class="text-gray-500">
                We couldn't find any properties matching your search criteria. Try adjusting your filters or
                <a href="/properties/search" class="text-brand-blue hover:underline" on:click|preventDefault={() => {
                    window.location.href = '/properties/search';
                }}>view all properties</a>.
            </p>
        </div>
    {/if}
</div>

<style>
    /* Add specific styles for search results page if needed */
</style>