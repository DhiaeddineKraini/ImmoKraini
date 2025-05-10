<!-- src/routes/admin/properties/+page.svelte -->
<script lang="ts">
    import type { PageData } from './$types'; 
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { Plus, Trash2, Edit, AlertCircle, CheckCircle, Star, XCircle } from 'lucide-svelte'; // Added Star, XCircle

    export let data: PageData; 
    
    // Type 'form' to include toggle feedback properties
    export let form: { 
        deleteError?: string; 
        deleteSuccess?: boolean; 
        deletedTitle?: string; 
        toggleError?: string;
        toggleSuccess?: boolean;
        updatedTitle?: string;
        updatedStatus?: boolean;
        errorCode?: string; // Add error code for better error handling
    } | null | undefined; 

    // Define extended property type
    interface Property {
        id: string;
        slug: string;
        title: string;
        price: number;
        propertyType: string | null;
        isFeatured: boolean;
    }
    
    // Use optional chaining for safety and type assertion
    $: properties = (data?.properties || []) as Property[]; 

    // Function to get error message based on error code
    function getErrorMessage(code: string | null, defaultMessage: string): string {
        switch (code) {
            case 'INVALID_ID':
                return 'Invalid property ID provided.';
            case 'NOT_FOUND':
                return 'The property you are trying to modify no longer exists.';
            case 'DUPLICATE_SLUG':
                return 'A property with this slug already exists.';
            case 'SERVER_ERROR':
                return 'An unexpected error occurred. Please try again later.';
            default:
                return defaultMessage;
        }
    }

    // Confirmation dialog function for delete
    function confirmDelete(event: Event) {
        const formElement = event.currentTarget as HTMLFormElement;
        const propertyTitle = formElement.dataset.propertyTitle || 'this property';
        if (!window.confirm(`Are you sure you want to delete "${propertyTitle}"? This cannot be undone.`)) {
            event.preventDefault(); 
        }
    }
</script>

<svelte:head>
    <title>Manage Properties | ImmoKraini Admin</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Manage Properties</h1>
    <a href="/admin/add-property" class="inline-flex items-center bg-brand-blue text-white font-semibold py-2 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out text-sm">
        <Plus class="w-4 h-4 mr-2" /> Add New Property
    </a>
</div>

<!-- Feedback Messages -->
{#if form?.deleteError} <div class="feedback error"><AlertCircle class="w-5 h-5 flex-shrink-0" /><span>Error deleting: {form.deleteError}</span></div> {/if}
{#if form?.deleteSuccess} <div class="feedback success"><CheckCircle class="w-5 h-5 flex-shrink-0" /><span>"{form.deletedTitle}" deleted.</span></div> {/if}
{#if form?.toggleError} <div class="feedback error"><AlertCircle class="w-5 h-5 flex-shrink-0" /><span>Error updating featured status: {form.toggleError}</span></div> {/if}
{#if form?.toggleSuccess} <div class="feedback success"><CheckCircle class="w-5 h-5 flex-shrink-0" /><span>"{form.updatedTitle}" featured status set to: {form.updatedStatus ? 'Featured' : 'Not Featured'}.</span></div> {/if}
<!-- End Feedback Messages -->


<div class="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-x-auto">
    <table class="w-full min-w-[700px] text-sm text-left text-gray-600">
        <thead class="text-xs text-gray-700 uppercase bg-gray-100 border-b">
            <tr>
                <th scope="col" class="px-4 py-3">Title</th>
                <th scope="col" class="px-4 py-3">Type</th>
                <th scope="col" class="px-4 py-3">Price (TND)</th>
                <th scope="col" class="px-4 py-3">Featured</th> 
                <th scope="col" class="px-4 py-3">Status</th>
                <th scope="col" class="px-4 py-3 text-right">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each properties as property (property.id)}
                <tr class="bg-white border-b hover:bg-gray-50">
                    <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        <a href={`/properties/${property.slug}`} target="_blank" class="hover:underline" title="View on site">
                            {property.title}
                        </a>
                    </th>
                    <td class="px-4 py-3">{property.propertyType || '-'}</td>
                    <td class="px-4 py-3">{property.price.toLocaleString('fr-TN')}</td>
                    <td class="px-4 py-3"> 
                        {#if property.isFeatured}
                            <span class="text-yellow-500 inline-flex items-center font-medium">
                                <Star class="w-4 h-4 mr-1 fill-current"/> Yes
                            </span>
                        {:else}
                            <span class="text-gray-400">No</span>
                        {/if}
                    </td>
                    <td class="px-4 py-3">
                        <span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded border border-green-400">Published</span> 
                    </td>
                    <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap"> 
                        
                        <!-- Toggle Featured Form -->
                        <form 
                            method="POST" 
                            action="?/toggleFeatured" 
                            use:enhance={() => async ({ result }) => {
                                if (result.type === 'success') {
                                    await invalidateAll();
                                }
                            }}
                            class="inline-block align-middle"
                        >
                            <input type="hidden" name="propertyId" value={property.id} />
                          
                            <input type="hidden" name="currentFeaturedState" value={property.isFeatured.toString()} /> 
                            <button 
                                type="submit" 
                                class="inline-flex items-center p-1 text-xs rounded" 
                                class:text-yellow-600={!property.isFeatured} 
                                class:hover:text-yellow-800={!property.isFeatured}
                                class:hover:bg-yellow-100={!property.isFeatured}
                                class:text-gray-400={property.isFeatured} 
                                class:hover:text-gray-600={property.isFeatured}
                                class:hover:bg-gray-100={property.isFeatured}
                                title={property.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                            >
                                {#if property.isFeatured}
                                    <XCircle class="w-4 h-4" /> 
                                {:else}
                                    <Star class="w-4 h-4" />
                                {/if}
                            </button>
                        </form>

                        <!-- Edit Button -->
                        <a href={`/admin/properties/edit/${property.id}`} class="text-blue-600 hover:text-blue-800 inline-flex items-center p-1 align-middle" title="Edit">
                            <Edit class="w-4 h-4" />
                        </a>

                        <!-- Delete Form -->
                        <form 
                            method="POST" 
                            action="?/delete" 
                            use:enhance={() => async ({ result }) => {
                                if (result.type === 'success') {
                                    await invalidateAll();
                                }
                            }}
                            class="inline-block align-middle"
                            on:submit={confirmDelete} 
                            data-property-title={property.title} 
                        >
                            <input type="hidden" name="propertyId" value={property.id} />
                            <button type="submit" class="text-red-600 hover:text-red-800 inline-flex items-center p-1" title="Delete">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </form>
                    </td>
                </tr>
            {:else}
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500">No properties found.</td> 
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    /* Simple feedback message styling */
    .feedback { 
        margin-bottom: 1rem;
        padding: 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        border-width: 1px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .feedback.error {
        background-color: rgb(254, 226, 226);
        color: rgb(185, 28, 28);
        border-color: rgb(252, 165, 165);
    }
    .feedback.success {
        background-color: rgb(220, 252, 231);
        color: rgb(21, 128, 61);
        border-color: rgb(134, 239, 172);
    }
</style>