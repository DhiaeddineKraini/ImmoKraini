<script lang="ts">
    import { enhance } from '$app/forms'; // <<< Import enhance
    import type { SubmitFunction } from '@sveltejs/kit'; // <<< Import type
    import { CheckCircle, AlertCircle } from 'lucide-svelte';

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
            submissionError = 'Please fill in required fields (Name, Email, Message).';
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
                submissionError = result.data?.contactError || 'Submission failed.'; 
            } else if (result.type === 'error') {
                submissionError = result.error.message || 'An unexpected error occurred.';
            }
            submitting = false;
        };
    };

</script>

{#if submissionSuccess}
	<div class="text-center p-6 bg-green-100 rounded-md border border-green-300">
        <CheckCircle class="w-12 h-12 text-green-600 mx-auto mb-3" />
		<h3 class="text-lg font-medium text-green-800 mb-2">Message Sent!</h3>
		<p class="text-green-700">Thank you for contacting us. We'll get back to you soon.</p>
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
            <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" id="contact-name" name="contact-name" bind:value={name} required disabled={submitting} placeholder="Your Name" class="form-input" />
        </div>
        <div>
            <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" id="contact-email" name="contact-email" bind:value={email} required disabled={submitting} placeholder="your.email@example.com" class="form-input" />
        </div>
        <div>
            <label for="contact-subject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" id="contact-subject" name="contact-subject" bind:value={subject} disabled={submitting} placeholder="Inquiry Subject" class="form-input" />
        </div>
        <div>
            <label for="contact-message" class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea id="contact-message" name="contact-message" rows="4" bind:value={message} required disabled={submitting} placeholder="How can we help you?" class="form-textarea"></textarea>
        </div>
        <div class="pt-1">
            <button type="submit" disabled={submitting} class="w-full bg-brand-orange text-gray-900 font-semibold py-2.5 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
                {#if submitting} <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Sending...
                {:else} Send Message {/if}
            </button>
        </div>
	</form>
{/if}

<style lang="postcss">
	.form-input, .form-textarea { @apply w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50 disabled:opacity-50; }
	.form-textarea { @apply min-h-[6rem]; }
</style>