<script lang="ts">
    // Define properties the component accepts
    export let imageUrl: string = '/placeholder-property.jpg'; // Default placeholder
    export let detailUrl: string = '#'; // Default link
    export let title: string = 'Default Property Title';
    export let address: string = '123 Default St, City';
    export let price: number = 0;
    export let beds: number | null = null; // Allow null if not applicable (e.g., land)
    export let baths: number | null = null;
    export let area: number | null = null; // Area in sqft or sqm
  
    // Format price for display
    const formattedPrice = new Intl.NumberFormat('fr-TN', { 
      style: 'currency', 
      currency: 'TND', // Adjust currency as needed
      maximumFractionDigits: 0 // No cents for large prices
    }).format(price);
  
  </script>
  
  <!-- Card container with shadow, rounded corners, overflow hidden for image zoom -->
  <div class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 group">
    <a href={detailUrl} class="block">
      <!-- Image container -->
      <div class="relative overflow-hidden h-48"> 
        <img 
          src={imageUrl} 
          alt="Property image for {title}" 
          class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          loading="lazy"
        />
        <!-- Optional: Add a badge/tag (e.g., "New Listing", "Reduced") -->
        <!-- <span class="absolute top-2 left-2 bg-brand-orange text-white text-xs font-semibold px-2 py-1 rounded">New</span> -->
      </div>
  
      <!-- Content Area -->
      <div class="p-4">
        <!-- Price -->
        <p class="text-xl font-bold text-brand-blue mb-1">{formattedPrice}</p>
        
        <!-- Title/Address -->
        <h3 class="text-lg font-semibold text-gray-800 truncate mb-1" title={title}>{title}</h3>
        <p class="text-sm text-gray-600 truncate mb-3" title={address}>{address}</p>
  
        <!-- Key Stats (Beds, Baths, Area) - Conditionally rendered -->
        <div class="flex justify-between items-center text-sm text-gray-700 border-t pt-3">
          <div class="flex space-x-3">
            {#if beds !== null}
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                {beds} Bed{beds !== 1 ? 's' : ''}
              </span>
            {/if}
            {#if baths !== null}
               <span class="flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.5 1 16.5 3.209 16.5 6c0 2.5-1.5 5-1.5 5l2.657 2.657z" /><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
                 {baths} Bath{baths !== 1 ? 's' : ''}
               </span>
            {/if}
          </div>
           {#if area !== null}
             <span class="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
               {area} m² 
               <!-- Adjust unit (sqm etc.) as needed -->
             </span>
           {/if}
        </div>
      </div>
    </a>
  </div>
  
  <style lang="postcss">
    /* Add component-specific styles if needed */
  </style>