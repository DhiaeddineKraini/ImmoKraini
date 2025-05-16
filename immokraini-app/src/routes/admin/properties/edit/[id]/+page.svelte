<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import type { PageData, ActionData } from './$types'; // Use $types again
    import { AlertCircle, CheckCircle } from 'lucide-svelte';
    import type { Agent } from '@prisma/client'; 
    import { onDestroy } from 'svelte';

    export let data: PageData; 
    export let form: ActionData & { 
        errorCode?: string;
        data?: {
            title: string;
            slug: string;
            address: string;
            price: number;
            beds: number | null;
            baths: number | null;
            area: number | null;
            propertyType: string | null;
            yearBuilt: number | null;
            description: string | null;
            featuresString: string;
            videoUrl: string | null;
            latitude: number | null;
            longitude: number | null;
            agentId: string | null;
            currentImageUrl: string;
            galleryImagesString: string;
        }
    }; 

    // --- Initialize Form State Directly from Props ---
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
    let features = form?.data?.featuresString ?? data?.property?.featuresString ?? ''; 
    let videoUrl = form?.data?.videoUrl ?? data?.property?.videoUrl ?? '';
    let latitude = form?.data?.latitude ?? data?.property?.latitude ?? '';
    let longitude = form?.data?.longitude ?? data?.property?.longitude ?? '';
    let agentId = form?.data?.agentId ?? data?.property?.agentId ?? '';
    let currentImageUrl = data?.property?.currentImageUrl ?? '';
    let currentGalleryString = data?.property?.galleryImagesString ?? '';
    $: currentGalleryImages = currentGalleryString ? currentGalleryString.split(',').map(url => url.trim()).filter(url => url) : [];

    let imagesToDelete = new Set<string>();

    function toggleImageForDeletion(imageUrl: string) {
        if (imagesToDelete.has(imageUrl)) {
            imagesToDelete.delete(imageUrl);
        } else {
            imagesToDelete.add(imageUrl);
        }
        imagesToDelete = new Set(imagesToDelete); 
    }

    // --- Staging for New Gallery Images ---
    interface StagedFile {
        file: File;
        previewUrl: string;
        id: string;
    }
    let stagedNewGalleryFiles: StagedFile[] = [];

    function handleNewGalleryFilesSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        // Clear and revoke old staged files' preview URLs
        stagedNewGalleryFiles.forEach(sf => URL.revokeObjectURL(sf.previewUrl));
        stagedNewGalleryFiles = [];

        if (input.files) {
            for (const file of Array.from(input.files)) {
                stagedNewGalleryFiles.push({
                    file: file,
                    previewUrl: URL.createObjectURL(file),
                    id: crypto.randomUUID()
                });
            }
            stagedNewGalleryFiles = [...stagedNewGalleryFiles]; // Trigger reactivity
            input.value = ''; // Clear the file input so change event fires again if same files are re-selected after removal
        }
    }

    function removeStagedGalleryFile(fileId: string) {
        const fileToRemove = stagedNewGalleryFiles.find(sf => sf.id === fileId);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
            stagedNewGalleryFiles = stagedNewGalleryFiles.filter(sf => sf.id !== fileId);
        }
    }

    onDestroy(() => {
        stagedNewGalleryFiles.forEach(sf => URL.revokeObjectURL(sf.previewUrl));
    });
    // --- End Form State Initialization & Staging ---


    // --- Feedback and Submission State ---
    let isSubmitting = false;
    $: submissionError = form?.error ?? '';
    $: errorCode = form?.errorCode ?? undefined;
    $: submissionSuccess = form && !form.error;
    $: updatedTitle = form?.data?.title ?? '';

    function getErrorMessage(code: string | undefined, defaultMessage: string): string {
        switch (code) {
            case 'INVALID_ID': return 'Invalid property ID provided.';
            case 'NOT_FOUND': return 'The property you are trying to edit no longer exists.';
            case 'DUPLICATE_SLUG': return 'A property with this slug already exists.';
            case 'INVALID_SLUG': return 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.';
            case 'INVALID_IMAGE': return 'Invalid image format or size. Please try a different image.';
            case 'SERVER_ERROR': return 'An unexpected error occurred. Please try again later.';
            default: return defaultMessage;
        }
    }

    const handleSubmit: import('@sveltejs/kit').SubmitFunction = ({formData}) => {
        isSubmitting = true;
        submissionError = '';

        // Remove the potentially existing 'newGalleryImageFiles' from formData
        // as we are manually appending the curated staged files.
        formData.delete('newGalleryImageFiles'); 
        
        // Append staged gallery files to FormData
        for (const stagedFile of stagedNewGalleryFiles) {
            formData.append('newGalleryImageFiles', stagedFile.file, stagedFile.file.name);
        }
        
        // Ensure imagesToDeleteUrls is correctly populated from the Set
        formData.set('imagesToDeleteUrls', Array.from(imagesToDelete).join(','));

        return async ({ result }) => {
            isSubmitting = false;
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
                features = returnedData.features ?? features; // Ensure this is featuresString if that's what server expects for repopulation
                videoUrl = returnedData.videoUrl ?? videoUrl;
                latitude = returnedData.latitude ?? latitude;
                longitude = returnedData.longitude ?? longitude;
                agentId = returnedData.agentId ?? agentId;
                // Note: Staged files are not cleared on failure, allowing user to correct other errors and resubmit.
            } else if (result.type === 'success') {
                // Clear staged files and their previews on successful submission
                stagedNewGalleryFiles.forEach(sf => URL.revokeObjectURL(sf.previewUrl));
                stagedNewGalleryFiles = [];
                imagesToDelete.clear(); // Clear the set of images marked for deletion from server
                await invalidateAll(); // Reload data from server
            }
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
        <div class="feedback error">
            <AlertCircle class="w-5 h-5 flex-shrink-0" />
            <span>{getErrorMessage(errorCode, submissionError || 'An error occurred')}</span>
        </div>
    {/if}
    {#if submissionSuccess} 
        <div class="feedback success">
            <CheckCircle class="w-5 h-5 flex-shrink-0" />
            <span>Property "{updatedTitle}" updated successfully!</span>
        </div>
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
            <h3 class="text-lg font-medium text-gray-800 mb-3">Manage Images</h3>
            
            <!-- Main Image -->
            <div>
                <label class="label">Main Image</label>
                {#if currentImageUrl}
                    <div class="mb-2 flex items-center space-x-2">
                        <img src={currentImageUrl} alt="Main property image" class="h-20 w-20 object-cover rounded-md border" />
                        <a href={currentImageUrl} target="_blank" class="text-xs text-brand-blue hover:underline">View</a>
                        <button type="button" on:click={() => toggleImageForDeletion(currentImageUrl)} 
                                class:selectedForDeletion={imagesToDelete.has(currentImageUrl)}
                                class="text-xs px-2 py-1 rounded-md border hover:bg-red-50 
                                       {imagesToDelete.has(currentImageUrl) ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-gray-600 border-gray-300'}">
                            {imagesToDelete.has(currentImageUrl) ? 'Undo Delete' : 'Delete Main Image'}
                        </button>
                    </div>
                {/if}
                <div>
                    <label for="newMainImageFile" class="label text-sm">{currentImageUrl ? 'Upload New to Replace' : 'Upload Main Image'}</label>
                    <input type="file" id="newMainImageFile" name="newMainImageFile" accept="image/*" class="file-input text-sm" disabled={isSubmitting}>
                </div>
            </div>

            <!-- Gallery Images -->
            <div class="mt-4">
                <label class="label">Gallery Images</label>
                {#if currentGalleryImages.length > 0}
                    <p class="text-xs text-gray-500 mb-2">Current gallery ({currentGalleryImages.length} images). Click an image to mark for deletion.</p>
                    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                        {#each currentGalleryImages as imageUrl, index (imageUrl)}
                            <div class="relative group">
                                <img src={imageUrl} alt={`Gallery image ${index + 1}`} class="h-20 w-full object-cover rounded-md border {imagesToDelete.has(imageUrl) ? 'opacity-50 ring-2 ring-red-500' : 'opacity-100'}" />
                                <button type="button" 
                                        on:click={() => toggleImageForDeletion(imageUrl)}
                                        class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-xs leading-none w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100">
                                    &times;
                                </button>
                                {#if imagesToDelete.has(imageUrl)}
                                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                        <span class="text-white text-xs font-semibold">Marked for Deletion</span>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
                
                <!-- Staging area for New Gallery Images -->
                <div class="mt-3">
                    <label for="newGalleryImageFilesInput" class="label text-sm">Add New Gallery Images</label>
                    <input type="file" id="newGalleryImageFilesInput" accept="image/*" multiple class="file-input text-sm" on:change={handleNewGalleryFilesSelect} disabled={isSubmitting}>
                </div>

                {#if stagedNewGalleryFiles.length > 0}
                    <div class="mt-3 pt-3 border-t border-gray-200">
                        <p class="text-xs font-medium text-gray-700 mb-2">Selected new images for gallery ({stagedNewGalleryFiles.length}):</p>
                        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                            {#each stagedNewGalleryFiles as stagedFile (stagedFile.id)}
                                <div class="relative group">
                                    <img src={stagedFile.previewUrl} alt={`Preview ${stagedFile.file.name}`} class="h-20 w-full object-cover rounded-md border" />
                                    <button type="button" 
                                            on:click={() => removeStagedGalleryFile(stagedFile.id)}
                                            title="Remove this image before uploading"
                                            class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-xs leading-none w-5 h-5 flex items-center justify-center opacity-70 group-hover:opacity-100 hover:bg-red-700 transition-opacity">
                                        &times;
                                    </button>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
            <!-- Hidden input to submit URLs of images to delete -->
            <input type="hidden" name="imagesToDeleteUrls" value={Array.from(imagesToDelete).join(',')} />
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

    .selectedForDeletion {
        @apply bg-red-100 text-red-700 border-red-300 hover:bg-red-200;
    }
</style>