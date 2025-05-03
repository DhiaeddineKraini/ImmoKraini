<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition'; 
	import { X } from 'lucide-svelte'; 

	export let showModal: boolean = false;

	const dispatch = createEventDispatcher();

	function closeModal() {
		dispatch('close'); 
	}

	// Close modal if Escape key is pressed AND modal is shown
	function handleKeydown(event: KeyboardEvent) {
		if (showModal && event.key === 'Escape') { 
			closeModal();
		}
	}

	// Close modal if backdrop is clicked
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeModal();
		}
	}
</script>

<!-- Listen for keydown events on the window ALWAYS -->
<svelte:window on:keydown={handleKeydown} />

<!-- Conditionally render the modal structure -->
{#if showModal}
	<!-- Ignore the a11y warnings for the backdrop click -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions --> 
	<!-- svelte-ignore a11y-click-events-have-key-events --> 
	<div
		class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 200 }}
		role="dialog"
		aria-modal="true"
	>
		<!-- Modal Content Box -->
		<div
			class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative"
			role="document"
		>
			<!-- Close Button -->
			<button
				class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
				on:click={closeModal}
				aria-label="Close modal"
			>
				<X class="w-6 h-6" />
			</button>

			<!-- Slot for modal content (e.g., the form) -->
			<slot />
		</div>
	</div>
{/if}

<style>
	/* Optional: Add specific modal styles if needed */
</style>