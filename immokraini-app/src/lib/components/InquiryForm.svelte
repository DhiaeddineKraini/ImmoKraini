<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';
  
    export let propertyTitle = '';
  
    const dispatch = createEventDispatcher();
  
    let submitting = false;
    let submissionError: string | null = null;
    let submissionSuccess = false;
  
    const handleSubmit: SubmitFunction = ({ formData, cancel }) => {
      /* client-side validation */
      if (!formData.get('inquiry-name') || !formData.get('inquiry-email') || !formData.get('inquiry-message')) {
        submissionError = 'Please fill in all required fields.';
        cancel();
        return;
      }
  
      submitting = true;
      submissionError = null;
  
      return async ({ result }) => {
        submitting = false;
  
        if (result.type === 'success') {
          submissionSuccess = true;
          setTimeout(() => dispatch('close'), 3000);
        } else if (result.type === 'failure') {
          submissionError = result.data?.error ?? 'Submission failed.';
        } else if (result.type === 'error') {
          submissionError = result.error.message ?? 'Unexpected error.';
        }
      };
    };
  </script>
  
  {#if submissionSuccess}
    <div class="text-center p-6 bg-green-50 rounded-md">
      <h3 class="text-lg font-medium text-green-800 mb-2">Thank you!</h3>
      <p class="text-green-700">
        Your inquiry about “{propertyTitle}” has been sent successfully.
      </p>
    </div>
  {:else}
    <form
      method="POST"
      action="?/inquire"
      use:enhance={handleSubmit}
      class="space-y-4"
    >
      <h3 class="text-xl font-semibold text-gray-800 mb-4">
        Inquire about “{propertyTitle}”
      </h3>
  
      <input type="hidden" name="propertyTitle" value={propertyTitle} />
  
      {#if submissionError}
        <div class="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {submissionError}
        </div>
      {/if}
  
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium mb-1" for="inquiry-name">Name *</label>
        <input
          id="inquiry-name"
          name="inquiry-name"
          required
          class="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-blue disabled:opacity-50"
          disabled={submitting}
        />
      </div>
  
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium mb-1" for="inquiry-email">Email *</label>
        <input
          id="inquiry-email"
          name="inquiry-email"
          type="email"
          required
          class="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-blue disabled:opacity-50"
          disabled={submitting}
        />
      </div>
  
      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium mb-1" for="inquiry-phone"
          >Phone (optional)</label
        >
        <input
          id="inquiry-phone"
          name="inquiry-phone"
          type="tel"
          class="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-blue disabled:opacity-50"
          disabled={submitting}
        />
      </div>
  
      <!-- Message -->
      <div>
        <label class="block text-sm font-medium mb-1" for="inquiry-message"
          >Message *</label
        >
        <textarea
          id="inquiry-message"
          name="inquiry-message"
          rows="4"
          required
          placeholder="I'd like more information about this property…"
          class="w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-blue disabled:opacity-50"
          disabled={submitting}
        />
      </div>
  
      <!-- Submit -->
      <button
        type="submit"
        disabled={submitting}
        class="w-full bg-brand-blue text-white font-semibold py-2.5 rounded-md shadow flex items-center justify-center disabled:opacity-60"
      >
        {#if submitting}
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Sending…
        {:else}
          Send Inquiry
        {/if}
      </button>
    </form>
  {/if}
  