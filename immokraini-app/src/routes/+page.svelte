<script lang="ts">
	/* ───────── Imports ───────── */
	import type { PageData } from './$types'; // Import PageData type
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import ContactForm from '$lib/components/ContactForm.svelte';
	import { goto } from '$app/navigation';
	import InteractiveHover from './InteractiveHover.svelte';
	import { t } from'$lib/i18n/i18n.js'; // Import translation store
	// Removed onMount, onDestroy from 'svelte'
	// Removed browser from '$app/environment'
	// Removed Motion One imports

	// UI Icons for sections
	import { Award, Users, Send, Phone, Mail, MapPin, Loader } from 'lucide-svelte';

	interface AgentInfo { id: string; name: string; email: string; phone: string | null; imageUrl: string | null; title?: string; }

	// Define the expected structure of PageData
	type ExtendedPageData = PageData & {
		featuredProperties?: Array<any>;
		agents?: AgentInfo[];
		error?: string | null;
	};

	// --- Component Props & Data ---
	export let data: ExtendedPageData;
	// Use reactive declarations to get data from the prop, provide fallbacks
	$: featuredProperties = data?.featuredProperties || [];
	$: featuredLoadError = data?.error || null; // Capture potential loading errors
	$: agents = data?.agents || []; // <<< ADDED reactive declaration for agents
	$: pageLoadError = data?.error || null; 

	/* ───────── Search-form state ───────── */
	let searchLocation: string = '';
	let searchPropertyType: string = '';
	let searchMinPrice: string = '';
	let searchMaxPrice: string = '';
	let searchMinBeds: string = '';
	let searchMinBaths: string = '';
	let isSearching: boolean = false;
	/* ───────── End Search-form state ───────── */


	/* ───────── Form-submit handler ───────── */
	function handleSearchSubmit() {
		isSearching = true;
		const searchParams = new URLSearchParams();
		if (searchLocation.trim()) searchParams.set('location', searchLocation.trim());
		if (searchPropertyType) searchParams.set('type', searchPropertyType);
		if (searchMinPrice) searchParams.set('minPrice', searchMinPrice);
		if (searchMaxPrice) searchParams.set('maxPrice', searchMaxPrice);
		if (searchMinBeds) searchParams.set('minBeds', searchMinBeds);
		if (searchMinBaths) searchParams.set('minBaths', searchMinBaths);
		goto(`/properties/search?${searchParams.toString()}`).catch(() => {
			isSearching = false;
		});
	}
	/* ───────── End Form-submit handler ───────── */

	// --- REMOVED Motion One Animation Setup (onMount, onDestroy) ---

</script>

<svelte:head>
	<title>{$t('home.metaTitle')}</title>
	<meta
		name="description"
		content={$t('home.metaDescription')}
	/>
</svelte:head>

<main>
	<!-- ========================== Hero Section (Static Background) ========================== -->
	<section
		class="relative flex h-screen min-h-[600px] items-center justify-center overflow-hidden text-white bg-cover bg-center"
		style="background-image: url('/hero-background.jpg');" 
		aria-label="Hero section with background image" role="banner"
	>
		<div class="absolute inset-0 bg-black/30 z-0" aria-hidden="true"></div>
		<div class="relative z-10 text-center p-8 max-w-4xl mx-auto">
			<h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
				{$t('home.heroTitle')}
			</h1>
			<p class="text-lg md:text-xl mb-8 drop-shadow-md">
				{$t('home.heroSubtitle')}
			</p>
			<div class="flex flex-col sm:flex-row justify-center gap-4">
				<InteractiveHover>
					<button
						class="bg-white text-muted-blue hover:bg-gray-100 font-semibold py-3 px-6 rounded-md transition duration-300 ease-in-out shadow hover:shadow-md"
						on:click={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
					>
						{$t('home.heroSearchButton')}
					</button>
				</InteractiveHover>
				<InteractiveHover>
					<button
						class="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold py-3 px-6 rounded-md transition duration-300 ease-in-out shadow hover:shadow-md"
						on:click={() => goto('/sell')}
					>
						{$t('home.heroSellButton')}
					</button>
				</InteractiveHover>
			</div>
		</div>
	</section>
	<!-- ========================== End Hero Section ========================== -->


	<!-- ───────────────────── Property-search form ───────────────────── -->
	<section id="search-section" class="py-16 px-4 bg-white">
		<h2 class="text-center text-3xl font-bold mb-8 text-muted-blue">{$t('home.searchSectionTitle')}</h2>

		<div class="max-w-5xl mx-auto bg-gray-50 p-6 sm:p-8 rounded-lg shadow-lg">
			<form
				on:submit|preventDefault={handleSearchSubmit}
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
			>
				<!-- Location -->
				<div class="lg:col-span-1">
					<label for="location" class="block text-sm font-medium text-gray-700 mb-1">{$t('home.search.location')}</label>
					<input
						id="location"
						type="text"
						placeholder={$t('home.search.locationPlaceholder')}
						bind:value={searchLocation}
						class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
					/>
				</div>

				<!-- Property type -->
				<div class="lg:col-span-1">
					<label for="property-type" class="block text-sm font-medium text-gray-700 mb-1">{$t('home.search.propertyType')}</label>
					<select
						id="property-type"
						bind:value={searchPropertyType}
						class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
					>
						<option value="">Any</option>
						<option value="house">House</option>
						<option value="apartment">Apartment</option>
						<option value="condo">Condo</option>
						<option value="land">Land</option>
						<option value="commercial">Commercial</option>
					</select>
				</div>

				<!-- Price range -->
				<div class="grid grid-cols-2 gap-2 lg:col-span-1">
					<div>
						<label for="min-price" class="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
						<input
							id="min-price"
							type="number"
							min="0"
							step="1000"
							placeholder="Any"
							bind:value={searchMinPrice}
							class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
						/>
					</div>

					<div>
						<label for="max-price" class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
						<input
							id="max-price"
							type="number"
							min="0"
							step="1000"
							placeholder="Any"
							bind:value={searchMaxPrice}
							class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
						/>
					</div>
				</div>

				<!-- Advanced Filters -->
				<div class="grid grid-cols-2 gap-2 lg:col-span-1">
					<div>
						<label for="min-beds" class="block text-sm font-medium text-gray-700 mb-1">Min Beds</label>
						<select
							id="min-beds"
							bind:value={searchMinBeds}
							class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
						>
							<option value="">Any</option>
							{#each [1, 2, 3, 4, 5, 6] as num}
								<option value={num}>{num}+</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="min-baths" class="block text-sm font-medium text-gray-700 mb-1">Min Baths</label>
						<select
							id="min-baths"
							bind:value={searchMinBaths}
							class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50"
						>
							<option value="">Any</option>
							{#each [1, 2, 3, 4, 5] as num}
								<option value={num}>{num}+</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Submit -->
				<div class="sm:col-span-2 lg:col-span-4">
					<button
						type="submit"
						class="search-button w-full bg-brand-blue text-white font-semibold py-2 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue h-[42px] disabled:opacity-70 disabled:cursor-not-allowed"
						disabled={isSearching}
					>
						{#if isSearching}
							<span class="flex items-center justify-center">
								<Loader class="animate-spin w-5 h-5 mr-2" />
								Searching...
							</span>
						{:else}
							Search
						{/if}
					</button>
				</div>
			</form>
		</div>
	</section>
	<!-- ─────────────────── End Property-search form ─────────────────── -->


	<!-- ─────────────────────── Featured grid ─────────────────────── -->
	<section id="featured-properties" class="py-16 px-4 bg-gray-100">
		<div class="container mx-auto">
			<h2 class="text-center text-3xl font-bold mb-12 text-muted-blue">Featured Properties</h2>

			{#if featuredLoadError}
				<p class="text-center text-red-600 bg-red-100 p-4 rounded-md">
					Error loading featured properties: {featuredLoadError}
				</p>
			{:else if featuredProperties.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
					{#each featuredProperties as property (property.id)}
						<div class="h-full"> 
							<PropertyCard
							    id={property.id}
								imageUrl={property.imageUrl}
								detailUrl={`/properties/${property.slug}`}
								title={property.title}
								address={property.address}
								price={property.price}
								beds={property.beds}
								baths={property.baths}
								area={property.area}
							/>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-gray-600">No featured properties available at the moment.</p>
			{/if}

			<div class="text-center mt-12">
				<div class="relative inline-flex items-center justify-center gap-4 group">
					<a
						href="/properties/search" 
						class="group relative inline-flex items-center justify-center text-base rounded-md bg-brand-blue px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-brand-blue hover:shadow-lg hover:-translate-y-0.5 hover:shadow-brand-blue/30"
					>
						View All Properties
						<svg
							aria-hidden="true"
							viewBox="0 0 10 10"
							height="10"
							width="10"
							fill="none"
							class="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
						>
							<path
								d="M0 5h7"
								class="transition opacity-0 group-hover:opacity-100"
							></path>
							<path
								d="M1 1l4 4-4 4"
								class="transition group-hover:translate-x-[3px]"
							></path>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</section>
	<!-- ───────────────────── End Featured grid ───────────────────── -->


	<!-- ================== Why Choose Us Section ================== -->
	<section id="why-choose-us" class="py-16 px-4 bg-white"> 
		<div class="container mx-auto text-center">
			<h2 class="text-3xl font-bold mb-4 text-muted-blue">Why Choose ImmoKraini?</h2>
			<p class="max-w-2xl mx-auto text-gray-600 mb-12">
				We combine local expertise with modern technology to provide unparalleled real estate service in Djerba.
			</p>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<!-- Feature Item 1 -->
				<div class="why-item p-6">
					<div class="bg-sky-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow">
						<MapPin class="w-8 h-8" />
					</div>
					<h3 class="text-xl font-semibold text-gray-800 mb-2">Local Djerba Experts</h3> 
					<p class="text-gray-600 text-sm">Deep understanding of the Djerba property market, neighborhoods, and culture.</p> 
				</div>
				<!-- Feature Item 2 -->
				<div class="why-item p-6">
					<div class="bg-brand-blue text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow">
						<Award class="w-8 h-8" />
					</div>
					<h3 class="text-xl font-semibold text-gray-800 mb-2">Personalized Service</h3>
					<p class="text-gray-600 text-sm">Tailored approach to meet your unique buying, selling, or renting needs.</p>
				</div>
				<!-- Feature Item 3 -->
				<div class="why-item p-6">
					<div class="bg-brand-orange text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow">
						<Users class="w-8 h-8" />
					</div>
					<h3 class="text-xl font-semibold text-gray-800 mb-2">Client-Focused Results</h3>
					<p class="text-gray-600 text-sm">Dedicated to achieving the best possible outcome for every client we serve.</p>
				</div>
			</div>
		</div>
	</section>
	<!-- ================== End Why Choose Us Section ================== -->


	<!-- ================== Meet the Team Section ================== -->
	<section id="meet-the-team" class="py-16 px-4 bg-gray-50"> 
		<div class="container mx-auto text-center">
			<h2 class="text-3xl font-bold mb-12 text-muted-blue">Meet Our Team</h2>

            {#if pageLoadError}
                 <p class="text-center text-red-600">Could not load team information.</p>
            {:else if agents.length > 0} 
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {#each agents as member (member.id)} 
                        <div class="team-card bg-white p-6 rounded-lg shadow text-center transition-transform duration-300 hover:scale-105 flex flex-col"> 
                            <img
                                src={member.imageUrl || '/default-avatar.png'} 
                                alt="Photo of {member.name}"
                                class="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-sky-blue flex-shrink-0"
                                loading="lazy" width="96" height="96"
                            />
                            <h3 class="text-lg font-semibold text-gray-800">{member.name}</h3>
                            <!-- Add title back if you fetch it -->
                            <!-- <p class="text-sm text-brand-blue mb-3">{member.title || 'Real Estate Agent'}</p> -->
                            
                            <div class="mt-auto pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600"> 
                                {#if member.phone} <a href={`tel:${member.phone}`} class="flex items-center justify-center group hover:text-brand-blue"> <Phone class="w-3 h-3 mr-1.5 text-brand-orange group-hover:scale-110 transition-transform" /> <span>{member.phone}</span> </a> {/if}
                                {#if member.email} <a href={`mailto:${member.email}`} class="flex items-center justify-center group hover:text-brand-blue"> <Mail class="w-3 h-3 mr-1.5 text-brand-orange group-hover:scale-110 transition-transform" /> <span>{member.email}</span> </a> {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                 <p class="text-center text-gray-600">Our team information is currently unavailable.</p>
            {/if}
			<!-- Removed See Full Team Button -->
		</div>
	</section>
	<!-- ================== End Meet the Team Section ================== -->


	<!-- ================== Contact Section ================== -->
  	<section id="contact-section" class="py-16 md:py-24 px-4 bg-sky-blue/10 overflow-hidden"> 
    	<div class="container mx-auto">
        	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
				<!-- Left Column: Text & Info -->
				<div class="contact-left-col text-center md:text-left">
					<h2 class="text-3xl font-bold mb-4 text-muted-blue flex items-center justify-center md:justify-start">
						<Send class="w-7 h-7 mr-3 text-brand-blue" /> Get In Touch
					</h2>
					<p class="text-gray-700 mb-6 text-lg leading-relaxed">
						Ready to find your dream property in Djerba or have questions about selling? 
						Contact our expert team today. We're here to help you every step of the way.
					</p>
					<div class="space-y-3 text-gray-800">
						<a href="tel:+21675123456" class="flex items-center justify-center md:justify-start group">
							<Phone class="w-5 h-5 mr-2 text-brand-orange group-hover:scale-110 transition-transform" />
							<span class="hover:underline">+216 75 123 456</span>
						</a>
						<a href="mailto:info@immokraini.com" class="flex items-center justify-center md:justify-start group">
							<Mail class="w-5 h-5 mr-2 text-brand-orange group-hover:scale-110 transition-transform" />
							<span class="hover:underline">info@immokraini.com</span>
						</a>
					</div>
				</div>

				<!-- Right Column: Form -->
				<div class="contact-right-col bg-white p-6 sm:p-8 rounded-lg shadow-xl">
					<ContactForm />
				</div>

    		</div>
		</div>
	</section>
	<!-- ================== End Contact Section ================== -->
</main>

<style>
	/* Ken Burns animation styles REMOVED */

	/* Refine search form grid (Kept from original) */
	@media (min-width: 1024px) { /* lg breakpoint */
		form.grid {
			grid-template-columns: 2fr 1fr 2fr auto; /* Adjusted based on original CSS rule */
		}
		form .grid.grid-cols-2 { /* Target the price range grid */
			grid-column: span 1; /* Make price range take one logical column */
		}
		form button[type="submit"] {
			 grid-column: span 1; /* Make submit button take one logical column */
		}
	}

	/* Team card styles (Kept from original) */
	.team-card img {
		border-color: var(--color-sky-blue, #87CEEB);
	}

    /* Color definitions (Kept from original) */
    :root {
        --color-sky-blue: #87CEEB;
        --color-brand-blue: #3B82F6;
        --color-muted-blue: #1E3A8A;
        --color-brand-orange: #F97316;
    }

    /* Tailwind color mappings (Kept from original) */
    .bg-sky-blue { background-color: var(--color-sky-blue); }
    .border-sky-blue { border-color: var(--color-sky-blue); }
    .bg-brand-blue { background-color: var(--color-brand-blue); }
    .text-brand-blue { color: var(--color-brand-blue); }
    .focus\:border-brand-blue:focus { border-color: var(--color-brand-blue); }
    .focus\:ring-brand-blue:focus { --tw-ring-color: var(--color-brand-blue); }
    .text-muted-blue { color: var(--color-muted-blue); }
    .bg-muted-blue { background-color: var(--color-muted-blue); }
    .bg-brand-orange { background-color: var(--color-brand-orange); }
    .text-brand-orange { color: var(--color-brand-orange); }

    /* Search button effects */
    .search-button {
        position: relative;
        transition: all 0.3s ease-in-out;
        box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
        border: 3px solid rgba(255, 255, 255, 0.3);
        overflow: hidden;
    }

    .search-button:hover {
        transform: scale(1.05);
        border-color: rgba(255, 255, 255, 0.6);
    }

    .search-button:hover::before {
        animation: shine 1.5s ease-out infinite;
    }

    .search-button::before {
        content: "";
        position: absolute;
        width: 100px;
        height: 100%;
        background-image: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0) 70%
        );
        top: 0;
        left: -100px;
        opacity: 0.6;
    }

    @keyframes shine {
        0% {
            left: -100px;
        }
        60% {
            left: 100%;
        }
        to {
            left: 100%;
        }
    }
</style>