<script lang="ts">
    import type { PageData } from './$types';
    import { MapPin, Bed, Bath, Maximize } from 'lucide-svelte'; // Using lucide icons for clarity
  
    // The 'data' prop is automatically populated by the load function
    export let data: PageData; 
    const { property } = data; // Destructure the property object from data
  
    // Simple state for the image gallery (just showing the main image for now)
    let currentImage = property.galleryImages?.[0] || property.imageUrl; 
  
    // Format price (could be moved to a helper function later)
    const formattedPrice = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(property.price);
  
  </script>
  
  <div class="container mx-auto px-4 py-8 sm:py-12">
    
    <!-- Back Link (Optional) -->
    <a href="/properties" class="text-brand-blue hover:underline mb-6 inline-block">← Back to Listings</a>
  
    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      
      <!-- Left Column (Gallery & Map) -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Image Gallery Placeholder (Shows main image for now) -->
        <div class="bg-gray-200 rounded-lg overflow-hidden shadow-lg">
           {#if currentImage}
             <img 
               src={currentImage} 
               alt="Main view of {property.title}" 
               class="w-full h-auto max-h-[600px] object-cover" 
             />
           {:else}
              <div class="w-full h-96 flex items-center justify-center text-gray-500">No Image Available</div>
           {/if}
           <!-- Simple Thumbnail Row (Placeholder - needs functionality) -->
           {#if property.galleryImages && property.galleryImages.length > 1}
             <div class="p-2 bg-gray-100 flex space-x-2 overflow-x-auto">
               {#each property.galleryImages as imgUrl, i (imgUrl)}
                 <button 
                   on:click={() => currentImage = imgUrl} 
                   class="h-16 w-20 flex-shrink-0 rounded overflow-hidden border-2 {currentImage === imgUrl ? 'border-brand-blue' : 'border-transparent'} hover:border-brand-blue transition"
                 >
                   <img src={imgUrl} alt="Thumbnail {i+1}" class="w-full h-full object-cover">
                 </button>
               {/each}
             </div>
           {/if}
        </div>
  
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
  
        <!-- Map Placeholder -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Location</h2>
          <div class="bg-gray-200 h-64 rounded flex items-center justify-center text-gray-500">
            <!-- Interactive Map will be integrated here -->
            Map Placeholder (Lat: {property.location?.lat}, Lon: {property.location?.lon})
          </div>
        </div>
      </div>
  
      <!-- Right Column (Details & Agent Info) -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Sticky Details Card -->
        <div class="bg-white p-6 rounded-lg shadow sticky top-24"> 
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
          <p class="text-gray-600 text-sm mb-4 flex items-center">
            <MapPin class="w-4 h-4 mr-1 text-muted-blue inline-block" /> 
            {property.address}
          </p>
          <p class="text-3xl font-bold text-brand-blue mb-6">{formattedPrice}</p>
  
          <!-- Key Stats -->
          <div class="grid grid-cols-3 gap-4 text-center border-t border-b py-4 mb-6">
            {#if property.beds !== null}
              <div>
                <Bed class="w-6 h-6 mx-auto mb-1 text-muted-blue" />
                <span class="text-sm font-semibold">{property.beds}</span>
                <span class="block text-xs text-gray-500">Bed{property.beds !== 1 ? 's' : ''}</span>
              </div>
            {:else}
               <div class="opacity-50">
                 <Bed class="w-6 h-6 mx-auto mb-1 text-gray-400" />
                 <span class="text-sm font-semibold">-</span>
                 <span class="block text-xs text-gray-500">Beds</span>
               </div>
            {/if}
             {#if property.baths !== null}
              <div>
                <Bath class="w-6 h-6 mx-auto mb-1 text-muted-blue" />
                <span class="text-sm font-semibold">{property.baths}</span>
                <span class="block text-xs text-gray-500">Bath{property.baths !== 1 ? 's' : ''}</span>
              </div>
            {:else}
               <div class="opacity-50">
                 <Bath class="w-6 h-6 mx-auto mb-1 text-gray-400" />
                 <span class="text-sm font-semibold">-</span>
                 <span class="block text-xs text-gray-500">Baths</span>
               </div>
            {/if}
             {#if property.area !== null}
              <div>
                <Maximize class="w-6 h-6 mx-auto mb-1 text-muted-blue" />
                <span class="text-sm font-semibold">{property.area.toLocaleString()}</span>
                <span class="block text-xs text-gray-500">sqft</span>
              </div>
            {:else}
               <div class="opacity-50">
                 <Maximize class="w-6 h-6 mx-auto mb-1 text-gray-400" />
                 <span class="text-sm font-semibold">-</span>
                 <span class="block text-xs text-gray-500">sqft</span>
               </div>
            {/if}
          </div>
  
          <!-- Quick Details -->
          <div class="space-y-2 text-sm mb-6">
            {#if property.propertyType}
              <p><strong class="text-gray-700 w-24 inline-block">Type:</strong> {property.propertyType}</p>
            {/if}
            {#if property.yearBuilt}
              <p><strong class="text-gray-700 w-24 inline-block">Year Built:</strong> {property.yearBuilt}</p>
            {/if}
             <p><strong class="text-gray-700 w-24 inline-block">Status:</strong> For Sale</p> <!-- Example status -->
          </div>
  
          <!-- Action Buttons -->
          <div class="space-y-3">
            <button class="w-full bg-brand-blue text-white font-semibold py-3 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out">
              Request Info / Schedule Visit
            </button>
            <button class="w-full bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-md shadow hover:bg-gray-300 transition duration-300 ease-in-out">
              Save Property
            </button>
          </div>
        </div>
  
        <!-- Agent Info Card (Placeholder) -->
        {#if property.agent}
          <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Contact Agent</h3>
            <p class="font-medium text-gray-700">{property.agent.name}</p>
            <p class="text-sm text-gray-600">{property.agent.phone}</p>
            <p class="text-sm text-gray-600">{property.agent.email}</p>
            <!-- Add agent photo later -->
          </div>
        {/if}
  
      </div>
  
    </div>
  
  </div>
  
  <style>
    /* Add any component-specific styles if needed */
    .whitespace-pre-line {
       white-space: pre-line; /* Allows line breaks in description */
    }
  </style>