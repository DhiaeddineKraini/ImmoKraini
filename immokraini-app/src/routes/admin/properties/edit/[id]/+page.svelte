<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types'; // Use $types again
    import { AlertCircle, CheckCircle } from 'lucide-svelte';
    import type { Agent } from '@prisma/client'; 

    export let data: PageData; 
    export let form: ActionData; 

    // --- Initialize Form State Directly from Props ---
    // Use 'let' for variables bound to form inputs
    let title = form?.data?.title ?? data?.property?.title ?? '';
    let slug = form?.data?.slug ?? data?.property?.slug ?? '';
    let address = form?.data?.address ?? data?.property?.address ?? '';
    let price = form?.data?.price ?? data?.property?.price ?? '';
    let beds = form?.data?.beds ?? data?.property?.beds ?? '';
    let baths = form?.data?.baths ?? data?.property?.baths ?? '';
    let area = form?.data?.area ?? data?.property?.area ?? '';
    let propertyType = form?.data?.propertyType ?? data?.property?.propertyType ?? '';
    let yearBuilt = form?.data?.yearBuilt ?? data?.property?.yearBuilt ?? '';
    let description = form?.data?.description ?? data?.property?.description ?? '';
    let features = form?.data?.features ?? data?.property?.features ?? ''; 
    let videoUrl = form?.data?.videoUrl ?? data?.property?.videoUrl ?? '';
    let latitude = form?.data?.latitude ?? data?.property?.latitude ?? '';
    let longitude = form?.data?.longitude ?? data?.property?.longitude ?? '';
    let agentId = form?.data?.agentId ?? data?.property?.agentId ?? '';
    let currentImageUrl = data?.property?.currentImageUrl ?? ''; // Only from load data
    let currentGalleryString = data?.property?.currentGalleryString ?? ''; // Only from load data
    // --- End Form State Initialization ---


    // --- Feedback and Submission State ---
    let isSubmitting = false; // Normal variable, not reactive declaration
    // Derive feedback directly from form prop reactively
    $: submissionError = form?.error ?? null;
    $: submissionSuccess = form && !form.error; // Success when form exists and has no error
    $: updatedTitle = form?.data?.title ?? ''; // Get title from form data instead
    // --- End Feedback State ---


    // Enhance function
    const handleSubmit: import('@sveltejs/kit').SubmitFunction = () => {
        isSubmitting = true; 
        // Clear previous feedback state immediately
        submissionError = null; 
        submissionSuccess = false;
        updatedTitle = ''; 

        return async ({ result, update }) => {
            isSubmitting = false; // Reset submitting state AFTER response
            
            // If submission failed and returned data, update local state
            // Note: 'form' prop updates automatically, so this might be redundant
            // if reactive declarations were used correctly, but let's be explicit
            if (result.type === 'failure' && result.data?.data) {
                const returnedData = result.data.data;
                title = returnedData.title ?? title;
                slug = returnedData.slug ?? slug;
                address = returnedData.address ?? address;
                price = returnedData.price ?? price;
                beds = returnedData.beds ?? beds;
                baths = returnedData.baths ?? baths;
                area = returnedData.area ?? area;
                propertyType = returnedData.propertyType ?? propertyType;
                yearBuilt = returnedData.yearBuilt ?? yearBuilt;
                description = returnedData.description ?? description;
                features = returnedData.features ?? features;
                videoUrl = returnedData.videoUrl ?? videoUrl;
                latitude = returnedData.latitude ?? latitude;
                longitude = returnedData.longitude ?? longitude;
                agentId = returnedData.agentId ?? agentId;
                // Don't reset image URLs from form failure data
            } else if (result.type === 'success') {
                 // Optionally clear form on success if not redirecting
                 // title = ''; slug = ''; address = ''; price = ''; // etc.
            }
            
            // update() // Call if you need to refresh page data from load function
        };
    };

</script>

<!-- Template remains the same, using bind:value={variableName} -->
<svelte:head>
    <title>Edit: {title} | ImmoKraini Admin</title> 
</svelte:head>

<div class="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Edit Property</h1>
        <a href="/admin/properties" class="text-sm text-brand-blue hover:underline">← Back to List</a>
    </div>
    
    {#if submissionError}
        <div class="feedback error"><AlertCircle class="w-5 h-5 flex-shrink-0" /><span>Error: {submissionError}</span></div>
    {/if}
    {#if submissionSuccess} 
         <div class="feedback success"><CheckCircle class="w-5 h-5 flex-shrink-0" /><span>Property "{updatedTitle}" updated successfully!</span></div>
    {/if}

    <form method="POST" use:enhance={handleSubmit} enctype="multipart/form-data" class="space-y-4">
        
        <div> <label for="title" class="label">Title *</label> <input type="text" id="title" name="title" required class="form-input" bind:value={title} disabled={isSubmitting}> </div>
        <div> <label for="slug" class="label">Slug *</label> <input type="text" id="slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="lowercase-letters-numbers-hyphens" class="form-input" bind:value={slug} disabled={isSubmitting}> </div>
        <div> <label for="address" class="label">Address *</label> <input type="text" id="address" name="address" required class="form-input" bind:value={address} disabled={isSubmitting}> </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div> <label for="price" class="label">Price (TND) *</label> <input type="number" id="price" name="price" required min="0" class="form-input" bind:value={price} disabled={isSubmitting}> </div>
            <div> <label for="beds" class="label">Beds</label> <input type="number" id="beds" name="beds" min="0" class="form-input" bind:value={beds} disabled={isSubmitting}> </div>
            <div> <label for="baths" class="label">Baths</label> <input type="number" id="baths" name="baths" min="0" class="form-input" bind:value={baths} disabled={isSubmitting}> </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div> <label for="area" class="label">Area (sqm)</label> <input type="number" id="area" name="area" min="0" class="form-input" bind:value={area} disabled={isSubmitting}> </div>
            <div> <label for="propertyType" class="label">Property Type</label> <input type="text" id="propertyType" name="propertyType" placeholder="e.g., Villa" class="form-input" bind:value={propertyType} disabled={isSubmitting}> </div>
            <div> <label for="yearBuilt" class="label">Year Built</label> <input type="number" id="yearBuilt" name="yearBuilt" min="1800" max={new Date().getFullYear() + 5} class="form-input" bind:value={yearBuilt} disabled={isSubmitting}> </div>
        </div>
        <div> <label for="description" class="label">Description</label> <textarea id="description" name="description" rows="5" class="form-textarea" bind:value={description} disabled={isSubmitting}></textarea> </div>
        <div> <label for="features" class="label">Features (Comma-separated)</label> <input type="text" id="features" name="features" placeholder="e.g., Pool, Garden" class="form-input" bind:value={features} disabled={isSubmitting}> </div>
        <div> <label for="videoUrl" class="label">Video URL (Embed Link)</label> <input type="url" id="videoUrl" name="videoUrl" placeholder="e.g., https://youtube.com/embed/..." class="form-input" bind:value={videoUrl} disabled={isSubmitting}> </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div> <label for="latitude" class="label">Latitude</label> <input type="number" step="any" id="latitude" name="latitude" class="form-input" bind:value={latitude} disabled={isSubmitting}> </div>
            <div> <label for="longitude" class="label">Longitude</label> <input type="number" step="any" id="longitude" name="longitude" class="form-input" bind:value={longitude} disabled={isSubmitting}> </div>
        </div>
        
        <!-- Agent Dropdown -->
        <div>
             <label for="agentId" class="label">Assigned Agent</label>
             <select id="agentId" name="agentId" class="form-input" bind:value={agentId} disabled={isSubmitting}>
                 <option value="">-- Select Agent --</option>
                 {#if data?.agents} 
                     {#each data.agents as agent (agent.id)} <option value={agent.id}>{agent.name}</option> {/each}
                 {:else} <option disabled>Could not load agents</option> {/if}
             </select>
        </div>

        <div class="border-t pt-4 mt-4">
            <p class="text-sm text-gray-600 mb-2">Upload new images to replace existing ones (optional):</p>
            <div> <label for="imageUrl" class="label">Replace Main Image</label> <input type="file" id="imageUrl" name="imageUrl" accept="image/*" class="file-input" disabled={isSubmitting}> {#if currentImageUrl} <span class="text-xs text-gray-500 ml-2">Current: <a href={currentImageUrl} target="_blank" class="hover:underline">View</a></span>{/if} <input type="hidden" name="currentImageUrl" value={currentImageUrl} /> </div>
             <div> <label for="galleryImages" class="label">Replace Gallery Images</label> <input type="file" id="galleryImages" name="galleryImages" accept="image/*" multiple class="file-input" disabled={isSubmitting}> {#if currentGalleryString} <span class="text-xs text-gray-500 ml-2">({currentGalleryString.split(',').length} current images)</span>{/if} <input type="hidden" name="currentGalleryString" value={currentGalleryString} /> </div>
        </div>


        <div class="pt-4">
            <button type="submit" disabled={isSubmitting} class="w-full bg-brand-orange text-gray-900 font-semibold py-2.5 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
                 {#if isSubmitting} <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Updating...
                {:else} Update Property {/if}
            </button>
        </div>

    </form>
</div>

<style lang="postcss">
    /* ... existing styles ... */
    .label { @apply block text-sm font-medium text-gray-700 mb-1; }
    .form-input, .form-textarea, .file-input, select.form-input { @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed; }
    .form-textarea { @apply min-h-[8rem]; }
    .file-input { @apply border p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-blue/10 file:text-brand-blue hover:file:bg-sky-blue/20; }
    .feedback { @apply mb-4 p-3 rounded-md text-sm border flex items-center gap-2; }
    .feedback.error { @apply bg-red-100 text-red-700 border-red-300; }
    .feedback.success { @apply bg-green-100 text-green-700 border-green-300; }
</style>