<script lang="ts">
  // Core SvelteKit imports
  import type { PageData } from './$types';
  import { onMount, onDestroy, afterUpdate } from 'svelte'; 
  

  // UI Components / Icons
  import { MapPin, Bed, Bath, Maximize, Video, Heart } from 'lucide-svelte'; // Added Video
  import Modal from '$lib/components/Modal.svelte'; // Import Modal
  import InquiryForm from '$lib/components/InquiryForm.svelte'; // Import Form 

  // Leaflet CSS (Imported statically)
  import 'leaflet/dist/leaflet.css'; 

  // Swiper Imports (Types and Registration)
  import { register } from 'swiper/element/bundle'; 
  import type { SwiperContainer } from 'swiper/element'; 
  import type { SwiperOptions } from 'swiper/types';
  
  // Register Swiper custom elements (run once)
  register();

   // <<< ADDED: Import favorites store and functions >>>
   import savedPropertyIds, { toggleFavorite } from '$lib/stores/favoritesStore';

  // --- Component Props & Data ---
  export let data: PageData; 
  // Explicitly type property to include optional videoUrl
  const property: typeof data.property & { 
    galleryImages: string[], 
    videoUrl?: string | null, 
    location?: { lat: number, lon: number } 
  } = data.property; 

  const formattedPrice = new Intl.NumberFormat('fr-TN', { 
    style: 'currency', currency: 'TND', maximumFractionDigits: 0 
  }).format(property.price);

  // --- Modal State ---
  let showInquiryModal = false;

  // --- Leaflet Map State ---
  let mapContainer: HTMLElement; 
  let map: any = null; // Use 'any' or placeholder type, initialize to null
  let L: any = null; // Leaflet library instance, loaded dynamically
  let customIcon: any = null; 
  const mapTilerApiKey = import.meta.env.VITE_MAPTILER_API_KEY;

  // --- Swiper Gallery State ---
  let mainSwiperEl: SwiperContainer | null = null;
  let thumbsSwiperEl: SwiperContainer | null = null;
  let swipersInitialized = false; 

  const mainSwiperParams: SwiperOptions = { 
      spaceBetween: 10, 
      navigation: true, // Enables built-in navigation arrows
      // Thumbs controller is linked dynamically in afterUpdate
  };
  const thumbsSwiperParams: SwiperOptions = {
      spaceBetween: 10, slidesPerView: 4, freeMode: true, watchSlidesProgress: true,
      breakpoints: { 640: { slidesPerView: 5 }, 768: { slidesPerView: 6 }, 1024: { slidesPerView: 4 } }
  };

  // <<< ADDED: Reactive variable for this page's property favorite status >>>
  $: isThisPropertyFavorite = property?.id ? $savedPropertyIds.includes(property.id) : false; 

  // <<< ADDED: Handler for detail page favorite button click >>>
  function handleDetailPageFavoriteClick() {
      if (property?.id) {
          toggleFavorite(property.id);
      }
  }


  // --- Lifecycle Hooks ---
  onMount(async () => { 
     // --- Initialize Leaflet (Client-Side Only) ---
     try {
         L = (await import('leaflet')).default; 
         customIcon = L.icon({
             iconUrl: '/marker-icon-orange.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], 
         });
         if (!mapTilerApiKey) {
             console.error("MapTiler API Key is missing.");
             const mapElement = mapContainer?.parentElement;
             if (mapElement) mapElement.innerHTML = '<div class="h-80 sm:h-96 w-full rounded bg-red-100 flex items-center justify-center text-red-700 p-4 text-center">Map configuration error: API Key missing.</div>';
             return; 
         }
         if (!property.location?.lat || !property.location?.lon) {
            console.warn("Property location coordinates are missing.");
            return; 
         }
         if (!mapContainer || map) { return; }

         map = L.map(mapContainer, { center: [property.location.lat, property.location.lon], zoom: 14, scrollWheelZoom: false });
         L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${mapTilerApiKey}`, {
             attribution: '© <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
             maxZoom: 20 
         }).addTo(map);
         L.marker([property.location.lat, property.location.lon], { icon: customIcon })
         .addTo(map)
         .bindPopup(`<b>${property.title}</b><br>${property.address}`); 
         L.control.scale({ imperial: false }).addTo(map); 
     } catch (err) {
         console.error("Failed to load or initialize Leaflet map:", err);
         const mapElement = mapContainer?.parentElement;
         if (mapElement) mapElement.innerHTML = '<div class="h-80 sm:h-96 w-full rounded bg-red-100 flex items-center justify-center text-red-700 p-4 text-center">Error loading map.</div>';
     }
  }); 

  afterUpdate(() => {
      // Initialize and link Swipers after elements are rendered
      if (!swipersInitialized && mainSwiperEl && thumbsSwiperEl) {
          try {
              Object.assign(mainSwiperEl, mainSwiperParams);
              Object.assign(thumbsSwiperEl, thumbsSwiperParams);
              mainSwiperEl.initialize();
              thumbsSwiperEl.initialize();
              setTimeout(() => { // Use timeout to ensure swiper instances are ready
                  if (mainSwiperEl?.swiper && thumbsSwiperEl?.swiper) {
                      mainSwiperEl.swiper.thumbs.swiper = thumbsSwiperEl.swiper;
                      swipersInitialized = true; 
                  }
              }, 50); 
          } catch (err) {
              console.error("Failed to initialize or link Swipers:", err);
          }
      }
  });

  onDestroy(() => {
      // Cleanup map instance
      if (map) { map.remove(); map = null; }
  });
  // --- End Lifecycle Hooks ---

</script>


<svelte:head>
    <title>{property.title} | ImmoKraini - Property in Djerba</title>
    <meta 
        name="description" 
        content={`View details for ${property.title}, a ${property.propertyType?.toLowerCase() || 'property'} located at ${property.address}. Contact ImmoKraini for more information.`} 
    />
    <meta property="og:title" content={`${property.title} | ImmoKraini`} />
    <meta property="og:description" content={`View details for this ${property.propertyType?.toLowerCase() || 'property'} in Djerba.`} />
    {#if property.imageUrl}
        <meta property="og:image" content={property.imageUrl} /> 
        <meta name="twitter:image" content={property.imageUrl} />
        <!-- Use main property image --> <!-- <<< CORRECTED COMMENT -->
    {/if}
    <meta property="og:type" content="article" /> 
</svelte:head>



<!-- Component Template -->
<div class="container mx-auto px-4 py-8 sm:py-12">
  
  <a href="/properties/search" class="text-brand-blue hover:underline mb-6 inline-block">← Back to Listings</a>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
    
    <div class="lg:col-span-2 space-y-8">
      
      <!-- Image Gallery Section using Swiper -->
      <div class="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        {#if property.galleryImages && property.galleryImages.length > 0}
          <!-- Main Swiper -->
          <!-- svelte-ignore $$render_props_bindings -->
          <swiper-container class="main-swiper aspect-video" bind:this={mainSwiperEl} init="false">
            {#each property.galleryImages as imgUrl (imgUrl)}
              <swiper-slide>
                <img 
                  src={imgUrl} 
                  alt="View of {property.title}" 
                  class="w-full h-full object-cover"  
                  loading="lazy"
                /> 
                <!-- Changed object-contain to object-cover -->
                <!-- Removed bg-black -->
              </swiper-slide>
            {/each}
          </swiper-container>
          <!-- Thumbnail Swiper -->
          {#if property.galleryImages.length > 1}
            <!-- svelte-ignore $$render_props_bindings -->
            <swiper-container class="thumbs-swiper p-2" bind:this={thumbsSwiperEl} init="false">
              {#each property.galleryImages as imgUrl, i (imgUrl)}
                <swiper-slide class="opacity-60 hover:opacity-100 cursor-pointer rounded overflow-hidden">
                  <img src={imgUrl} alt="Thumbnail {i+1}" class="w-full h-16 object-cover block"/>
                </swiper-slide>
              {/each}
            </swiper-container>
          {/if}
        {:else if property.imageUrl}
           <!-- Fallback to single image -->
           <img src={property.imageUrl} alt="Main view of {property.title}" class="w-full h-auto max-h-[600px] object-cover" /> 
        {:else}
           <!-- Placeholder if no images -->
           <div class="w-full aspect-video flex items-center justify-center text-gray-500 bg-gray-200">No Image Available</div>
        {/if}
      </div>
      <!-- End Image Gallery Section -->

      <!-- Description -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Description</h2>
        <p class="text-gray-600 leading-relaxed whitespace-pre-line">{property.description || 'No description available.'}</p>
      </div>

      <!-- Features -->
      {#if property.features && property.features.length > 0}
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Features</h2>
          <ul class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-gray-700">
            {#each property.features as feature (feature)}
              <li class="flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-brand-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                 {feature}
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <!-- Map Section -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Location</h2>
        {#if property.location?.lat && property.location?.lon}
          <div bind:this={mapContainer} class="h-80 sm:h-96 w-full rounded z-0" aria-label="Map showing property location"></div> 
        {:else}
           <div class="h-80 sm:h-96 w-full rounded bg-gray-100 flex items-center justify-center text-gray-500 p-4 text-center"> Map location not available. </div>
        {/if}
      </div>
    </div>

    <!-- Right Column (Details & Agent Info) -->
    <div class="lg:col-span-1 space-y-6">
      <div class="bg-white p-6 rounded-lg shadow sticky top-24"> 
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
        <p class="text-gray-600 text-sm mb-4 flex items-center"> <MapPin class="w-4 h-4 mr-1 text-muted-blue inline-block" /> {property.address} </p>
        <p class="text-3xl font-bold text-brand-blue mb-6">{formattedPrice}</p>
        <div class="grid grid-cols-3 gap-4 text-center border-t border-b py-4 mb-6">
          {#if property.beds !== null} <div><Bed class="w-6 h-6 mx-auto mb-1 text-muted-blue" /><span class="text-sm font-semibold">{property.beds}</span><span class="block text-xs text-gray-500">Bed{property.beds !== 1 ? 's' : ''}</span></div> {:else} <div class="opacity-50"><Bed class="w-6 h-6 mx-auto mb-1 text-gray-400" /><span class="text-sm font-semibold">-</span><span class="block text-xs text-gray-500">Beds</span></div> {/if}
          {#if property.baths !== null} <div><Bath class="w-6 h-6 mx-auto mb-1 text-muted-blue" /><span class="text-sm font-semibold">{property.baths}</span><span class="block text-xs text-gray-500">Bath{property.baths !== 1 ? 's' : ''}</span></div> {:else} <div class="opacity-50"><Bath class="w-6 h-6 mx-auto mb-1 text-gray-400" /><span class="text-sm font-semibold">-</span><span class="block text-xs text-gray-500">Baths</span></div> {/if}
          {#if property.area !== null} <div><Maximize class="w-6 h-6 mx-auto mb-1 text-muted-blue" /><span class="text-sm font-semibold">{property.area.toLocaleString()}</span><span class="block text-xs text-gray-500">sqm</span></div> {:else} <div class="opacity-50"><Maximize class="w-6 h-6 mx-auto mb-1 text-gray-400" /><span class="text-sm font-semibold">-</span><span class="block text-xs text-gray-500">Area</span></div> {/if} 
        </div>
        <div class="space-y-2 text-sm mb-6">
          {#if property.propertyType}<p><strong class="text-gray-700 w-24 inline-block">Type:</strong> {property.propertyType}</p>{/if}
          {#if property.yearBuilt}<p><strong class="text-gray-700 w-24 inline-block">Year Built:</strong> {property.yearBuilt}</p>{/if}
           <p><strong class="text-gray-700 w-24 inline-block">Status:</strong> For Sale</p> 
        </div>
        <div class="space-y-3">
          <button 
            on:click={() => showInquiryModal = true} 
            class="w-full bg-brand-blue text-white font-semibold py-3 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out"
          >
             Request Info / Schedule Visit 
          </button>
          {#if property.videoUrl}
            <a 
              href={property.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              class="w-full block text-center bg-orange-500 text-white font-semibold py-3 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out"
            >
              <Video class="w-5 h-5 inline-block mr-1 -mt-1" /> Watch Video Tour
            </a>
          {/if}

          <!-- Save Button -->
          <button 
          on:click={handleDetailPageFavoriteClick}
          class="w-full font-semibold py-3 px-4 rounded-md shadow transition-colors duration-200 flex items-center justify-center gap-2"
          class:bg-red-500={isThisPropertyFavorite} 
          class:text-white={isThisPropertyFavorite}
          class:bg-gray-200={!isThisPropertyFavorite} 
          class:text-gray-800={!isThisPropertyFavorite}
          class:hover:bg-red-600={isThisPropertyFavorite}
          class:hover:bg-gray-300={!isThisPropertyFavorite}
          aria-pressed={isThisPropertyFavorite}
        > 
          <Heart class="w-5 h-5" fill={isThisPropertyFavorite ? 'currentColor' : 'none'} />
          {isThisPropertyFavorite ? 'Saved' : 'Save Property'}
        </button>          <!-- End Save Button -->

        
        </div>
      </div>
      {#if property.agent}
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Contact Agent</h3>
          <p class="font-medium text-gray-700">{property.agent.name}</p>
          <p class="text-sm text-gray-600">{property.agent.phone}</p>
          <p class="text-sm text-gray-600">{property.agent.email}</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .whitespace-pre-line { white-space: pre-line; }

  /* --- Swiper Custom Styles --- */
  .main-swiper { width: 100%; }
  .thumbs-swiper { height: 5rem; box-sizing: content-box; }
  /* Use :global() for classes added dynamically by Swiper JS */
  :global(.thumbs-swiper swiper-slide.swiper-slide-thumb-active) { 
      opacity: 1;       border: 2px solid var(--color-brand-blue, #66C4FF); 
  }
  /* Use ::part() for styling shadow DOM parts of swiper-container */
  .main-swiper::part(button-next), 
  .main-swiper::part(button-prev) { 
      color: var(--color-brand-blue, #66C4FF); 
      background-color: rgba(255, 255, 255, 0.7); 
      border-radius: 50%; 
      width: 2.5rem; height: 2.5rem; 
      transition: background-color 0.2s ease; 
      --swiper-navigation-size: 1rem; /* Adjust icon size */
  }
  .main-swiper::part(button-next):hover, 
  .main-swiper::part(button-prev):hover { 
      background-color: rgba(255, 255, 255, 0.9); 
  }
  .main-swiper::part(button-disabled) { 
      opacity: 0.3; 
      cursor: not-allowed; 
  }
</style>


<!-- Modal Integration -->
<Modal bind:showModal={showInquiryModal} on:close={() => showInquiryModal = false}>
  <InquiryForm propertyTitle={property.title} on:close={() => showInquiryModal = false} />
</Modal>
<!-- End Modal Integration -->

