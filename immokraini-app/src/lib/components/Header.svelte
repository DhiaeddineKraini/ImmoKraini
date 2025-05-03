<script lang="ts">
	import { fly } from 'svelte/transition'; 
	import { quintOut } from 'svelte/easing'; 
	import { createEventDispatcher, onMount, onDestroy } from 'svelte'; 
	import { browser } from '$app/environment'; 

	let isMobileMenuOpen = false; 
	let headerElement: HTMLElement; 

	const dispatch = createEventDispatcher(); 

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}

	// --- Click Outside Logic ---
	function handleClickOutside(event: MouseEvent) {
		if (isMobileMenuOpen && headerElement && !headerElement.contains(event.target as Node)) {
			closeMobileMenu();
		}
	}

	onMount(() => {
		if (browser) { document.addEventListener('click', handleClickOutside, true); }
	});

	onDestroy(() => {
		if (browser) { document.removeEventListener('click', handleClickOutside, true); }
	});
	// --- End Click Outside Logic ---

</script>

<!-- Bind the header element -->
<header bind:this={headerElement} class="sticky top-0 z-50 bg-white shadow-md">
	<nav class="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative"> 
		
		<!-- Logo/Brand Name -->
		<a href="/" class="text-xl font-bold text-muted-blue hover:opacity-80 transition-opacity">
			ImmoKraini
		</a>

		<!-- Desktop Navigation Links -->
		<div class="hidden sm:flex space-x-4 md:space-x-6"> 
			<a href="/" class="text-gray-700 hover:text-brand-blue transition-colors">Home</a>
			<a href="/properties/search" class="text-gray-700 hover:text-brand-blue transition-colors">Properties</a> 
			<a href="/sell" class="text-gray-700 hover:text-brand-blue transition-colors">Sell</a>
			<a href="/contact" class="text-gray-700 hover:text-brand-blue transition-colors">Contact</a>
		</div>

		<!-- Mobile Menu Button -->
		<div class="sm:hidden"> 
			<button 
                type="button" 
                on:click={toggleMobileMenu} 
                aria-label="Toggle main menu" 
                aria-expanded={isMobileMenuOpen}
                class="text-gray-700 hover:text-brand-blue focus:outline-none p-1"
            >
                {#if isMobileMenuOpen}
                    <svg class="h-6 w-6 block" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                {:else}
                    <svg class="h-6 w-6 block" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                {/if}
			</button>
		</div>
        <!-- End Mobile Menu Button -->

        <!-- Mobile Menu Dropdown -->
        {#if isMobileMenuOpen}
            <div 
                class="sm:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4"
                transition:fly={{ y: -10, duration: 250, easing: quintOut }}
            >
                <nav class="flex flex-col space-y-3">
                    <a href="/" on:click={closeMobileMenu} class="text-gray-700 hover:text-brand-blue transition-colors block px-2 py-1 rounded hover:bg-gray-50">Home</a>
                    <a href="/properties/search" on:click={closeMobileMenu} class="text-gray-700 hover:text-brand-blue transition-colors block px-2 py-1 rounded hover:bg-gray-50">Properties</a>
                    <a href="/sell" on:click={closeMobileMenu} class="text-gray-700 hover:text-brand-blue transition-colors block px-2 py-1 rounded hover:bg-gray-50">Sell</a>
                    <a href="/contact" on:click={closeMobileMenu} class="text-gray-700 hover:text-brand-blue transition-colors block px-2 py-1 rounded hover:bg-gray-50">Contact</a>
                </nav>
            </div>
        {/if}
        <!-- End Mobile Menu Dropdown -->

	</nav>
</header>

<style lang="postcss">
	/* Scoped component styles */
</style>