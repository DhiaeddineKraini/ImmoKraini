<!-- src/routes/admin/add-property/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types'; // <<< Ensure this is imported
    import { AlertCircle, CheckCircle } from 'lucide-svelte';

    // Type the form prop correctly using ActionData
    export let form: ActionData; 

    // No need for separate state if we use form?.data for repopulation
</script>

<svelte:head>
    <title>Add New Property | ImmoKraini Admin</title>
</svelte:head>

<div class="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Add New Property Listing</h1>


    {#if form?.error}
        <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-300 flex items-center gap-2">
            <AlertCircle class="w-5 h-5 flex-shrink-0" />
            <span>Error: {form.error}</span> 
        </div>
    {/if}

    {#if form?.success}
         <div class="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-300 flex items-center gap-2">
            <CheckCircle class="w-5 h-5 flex-shrink-0" />
            <span>Property "{form.addedTitle}" added successfully!</span> 
        </div>
    {/if}

    <!-- Use progressive enhancement -->
    <form method="POST" use:enhance class="space-y-4">
        
        <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
         
            <input type="text" id="title" name="title" required class="form-input" value={form?.data?.title ?? ''}>
        </div>

        <div>
            <label for="slug" class="block text-sm font-medium text-gray-700 mb-1">Slug * (Unique URL part, e.g., 'villa-sea-view-midoun')</label>
            <input type="text" id="slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="Use lowercase letters, numbers, and hyphens only" class="form-input" value={form?.data?.slug ?? ''}>
        </div>

        <div>
            <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input type="text" id="address" name="address" required class="form-input" value={form?.data?.address ?? ''}>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price (TND) *</label>
                <input type="number" id="price" name="price" required min="0" class="form-input" value={form?.data?.price ?? ''}>
            </div>
             <div>
                <label for="beds" class="block text-sm font-medium text-gray-700 mb-1">Beds</label>
                <input type="number" id="beds" name="beds" min="0" class="form-input" value={form?.data?.beds ?? ''}>
            </div>
             <div>
                <label for="baths" class="block text-sm font-medium text-gray-700 mb-1">Baths</label>
                <input type="number" id="baths" name="baths" min="0" class="form-input" value={form?.data?.baths ?? ''}>
            </div>
        </div>

         <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div>
                <label for="area" class="block text-sm font-medium text-gray-700 mb-1">Area (sqm)</label>
                <input type="number" id="area" name="area" min="0" class="form-input" value={form?.data?.area ?? ''}>
            </div>
             <div>
                <label for="propertyType" class="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <input type="text" id="propertyType" name="propertyType" placeholder="e.g., Villa, Apartment" class="form-input" value={form?.data?.propertyType ?? ''}>
            </div>
             <div>
                <label for="yearBuilt" class="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                <input type="number" id="yearBuilt" name="yearBuilt" min="1800" max={new Date().getFullYear() + 5} class="form-input" value={form?.data?.yearBuilt ?? ''}>
            </div>
        </div>

        <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="5" class="form-textarea">{form?.data?.description ?? ''}</textarea>
        </div>

         <div>
            <label for="features" class="block text-sm font-medium text-gray-700 mb-1">Features (Comma-separated)</label>
            <input type="text" id="features" name="features" placeholder="e.g., Pool, Garden, Sea View" class="form-input" value={form?.data?.features ?? ''}>
        </div>

         <div>
            <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" placeholder="e.g., /property-main.jpg" class="form-input" value={form?.data?.imageUrl ?? ''}>
        </div>

         <div>
            <label for="galleryImages" class="block text-sm font-medium text-gray-700 mb-1">Gallery Image URLs (Comma-separated)</label>
            <input type="text" id="galleryImages" name="galleryImages" placeholder="e.g., /img1.jpg, /img2.jpg" class="form-input" value={form?.data?.galleryImages ?? ''}>
        </div>
         <div>
            <label for="videoUrl" class="block text-sm font-medium text-gray-700 mb-1">Video URL (Embed Link)</label>
            <input type="url" id="videoUrl" name="videoUrl" placeholder="e.g., https://youtube.com/embed/..." class="form-input" value={form?.data?.videoUrl ?? ''}>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
                <label for="latitude" class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input type="number" step="any" id="latitude" name="latitude" class="form-input" value={form?.data?.latitude ?? ''}>
            </div>
             <div>
                <label for="longitude" class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input type="number" step="any" id="longitude" name="longitude" class="form-input" value={form?.data?.longitude ?? ''}>
            </div>
        </div>
        
        <div>
             <label for="agentId" class="block text-sm font-medium text-gray-700 mb-1">Agent ID (Temporary)</label>
             <input type="text" id="agentId" name="agentId" placeholder="Enter Agent CUID manually" class="form-input" value={form?.data?.agentId ?? ''}>
      
        </div>


        <div class="pt-4">
            <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2.5 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                Add Property
            </button>
        </div>

    </form>
</div>

<style lang="postcss">
    .form-input, .form-textarea {
        @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50 text-sm;
    }
    .form-textarea {
        @apply min-h-[8rem]; 
    }
</style>