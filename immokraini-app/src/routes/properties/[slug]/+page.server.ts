import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// --- Placeholder Data Fetching ---
// In a real app, you would fetch this from your database/CMS/API
// based on the 'slug' parameter.
const propertiesDatabase = [
     { 
      id: 1, 
      slug: 'luxury-villa-riverside', // Matches the URL parameter
      imageUrl: '/property-1.jpg', 
      galleryImages: ['/property-1.jpg', '/interior-1.jpg', '/interior-2.jpg', '/exterior-1.jpg'], // Sample gallery
      title: 'Luxury Villa Riverside', 
      address: '12 River View, Kraini City', 
      price: 850000, 
      beds: 4, 
      baths: 3, 
      area: 2800,
      description: 'Experience unparalleled luxury in this stunning riverside villa. Featuring breathtaking views, modern amenities, spacious living areas, and a private dock. Perfect for families or entertaining guests.',
      features: ['Private Pool', 'River View', 'Modern Kitchen', 'Home Office', '3-Car Garage', 'Smart Home System'],
      propertyType: 'House',
      yearBuilt: 2018,
      agent: { name: 'Jane Doe', phone: '555-1234', email: 'jane.doe@immokraini.com' },
      location: { lat: 34.0522, lon: -118.2437 } // Example coordinates (Los Angeles)
    },
    { 
      id: 2, 
      slug: 'modern-downtown-apartment',
      imageUrl: '/property-2.jpg', 
      galleryImages: ['/property-2.jpg', '/interior-3.jpg', '/interior-4.jpg', '/balcony-view.jpg'],
      title: 'Modern Downtown Apartment', 
      address: '45 Main St, Apt 10B, Kraini City', 
      price: 420000, 
      beds: 2, 
      baths: 2, 
      area: 1100,
      description: 'Chic and stylish apartment in the heart of downtown. Enjoy city living with floor-to-ceiling windows, high-end finishes, and access to building amenities including a gym and rooftop terrace.',
      features: ['City View', 'Gym Access', 'Rooftop Terrace', 'Concierge', 'Walk-in Closet'],
       propertyType: 'Apartment',
       yearBuilt: 2020,
       agent: { name: 'John Smith', phone: '555-5678', email: 'john.smith@immokraini.com' },
       location: { lat: 34.0550, lon: -118.2500 } // Example coordinates
    },
     { 
      id: 3, 
      slug: 'cozy-suburban-house', 
      imageUrl: '/property-3.jpg',
      galleryImages: ['/property-3.jpg', '/interior-5.jpg', '/backyard.jpg'],
      title: 'Cozy Suburban House', 
      address: '7 Green Lane, Kraini Suburbs', 
      price: 580000, 
      beds: 3, 
      baths: 2, 
      area: 1950,
      description: 'Charming family home in a quiet suburban neighborhood. Features a large backyard, updated kitchen, and proximity to parks and schools. Ideal for raising a family.',
      features: ['Large Backyard', 'Updated Kitchen', 'Fireplace', 'Near Park', 'Good Schools'],
      propertyType: 'House',
      yearBuilt: 1995,
      agent: { name: 'Jane Doe', phone: '555-1234', email: 'jane.doe@immokraini.com' },
      location: { lat: 34.0400, lon: -118.2600 } // Example coordinates
    },
     { 
      id: 4, 
      slug: 'scenic-building-land', 
      imageUrl: '/placeholder-property.jpg', 
      galleryImages: ['/placeholder-property.jpg', '/land-view-1.jpg'],
      title: 'Scenic Building Land', 
      address: 'Lot 5, Mountain Rd, Kraini Hills', 
      price: 150000, 
      beds: null, 
      baths: null, 
      area: 43560, // 1 acre
      description: 'Beautiful plot of land with scenic views, ready for you to build your dream home. Utilities available nearby. Located in the desirable Kraini Hills area.',
      features: ['Mountain View', 'Buildable Lot', 'Utilities Nearby'],
      propertyType: 'Land',
      yearBuilt: null,
      agent: { name: 'John Smith', phone: '555-5678', email: 'john.smith@immokraini.com' },
      location: { lat: 34.0700, lon: -118.2800 } // Example coordinates
    },
];

export const load: PageServerLoad = async ({ params }) => {
  const propertySlug = params.slug; // Get the slug from the URL

  // Find the property in our placeholder database
  const property = propertiesDatabase.find(p => p.slug === propertySlug);

  if (!property) {
    // If property not found, throw a 404 error
    error(404, 'Property not found');
  }

  // Return the found property data
  // This data will be available in the +page.svelte file via the 'data' prop
  return {
    property: property 
  };
};