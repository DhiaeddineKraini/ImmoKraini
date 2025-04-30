<script lang="ts">
    // Import the new component
    import PropertyCard from '$lib/components/PropertyCard.svelte';
  
    // Sample data for placeholder cards (replace with real data later)
    const featuredProperties = [
      { 
        id: 1, 
        imageUrl: '/property-1.jpg', // Assumes you have sample images in /static
        detailUrl: '/properties/luxury-villa-riverside', 
        title: 'Luxury Villa Riverside', 
        address: '12 River View, Kraini City', 
        price: 850000, 
        beds: 4, 
        baths: 3, 
        area: 2800 
      },
      { 
        id: 2, 
        imageUrl: '/property-2.jpg', 
        detailUrl: '/properties/modern-downtown-apartment', 
        title: 'Modern Downtown Apartment', 
        address: '45 Main St, Apt 10B, Kraini City', 
        price: 420000, 
        beds: 2, 
        baths: 2, 
        area: 1100 
      },
      { 
        id: 3, 
        imageUrl: '/property-3.jpg', 
        detailUrl: '/properties/cozy-suburban-house', 
        title: 'Cozy Suburban House', 
        address: '7 Green Lane, Kraini Suburbs', 
        price: 580000, 
        beds: 3, 
        baths: 2, 
        area: 1950 
      },
       { 
        id: 4, 
        imageUrl: '/placeholder-property.jpg', // Using default placeholder
        detailUrl: '/properties/scenic-building-land', 
        title: 'Scenic Building Land', 
        address: 'Lot 5, Mountain Rd, Kraini Hills', 
        price: 150000, 
        beds: null, // No beds/baths for land
        baths: null, 
        area: 43560 // Example area (1 acre)
      },
    ];
  
  </script>
  
  <main>
    <!-- ========================== Hero Section ========================== -->
    <section 
      class="relative flex h-screen items-center justify-center overflow-hidden text-white bg-cover bg-center"
      style="background-image: url('/hero-background.jpg');" 
      aria-label="Hero section with background image" 
      role="banner"
    >
      <div class="absolute inset-0 bg-black/30 z-0" aria-hidden="true"></div> 
      <div class="relative z-10 text-center p-8 max-w-4xl mx-auto">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Find Your Dream Home in Kraini
        </h1>
        <p class="text-lg md:text-xl mb-8 drop-shadow-md">
          Explore exclusive properties with ImmoKraini, your trusted real estate partner.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="bg-white text-muted-blue hover:bg-gray-100 font-semibold py-3 px-6 rounded-md transition duration-300 ease-in-out shadow hover:shadow-md">
            Search Properties
          </button>
          <button class="bg-transparent border-2 border-white text-white hover:bg-white/20 font-semibold py-3 px-6 rounded-md transition duration-300 ease-in-out shadow hover:shadow-md">
            Sell With Us
          </button>
        </div>
      </div>
    </section>
    <!-- ========================== End Hero Section ========================== -->
  
  
    <!-- ================== Property Search Section ================== -->
    <section id="search-section" class="py-16 px-4 bg-white">
      <h2 class="text-center text-3xl font-bold mb-8 text-muted-blue">
        Search Properties
      </h2>
      <div class="max-w-5xl mx-auto bg-gray-50 p-6 sm:p-8 rounded-lg shadow-lg">
        <form class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" id="location" name="location" placeholder="Enter city, neighborhood, address..." class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50" />
          </div>
          <div>
            <label for="property-type" class="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select id="property-type" name="property-type" class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50">
              <option value="">Any</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label for="min-price" class="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input type="number" id="min-price" name="min-price" placeholder="Any" min="0" step="1000" class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50" />
            </div>
            <div>
              <label for="max-price" class="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input type="number" id="max-price" name="max-price" placeholder="Any" min="0" step="1000" class="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50" />
            </div>
          </div>
          <button type="submit" class="w-full bg-brand-blue text-white font-semibold py-2 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
            Search
          </button>
        </form>
      </div>
    </section>
    <!-- ================== End Search Section ================== -->
  
  
    <!-- ================== Featured Properties Section ================== -->
    <section id="featured-properties" class="py-16 px-4 bg-gray-100"> 
      <div class="container mx-auto">
        <h2 class="text-center text-3xl font-bold mb-12 text-muted-blue">
          Featured Properties
        </h2>
        
        <!-- Grid for Property Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          
          <!-- Loop through sample data using #each block -->
          {#each featuredProperties as property (property.id)}
            <PropertyCard 
              imageUrl={property.imageUrl}
              detailUrl={property.detailUrl}
              title={property.title}
              address={property.address}
              price={property.price}
              beds={property.beds}
              baths={property.baths}
              area={property.area}
            />
          {/each}
  
        </div>
  
        <!-- Optional: Button to view all properties -->
        <div class="text-center mt-12">
          <a href="/properties" class="bg-brand-blue text-white font-semibold py-3 px-8 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out">
            View All Properties
          </a>
        </div>
  
      </div>
    </section>
    <!-- ================== End Featured Properties Section ================== -->
  
  
    <!-- Future sections (About Us, Footer etc.) can be added here -->
  
  </main>
  
  <style>
    /* Ken Burns animation for the hero background image */
    section[style*="hero-background.jpg"] { 
      animation: kenburns 20s ease-in-out infinite alternate;
    }
  
    @keyframes kenburns {
      0% {
        background-size: 100% 100%; 
        background-position: center center; 
      }
      100% {
        background-size: 120% 120%; 
        background-position: top left; 
      }
    }
  </style>