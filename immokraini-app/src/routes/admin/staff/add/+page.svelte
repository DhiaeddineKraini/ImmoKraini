<!-- src/routes/admin/staff/add/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types'; 
    import { AlertCircle, CheckCircle } from 'lucide-svelte';

    export let form: ActionData; 

    // Feedback state
    let isSubmitting = false; 
    $: submissionError = form?.error ?? null;
    $: submissionSuccess = form?.success ?? false; 
    $: addedName = form?.addedName ?? ''; 

    // Enhance function
    const handleSubmit: import('@sveltejs/kit').SubmitFunction = () => {
        isSubmitting = true; 
        submissionError = null; 
        submissionSuccess = false;
        addedName = ''; 
        return async ({ result }) => {
            isSubmitting = false; 
            if (result.type === 'success') {
                submissionSuccess = true;
                addedName = result.data?.addedName ?? '';
                const formElement = document.querySelector('form'); 
                formElement?.reset(); // Reset form on success
            } else if (result.type === 'failure') {
                submissionError = result.data?.error || 'Submission failed.';
            } else if (result.type === 'error') {
                submissionError = result.error.message || 'An unexpected error occurred.';
            }
        };
    };

    function clearMessages() {
        submissionError = null;
        submissionSuccess = false;
    }

</script>

<svelte:head>
    <title>Add New Staff | ImmoKraini Admin</title>
</svelte:head>

<div class="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Add New Staff Member</h1>
        <a href="/admin/staff" class="text-sm text-brand-blue hover:underline">← Back to Staff List</a>
    </div>

    {#if submissionError}
        <div class="feedback error"><AlertCircle class="w-5 h-5 flex-shrink-0" /><span>Error: {submissionError}</span></div>
    {/if}
    {#if submissionSuccess}
        <div class="feedback success"><CheckCircle class="w-5 h-5 flex-shrink-0" /><span>Staff member "{addedName}" added successfully!</span></div>
    {/if}

    <form method="POST" use:enhance={handleSubmit} enctype="multipart/form-data" class="space-y-4" on:input={clearMessages}>
        
        <div>
            <label for="name" class="label">Name *</label>
            <input type="text" id="name" name="name" required class="form-input" disabled={isSubmitting} value={form?.name ?? ''}>
        </div>
        <div>
            <label for="email" class="label">Email *</label>
            <input type="email" id="email" name="email" required class="form-input" disabled={isSubmitting} value={form?.email ?? ''}>
        </div>
        <div>
            <label for="phone" class="label">Phone</label>
            <input type="tel" id="phone" name="phone" class="form-input" disabled={isSubmitting} value={form?.phone ?? ''}>
        </div>
        
        <!-- Image Upload -->
        <div>
            <label for="imageUrl" class="label">Profile Photo (Optional)</label>
            <input type="file" id="imageUrl" name="imageUrl" accept="image/*" class="file-input" disabled={isSubmitting}>
        </div>

        <div class="pt-4">
            <button 
                type="submit" 
                disabled={isSubmitting}
                class="w-full bg-brand-blue text-white font-semibold py-2.5 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {#if isSubmitting} 
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> 
                    Adding...
                {:else} 
                    Add Staff Member 
                {/if}
            </button>
        </div>

    </form>
</div>

<style lang="postcss">
    .label { @apply block text-sm font-medium text-gray-700 mb-1; }
    .form-input, .file-input {
        @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .file-input { @apply border p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-blue/10 file:text-brand-blue hover:file:bg-sky-blue/20; }
    .feedback { @apply mb-4 p-3 rounded-md text-sm border flex items-center gap-2; }
    .feedback.error { @apply bg-red-100 text-red-700 border-red-300; }
    .feedback.success { @apply bg-green-100 text-green-700 border-green-300; }
</style>