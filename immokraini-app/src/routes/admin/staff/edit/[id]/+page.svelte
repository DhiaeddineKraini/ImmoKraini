<!-- src/routes/admin/staff/edit/[id]/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types'; 
    import { AlertCircle, CheckCircle } from 'lucide-svelte';

    export let data: PageData; 
    export let form: ActionData; 

    // Initialize form state from loaded data or action data (on error)
    let name = form?.name ?? data?.agent?.name ?? '';
    let email = form?.email ?? data?.agent?.email ?? '';
    let phone = form?.phone ?? data?.agent?.phone ?? '';
    let currentImageUrl = form?.imageUrl ?? data?.agent?.imageUrl ?? ''; // Use specific name

    // Feedback state
    let isSubmitting = false; 
    $: submissionError = form?.error ?? null;
    // Success is handled by redirect in this case

    // Enhance function
    const handleSubmit: import('@sveltejs/kit').SubmitFunction = () => {
        isSubmitting = true; 
        submissionError = null; 
        return async ({ result }) => {
            isSubmitting = false; 
            if (result.type === 'failure' && result.data) {
                // Repopulate form on failure
                const returnedData = result.data;
                name = returnedData.name ?? name;
                email = returnedData.email ?? email;
                phone = returnedData.phone ?? phone;
                currentImageUrl = returnedData.imageUrl ?? currentImageUrl;
            } 
        };
    };

</script>

<svelte:head>
    <title>Edit Staff: {name} | ImmoKraini Admin</title> 
</svelte:head>

<div class="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Edit Staff Member</h1>
        <a href="/admin/staff" class="text-sm text-brand-blue hover:underline">← Back to Staff List</a>
    </div>
    
    {#if submissionError}
        <div class="feedback error"><AlertCircle class="w-5 h-5 flex-shrink-0" /><span>Error: {submissionError}</span></div>
    {/if}
    
    <form method="POST" use:enhance={handleSubmit} enctype="multipart/form-data" class="space-y-4">
        
        <div>
            <label for="name" class="label">Name *</label>
            <input type="text" id="name" name="name" required class="form-input" bind:value={name} disabled={isSubmitting}>
        </div>
        <div>
            <label for="email" class="label">Email *</label>
            <input type="email" id="email" name="email" required class="form-input" bind:value={email} disabled={isSubmitting}>
        </div>
         <div>
            <label for="phone" class="label">Phone</label>
            <input type="tel" id="phone" name="phone" class="form-input" bind:value={phone} disabled={isSubmitting}>
        </div>
        
        <!-- Image Upload -->
         <div class="border-t pt-4 mt-4">
             <label for="imageUrl" class="label">Profile Photo (Upload new to replace)</label>
             <div class="flex items-center gap-4">
                 {#if currentImageUrl}
                    <img src={currentImageUrl} alt="Current photo" class="w-16 h-16 rounded-full object-cover flex-shrink-0">
                 {:else}
                    <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                 {/if}
                 <input type="file" id="imageUrl" name="imageUrl" accept="image/*" class="file-input flex-grow" disabled={isSubmitting}>
                 <input type="hidden" name="currentImageUrl" value={currentImageUrl} /> 
             </div>
         </div>

        <div class="pt-4">
            <button 
                type="submit" 
                disabled={isSubmitting}
                class="w-full bg-brand-orange text-gray-900 font-semibold py-2.5 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
                 {#if isSubmitting} 
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> 
                    Updating...
                {:else} 
                    Update Staff Member 
                {/if}
            </button>
        </div>

    </form>
</div>

<style lang="postcss">
    .label { @apply block text-sm font-medium text-gray-700 mb-1; }
    .form-input, .file-input, select.form-input {
        @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .file-input { @apply border p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-blue/10 file:text-brand-blue hover:file:bg-sky-blue/20; }
    .feedback { @apply mb-4 p-3 rounded-md text-sm border flex items-center gap-2; }
    .feedback.error { @apply bg-red-100 text-red-700 border-red-300; }
    .feedback.success { @apply bg-green-100 text-green-700 border-green-300; }
</style>