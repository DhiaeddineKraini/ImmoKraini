<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
  
	import { Heart } from 'lucide-svelte';
	import savedPropertyIds from '$lib/stores/favoritesStore';
	import { t, locale, locales } from '$lib/i18n/i18n';
   const flags: Record<string, string> = {
	en: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#071b65"></rect><path d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z" fill="#fff"></path><path d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z" fill="#b92932"></path><path d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z" fill="#b92932"></path><path d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z" fill="#fff"></path><rect x="13" y="4" width="6" height="24" fill="#fff"></rect><rect x="1" y="13" width="30" height="6" fill="#fff"></rect><rect x="14" y="4" width="4" height="24" fill="#b92932"></rect><rect x="14" y="1" width="4" height="30" transform="translate(32) rotate(90)" fill="#b92932"></rect><path d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z" fill="#b92932"></path><path d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z" fill="#b92932"></path><path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path><path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path></svg>`,
	fr: `<svg width="20" height="14" viewBox="0 0 24 16"><rect width="8" height="16" fill="#0055A4"/><rect x="8" width="8" height="16" fill="#FFF"/><rect x="16" width="8" height="16" fill="#EF4135"/></svg>`
  };
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
		<a href="/" class="value"><span>{$t('nav.home')}</span></a>
		<a href="/properties/search" class="value"><span>{$t('nav.properties')}</span></a>
		<a href="/sell" class="value"><span>{$t('nav.sell')}</span></a>
		<a href="/contact" class="value"><span>{$t('nav.contact')}</span></a>
  
		<!-- Saved-properties link -->
		<a href="/saved-properties" class="value relative" title={$t('nav.savedProperties')}>
		  <Heart class="w-5 h-5" />
		  {#if savedCount > 0}
			<span class="badge">{savedCount}</span>
		  {/if}
		</a>

		<!-- Language selector -->
		<div class="value flex items-center relative">
		  <div class="flag-container">
			{@html flags[$locale]}
		  </div>
		  <div class="flag-dropdown">
			{#each locales as l}
			  <button 
				class="flag-option" 
				on:click={() => { $locale = l; }}
				aria-selected={$locale === l}
			  >
				{@html flags[l]}
			  </button>
			{/each}
		  </div>
		</div>
	  </div>
  
	  <!-- Mobile: saved icon + burger -->
	  <div class="sm:hidden flex items-center space-x-3">
		<a href="/saved-properties" class="relative p-1 text-gray-600 hover:text-brand-blue transition-colors" title={$t('nav.savedProperties')}>
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
		  <a href="/" on:click={closeMobileMenu} class="nav-link-mobile">{$t('nav.home')}</a>
		  <a href="/properties/search" on:click={closeMobileMenu} class="nav-link-mobile">{$t('nav.properties')}</a>
		  <a href="/sell" on:click={closeMobileMenu} class="nav-link-mobile">{$t('nav.sell')}</a>
		  <a href="/contact" on:click={closeMobileMenu} class="nav-link-mobile">{$t('nav.contact')}</a>
		  
		  <!-- Language selector in mobile menu -->
		  <div class="nav-link-mobile flex items-center relative">
			<div class="flex items-center">
			  <span class="mr-2">{$t('nav.language')}</span>
			  <div class="flag-container relative">
				{@html flags[$locale]}
				<div class="flag-dropdown-mobile">
				  {#each locales as l}
					<button 
					  class="flag-option"
					  on:click={() => { $locale = l; }}
					  aria-selected={$locale === l}
					>
					  {@html flags[l]}
					</button>
				  {/each}
				</div>
			  </div>
			</div>
		  </div>
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
	padding: 10px 10px 10px 8px;
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
  
  /* Flag styling */
  .flag-container {
	display: flex;
	align-items: center;
	cursor: pointer;
  }
  .flag-container :global(svg) {
	width: 20px;
	height: auto;
  }
  
  /* Flag dropdown styling */
  .flag-dropdown {
	display: none;
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 4px;
	box-shadow: 0 2px 5px rgba(0,0,0,0.1);
	z-index: 50;
	min-width: 40px;
	padding: 4px;
  }
  
  .value:hover .flag-dropdown,
  .nav-link-mobile:hover .flag-dropdown {
	display: flex;
	flex-direction: column;
  }
  
  .flag-option {
	padding: 4px;
	background: none;
	border: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 2px;
  }
  
  .flag-option:hover {
	background-color: #f3f4f6;
  }
  
  .flag-option[aria-selected="true"] {
	background-color: #e5e7eb;
  }
  
  .flag-option :global(svg) {
	width: 20px;
	height: auto;
  }
  
  /* Mobile-specific flag dropdown styling */
  .flag-dropdown-mobile {
    display: none;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    z-index: 50;
    min-width: 40px;
    padding: 4px;
  }
  
  .flag-container:hover .flag-dropdown-mobile {
    display: flex;
    flex-direction: column;
  }
  </style>
