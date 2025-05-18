<script lang="ts">
  import { Heart } from 'lucide-svelte';
  import savedPropertyIds, { toggleFavorite } from '$lib/stores/favoritesStore';
  import { t } from '$lib/i18n/i18n.js'; // Import translation store

  // ── Props ────────────────────────────────────────────────────────────────────
  export let id: string;
  export let imageUrl: string = '/placeholder-property.jpg';
  export let detailUrl: string = '#';
  export let title: string = 'Default Property Title';
  export let address: string = '123 Default St, City';
  export let price: number = 0;
  export let beds: number | null = null;
  export let baths: number | null = null;
  export let area: number | null = null; // m²

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const formattedPrice = new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 0
  }).format(price);

  // Is this property already in the user's favourites?
  $: isCurrentlyFavorite = $savedPropertyIds.includes(id);

  function handleFavoriteClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(id);
  }
</script>

<!-- ── Card ──────────────────────────────────────────────────────────────────── -->
<div
  class="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-[1.03] group flex flex-col h-full relative"
>

  <!-- Property image -->
  <a href={detailUrl} class="block relative overflow-hidden h-48 flex-shrink-0">
    <img
      src={imageUrl}
      alt={`Property image for ${title}`}
      class="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      loading="lazy"
    />
  </a>

  <!-- Content -->
  <div class="p-4 flex flex-col flex-grow">
    <!-- Price and Favorite Button -->
    <div class="flex justify-between items-center mb-2">
      <p class="text-xl font-bold text-brand-blue mb-0">{formattedPrice}</p>
      <button
        on:click={handleFavoriteClick}
        class="relative p-1.5 rounded-full transition-colors duration-200 shadow-sm shadow-gray-300 ring-1 ring-gray-300/50 z-10
               {isCurrentlyFavorite
                   ? 'bg-red-100/80 text-red-500 hover:bg-red-200/90'
                   : 'bg-gray-200/70 text-gray-500 hover:bg-gray-300/80 hover:text-red-500'}"
        aria-label={isCurrentlyFavorite ? $t('property.removeFavorite') : $t('property.addFavorite')}
        title={isCurrentlyFavorite ? $t('property.removeFavorite') : $t('property.addFavorite')}
      >
        <Heart
          class="w-5 h-5"
          fill={isCurrentlyFavorite ? 'currentColor' : 'none'}
          stroke-width={2}
        />
      </button>
    </div>

    <!-- Title & address -->
    <h3
      class="text-lg font-semibold text-gray-800 truncate mb-1"
      title={title}
    >
      {title}
    </h3>
    <p
      class="text-sm text-gray-600 truncate mb-3"
      title={address}
    >
      {address}
    </p>

    <!-- Spacer to push stats to bottom -->
    <div class="flex-grow"></div>

    <!-- Stats -->
    <div
      class="flex justify-between items-center text-sm text-gray-700 border-t pt-3 mt-3"
    >
      <div class="flex space-x-3">
        {#if beds !== null}
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1 text-muted-blue"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            {beds} {$t('property.beds')}
          </span>
        {/if}

        {#if baths !== null}
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-1 text-muted-blue"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14.5 1 16.5 3.209 16.5 6c0 2.5-1.5 5-1.5 5l2.657 2.657z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
              />
            </svg>
            {baths} {$t('property.baths')}
          </span>
        {/if}
      </div>

      {#if area !== null}
        <span class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1 text-muted-blue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          {area} m²
        </span>
      {/if}
    </div>

    <!-- Call‑to‑action -->
    <a
      href={detailUrl}
    >
    
    </a>
  </div>
</div>

<style lang="postcss">
/* Add component‑specific overrides here if needed */
</style>
