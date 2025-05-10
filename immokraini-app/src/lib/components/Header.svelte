<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
  
	import { Heart } from 'lucide-svelte';
	import savedPropertyIds from '$lib/stores/favoritesStore';
  
	let isMobileMenuOpen = false;
	let headerElement: HTMLElement;
  
	const dispatch = createEventDispatcher();
  
	function toggleMobileMenu() {
	  isMobileMenuOpen = !isMobileMenuOpen;
	}
	function closeMobileMenu() {
	  isMobileMenuOpen = false;
	}
  
	/* ---------- Click-outside logic ---------- */
	function handleClickOutside(event: MouseEvent) {
	  if (
		isMobileMenuOpen &&
		headerElement &&
		!headerElement.contains(event.target as Node)
	  ) {
		closeMobileMenu();
	  }
	}
  
	onMount(() => {
	  if (browser) document.addEventListener('click', handleClickOutside, true);
	});
	onDestroy(() => {
	  if (browser) document.removeEventListener('click', handleClickOutside, true);
	});
	/* -------- End click-outside logic -------- */
  
	// reactive saved-property counter
	$: savedCount = $savedPropertyIds.length;
  </script>
  
  <header bind:this={headerElement} class="sticky top-0 z-50 bg-white shadow-md">
	<nav class="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative">
	  <!-- Logo / Brand -->
	  <a href="/" class="text-xl font-bold text-muted-blue hover:opacity-80 transition-opacity">
		ImmoKraini
	  </a>
  
	  <!-- Desktop nav (hidden on <640 px) -->
	  <div class="input hidden sm:flex">
		<a href="/" class="value"><span>Home</span></a>
		<a href="/properties/search" class="value"><span>Properties</span></a>
		<a href="/sell" class="value"><span>Sell</span></a>
		<a href="/contact" class="value"><span>Contact</span></a>
  
		<!-- Saved-properties link -->
		<a href="/saved-properties" class="value relative" title="View Saved Properties">
		  <Heart class="w-5 h-5" />
		  {#if savedCount > 0}
			<span class="badge">{savedCount}</span>
		  {/if}
		</a>
	  </div>
  
	  <!-- Mobile: saved icon + burger -->
	  <div class="sm:hidden flex items-center space-x-3">
		<a href="/saved-properties" class="relative p-1 text-gray-600 hover:text-brand-blue transition-colors" title="View Saved Properties">
		  <Heart class="w-5 h-5" />
		  {#if savedCount > 0}
			<span class="badge">{savedCount}</span>
		  {/if}
		</a>
  
		<button type="button"
				aria-label="Toggle main menu"
				aria-expanded={isMobileMenuOpen}
				on:click={toggleMobileMenu}
				class="p-1 text-gray-700 hover:text-brand-blue focus:outline-none">
		  {#if isMobileMenuOpen}
			<!-- Close (X) icon -->
			<svg class="h-6 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				 viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12"/></svg>
		  {:else}
			<!-- Hamburger icon -->
			<svg class="h-6 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
				 viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16m-7 6h7"/></svg>
		  {/if}
		</button>
	  </div>
	</nav>
  
	<!-- Mobile dropdown -->
	{#if isMobileMenuOpen}
	  <div class="sm:hidden absolute left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4"
		   transition:fly={{ y: -10, duration: 250, easing: quintOut }}>
		<nav class="flex flex-col space-y-3">
		  <a href="/" on:click={closeMobileMenu} class="nav-link-mobile">Home</a>
		  <a href="/properties/search" on:click={closeMobileMenu} class="nav-link-mobile">Properties</a>
		  <a href="/sell" on:click={closeMobileMenu} class="nav-link-mobile">Sell</a>
		  <a href="/contact" on:click={closeMobileMenu} class="nav-link-mobile">Contact</a>
		</nav>
	  </div>
	{/if}
  </header>
  
  <style lang="postcss">
  /* ---- Saved-properties badge ---- */
  .badge {
	@apply absolute -top-1 -right-1 bg-brand-orange text-white text-[0.6rem] font-bold w-4 h-4 rounded-full flex items-center justify-center;
  }
  
  /* ---- Desktop links (keeps original effects) ---- */
  .input {
	/* display removed so Tailwind 'hidden sm:flex' controls visibility */
	flex-direction: row;
	width: fit-content;
	background-color: transparent;
	justify-content: center;
	border-radius: 5px;
	gap: 7.5px;
  }
  .value {
	background-color: transparent;
	border: none;
	padding: 10px;
	color: #374151;           /* gray-700 */
	display: flex;
	position: relative;
	gap: 5px;
	cursor: pointer;
	border-radius: 4px;
	transition: all 0.2s ease;
  }
  .value:not(:active):hover,
  .value:focus               { background-color:#f3f4f6; }  /* gray-100 */
  .value:focus,
  .value:active              { background-color:#e5e7eb; outline:none; } /* gray-200 */
  
  /* animated underline on focus/active */
  .value::before {
	content:"";
	position:absolute;
	top:35px; left:10%; right:10%;
	height:2px;
	background-color:#2f81f7; /* brand blue */
	border-radius:5px;
	opacity:0;
	transition:opacity .2s ease;
  }
  .value:focus::before,
  .value:active::before      { opacity:1; }
  
  .value svg { width:15px; }
  
  /* ---- Mobile dropdown links ---- */
  .nav-link-mobile {
	@apply text-gray-700 hover:text-brand-blue transition-colors block px-2 py-1 rounded hover:bg-gray-50;
  }
  </style>
  