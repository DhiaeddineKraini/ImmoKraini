<!-- src/routes/admin/add-property/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';
    import { AlertCircle, CheckCircle } from 'lucide-svelte';
    import { t } from '$lib/i18n/i18n';

    export let form: ActionData; 

    // State for client-side feedback during upload (optional)
    let isUploading = false; 

    // Enhance function to handle file uploads and provide feedback
    const handleSubmit: import('@sveltejs/kit').SubmitFunction = () => {
        isUploading = true; // Show uploading state
        submissionError = null; // Clear previous errors
        submissionSuccess = false;

        return async ({ result, update }) => {
            isUploading = false; // Hide uploading state
            if (result.type === 'success') {
                submissionSuccess = true;
                addedTitle = result.data?.title || '';
                // Optionally reset the form fields here if needed, 
                // but enhance might handle it based on server response.
                // Consider redirecting on success instead.
                const formElement = document.querySelector('form'); // Find form to reset
                formElement?.reset(); // Reset form fields
            } else if (result.type === 'failure') {
                submissionError = result.data?.error || $t('inquiry.error.failed');
            } else if (result.type === 'error') {
                submissionError = result.error.message || $t('inquiry.error.unexpected');
            }
            // update() // Call if you need to refresh page data
        };
    };

    // Local state for feedback messages (needed because enhance clears 'form' prop on success)
    let submissionError: string | null = form?.error ?? null;
    let submissionSuccess = form?.success ?? false;
    let addedTitle = form?.addedTitle ?? '';

    // Clear messages when form data changes (user starts typing again)
    function clearMessages() {
        submissionError = null;
        submissionSuccess = false;
    }
</script>

<svelte:head>
    <title>{$t('admin.properties.addTitle')} | ImmoKraini Admin</title>
</svelte:head>

<div class="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">{$t('admin.properties.addTitle')}</h1>

    {#if submissionError}
        <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-300 flex items-center gap-2">
            <AlertCircle class="w-5 h-5 flex-shrink-0" />
            <span>{$t('admin.staff.error', { error: submissionError })}</span>
        </div>
    {/if}

    {#if submissionSuccess}
         <div class="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-300 flex items-center gap-2">
            <CheckCircle class="w-5 h-5 flex-shrink-0" />
            <span>{$t('admin.properties.addSuccess', { title: addedTitle })}</span>
        </div>
    {/if}

    <!-- Add enctype for file uploads -->
    <!-- Use enhance with custom handleSubmit -->
    <form method="POST" use:enhance={handleSubmit} enctype="multipart/form-data" class="space-y-4" on:input={clearMessages}>
          <div> <label for="title" class="label">{$t('form.titleLabel')} *</label> <input type="text" id="title" name="title" required class="form-input"> </div>
        <div> <label for="slug" class="label">{$t('form.slugLabel')} *</label> <input type="text" id="slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" title="lowercase-letters-numbers-hyphens" class="form-input"> </div>
        <div> <label for="address" class="label">{$t('form.addressLabel')} *</label> <input type="text" id="address" name="address" required class="form-input"> </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div> <label for="price" class="label">{$t('form.priceLabel')} (TND) *</label> <input type="number" id="price" name="price" required min="0" class="form-input"> </div>
            <div> <label for="beds" class="label">{$t('form.bedsLabel')}</label> <input type="number" id="beds" name="beds" min="0" class="form-input"> </div>
            <div> <label for="baths" class="label">{$t('form.bathsLabel')}</label> <input type="number" id="baths" name="baths" min="0" class="form-input"> </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div> <label for="area" class="label">{$t('form.areaLabel')} ({$t('property.sqm')})</label> <input type="number" id="area" name="area" min="0" class="form-input"> </div>
            <div> <label for="propertyType" class="label">{$t('form.propertyTypeLabel')}</label> <input type="text" id="propertyType" name="propertyType" placeholder="e.g., Villa" class="form-input"> </div>
            <div> <label for="yearBuilt" class="label">{$t('form.yearBuiltLabel')}</label> <input type="number" id="yearBuilt" name="yearBuilt" min="1800" max={new Date().getFullYear() + 5} class="form-input"> </div>
        </div>
        <div> <label for="description" class="label">{$t('form.descriptionLabel')}</label> <textarea id="description" name="description" rows="5" class="form-textarea"></textarea> </div>
        <div> <label for="features" class="label">{$t('form.featuresLabel')} ({$t('form.commaLabel')})</label> <input type="text" id="features" name="features" placeholder="e.g., Pool, Garden" class="form-input"> </div>
        <div> <label for="videoUrl" class="label">{$t('form.videoUrlLabel')}</label> <input type="url" id="videoUrl" name="videoUrl" placeholder="e.g., https://youtube.com/embed/..." class="form-input"> </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div> <label for="latitude" class="label">{$t('form.latitudeLabel')}</label> <input type="number" step="any" id="latitude" name="latitude" class="form-input"> </div>
            <div> <label for="longitude" class="label">{$t('form.longitudeLabel')}</label> <input type="number" step="any" id="longitude" name="longitude" class="form-input"> </div>
        </div>
        <div> <label for="agentId" class="label">{$t('form.agentIdLabel')}</label> <input type="text" id="agentId" name="agentId" placeholder="Enter Agent CUID" class="form-input"> </div>
              <div>
            <label for="imageUrl" class="label">{$t('admin.editProperty.mainImage')}</label>
            <input type="file" id="imageUrl" name="imageUrl" accept="image/*" class="file-input">
        </div>

         <div>
            <label for="galleryImages" class="label">{$t('admin.editProperty.galleryImages')}</label>
            <input type="file" id="galleryImages" name="galleryImages" accept="image/*" multiple class="file-input">
        </div>


        <div class="pt-4">
            <button 
                type="submit" 
                disabled={isUploading}
                class="w-full bg-brand-blue text-white font-semibold py-2.5 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
                 {#if isUploading}
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                    {$t('admin.properties.uploading')}
                {:else}
                    {$t('admin.properties.add')}
                {/if}
            </button>
        </div>

    </form>
</div>

<style lang="postcss">
    .label { @apply block text-sm font-medium text-gray-700 mb-1; }
    .form-input, .form-textarea, .file-input {
        @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .form-textarea { @apply min-h-[8rem]; }
    .file-input { @apply border p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-blue/10 file:text-brand-blue hover:file:bg-sky-blue/20; }
    /* Feedback styles */
    .feedback { @apply mb-4 p-3 rounded-md text-sm border flex items-center gap-2; }
    .feedback.error { @apply bg-red-100 text-red-700 border-red-300; }
    .feedback.success { @apply bg-green-100 text-green-700 border-green-300; }
</style>