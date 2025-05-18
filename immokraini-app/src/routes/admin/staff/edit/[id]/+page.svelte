<!-- src/routes/admin/staff/edit/[id]/+page.svelte -->
<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import type { PageData, ActionData } from './$types'; 
    import { AlertCircle, CheckCircle } from 'lucide-svelte';
    import { t } from '$lib/i18n/i18n.js'; // Import translation store

    export let data: PageData; 
    export let form: ActionData & {
        errorCode?: string;
        name?: string;
        email?: string;
        phone?: string | null;
        imageUrl?: string | null;
    }; 

    // Initialize form state from loaded data or action data (on error)
    let name = form?.name ?? data?.agent?.name ?? '';
    let email = form?.email ?? data?.agent?.email ?? '';
    let phone = form?.phone ?? data?.agent?.phone ?? '';
    let currentImageUrl = form?.imageUrl ?? data?.agent?.imageUrl ?? ''; // Use specific name

    // Feedback state
    let isSubmitting = false; 
    $: submissionError = form?.error ?? '';
    $: errorCode = form?.errorCode ?? undefined;
    $: submissionSuccess = form && !form.error;

    // Function to get error message based on error code
    function getErrorMessage(code: string | undefined, defaultMessage: string): string {
        switch (code) {
            case 'INVALID_ID':
                return 'Invalid staff ID provided.';
            case 'NOT_FOUND':
                return 'The staff member you are trying to edit no longer exists.';
            case 'DUPLICATE_EMAIL':
                return 'This email address is already in use by another staff member.';
            case 'INVALID_EMAIL':
                return 'Please enter a valid email address.';
            case 'INVALID_IMAGE':
                return 'Invalid image format or size. Please try a different image.';
            case 'SERVER_ERROR':
                return 'An unexpected error occurred. Please try again later.';
            default:
                return defaultMessage;
        }
    }

    // Enhance function
    const handleSubmit: import('@sveltejs/kit').SubmitFunction = () => {
        isSubmitting = true; 
        submissionError = ''; 
        return async ({ result }) => {
            isSubmitting = false; 
            if (result.type === 'failure' && result.data) {
                // Repopulate form on failure
                const returnedData = result.data;
                name = returnedData.name ?? name;
                email = returnedData.email ?? email;
                phone = returnedData.phone ?? phone;
                currentImageUrl = returnedData.imageUrl ?? currentImageUrl;
            } else if (result.type === 'success') {
                await invalidateAll();
            }
        };
    };

</script>

<svelte:head>
    <title>{$t('admin.staff.editTitle')}: {name} | ImmoKraini Admin</title> 
</svelte:head>

<div class="max-w-xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">{$t('admin.staff.editTitle')}</h1>
        <a href="/admin/staff" class="text-sm text-brand-blue hover:underline">{$t('admin.staff.back')}</a>
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
            <span>{$t('admin.staff.editSuccess', { name })}</span>
        </div>
    {/if}
    
    <form method="POST" use:enhance={handleSubmit} enctype="multipart/form-data" class="space-y-4">
        
        <div>
            <label for="name" class="label">{$t('admin.staff.name')}</label>
            <input type="text" id="name" name="name" required class="form-input" bind:value={name} disabled={isSubmitting}>
        </div>
        <div>
            <label for="email" class="label">{$t('admin.staff.email')}</label>
            <input type="email" id="email" name="email" required class="form-input" bind:value={email} disabled={isSubmitting}>
        </div>
         <div>
            <label for="phone" class="label">{$t('admin.staff.phone')}</label>
            <input type="tel" id="phone" name="phone" class="form-input" bind:value={phone} disabled={isSubmitting}>
        </div>
        
        <!-- Image Upload -->
         <div class="border-t pt-4 mt-4">
             <label for="imageUrl" class="label">{$t('admin.staff.photo')}</label>
             <div class="flex items-center gap-4">
                 {#if currentImageUrl}
                    <img src={currentImageUrl} alt="Current photo" class="w-16 h-16 rounded-full object-cover flex-shrink-0">
                 {:else}
                    <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">{$t('admin.staff.noPhoto')}</div>
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
                    {$t('admin.staff.updating')}
                {:else} 
                    {$t('admin.staff.update')} 
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