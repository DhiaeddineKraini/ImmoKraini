<script lang="ts">
    import { enhance } from '$app/forms'; // <<< Import enhance
    import type { SubmitFunction } from '@sveltejs/kit'; // <<< Import type
    import { CheckCircle, AlertCircle } from 'lucide-svelte';
    import { t } from'$lib/i18n/i18n.js'; // Import translation store


	// Form field state
	let name = '';
	let email = '';
	let subject = '';
	let message = '';
	
    // Submission state - managed by enhance callback
    let submitting = false;
    let submissionError: string | null = null;
    let submissionSuccess = false;

    // Enhance function to handle form submission feedback
    const handleSubmit: SubmitFunction = async ({ formData, cancel }) => {
        submitting = true;
        submissionError = null;
        submissionSuccess = false;

        // Store values in case of error
        name = formData.get('contact-name') as string;
        email = formData.get('contact-email') as string;
        subject = formData.get('contact-subject') as string;
        message = formData.get('contact-message') as string;

        // Client-side validation
        if (!name || !email || !message) {
            submissionError = $t('form.error.required');
            submitting = false;
            cancel(); // Use the provided cancel function
            return;
        }

        return async ({ result }) => {
            if (result.type === 'success') {
                submissionSuccess = true;
                name = ''; email = ''; subject = ''; message = ''; // Clear form
            } else if (result.type === 'failure') {
                // Use the specific error key we defined in the action
                submissionError = result.data?.contactError || $t('form.error.failed'); 
            } else if (result.type === 'error') {
                submissionError = result.error.message || $t('form.error.unexpected');
            }
            submitting = false;
        };
    };

</script>

{#if submissionSuccess}
	<div class="text-center p-6 bg-green-100 rounded-md border border-green-300">
        <CheckCircle class="w-12 h-12 text-green-600 mx-auto mb-3" />
		<h3 class="text-lg font-medium text-green-800 mb-2">{$t('form.successTitle')}</h3>
		<p class="text-green-700">{$t('form.successBody')}</p>
	</div>
{:else}
    <!-- Add method="POST" and use:enhance -->
	<form 
        method="POST" 
        use:enhance={handleSubmit} 
        class="space-y-4"
    >
		{#if submissionError}
			<div class="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-300 flex items-center gap-2">
                <AlertCircle class="w-5 h-5 flex-shrink-0" />
				<span>{submissionError}</span>
			</div>
		{/if}

        <div>
            <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-1">{$t('form.nameLabel')}</label>
            <input type="text" id="contact-name" name="contact-name" bind:value={name} required disabled={submitting} placeholder="{$t('form.namePlaceholder')}" class="form-input" />
        </div>
        <div>
            <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-1">{$t('form.emailLabel')}</label>
            <input type="email" id="contact-email" name="contact-email" bind:value={email} required disabled={submitting} placeholder="{$t('form.emailPlaceholder')}" class="form-input" />
        </div>
        <div>
            <label for="contact-subject" class="block text-sm font-medium text-gray-700 mb-1">{$t('form.subjectLabel')}</label>
            <input type="text" id="contact-subject" name="contact-subject" bind:value={subject} disabled={submitting} placeholder="{$t('form.subjectPlaceholder')}" class="form-input" />
        </div>
        <div>
            <label for="contact-message" class="block text-sm font-medium text-gray-700 mb-1">{$t('form.messageLabel')}</label>
            <textarea id="contact-message" name="contact-message" rows="4" bind:value={message} required disabled={submitting} placeholder="{$t('form.messagePlaceholder')}" class="form-textarea"></textarea>
        </div>
        <div class="pt-1">
            <button type="submit" disabled={submitting} class="w-full bg-brand-orange text-gray-900 font-semibold py-2.5 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center group">
                {#if submitting} 
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg> 
                   {$t('form.sending')}
                {:else} 
                    <span class="flex items-center">
                        {$t('form.send')}
                        <svg class="w-5 h-5 ml-2 transform translate-x-0 opacity-0 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                {/if}
            </button>
        </div>
	</form>
{/if}

<style lang="postcss">
	.form-input, .form-textarea { @apply w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50 disabled:opacity-50; }
	.form-textarea { @apply min-h-[6rem]; }
</style>