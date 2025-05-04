// prisma/seed.mjs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the property data with correct isFeatured and features arrays
const propertiesData = [
    { 
        id_placeholder: 1, 
        slug: 'luxury-villa-houmt-souk', 
        imageUrl: '/property-1.jpg', 
        galleryImages: ['/property-1.jpg', '/interior-1.jpg', '/interior-2.jpg', '/exterior-1.jpg'], 
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
        title: 'Luxury Villa near Houmt Souk', 
        address: 'Route Touristique, Houmt Souk, Djerba', 
        price: 950000, beds: 4, baths: 3, area: 280, 
        description: 'Stunning luxury villa with sea views, located near the heart of Houmt Souk. Features modern amenities, spacious living areas, and a beautiful private pool.', 
        features: ['Private Pool', 'Sea View', 'Modern Kitchen', 'Garden', 'Garage', 'Air Conditioning'], // <<< Pass array directly
        propertyType: 'Villa', yearBuilt: 2019, 
        agentName: 'Aisha Ben Ali', 
        location: { lat: 33.8718, lon: 10.8500 }, 
        isFeatured: true 
    },
    { 
        id_placeholder: 2, 
        slug: 'charming-menzel-midoun', 
        imageUrl: '/property-2.jpg', 
        galleryImages: ['/property-2.jpg', '/interior-3.jpg', '/interior-4.jpg', '/courtyard.jpg'], 
        videoUrl: null, 
        title: 'Charming Menzel in Midoun', 
        address: 'Near Midoun Center, Djerba', 
        price: 480000, beds: 3, baths: 2, area: 150, 
        description: 'Traditional Djerbian Menzel beautifully restored, located in a quiet area near Midoun. Enjoy the authentic architecture with a central courtyard and comfortable living spaces.', 
        features: ['Traditional Architecture', 'Courtyard', 'Quiet Area', 'Near Market', 'Air Conditioning'], // <<< Pass array directly
        propertyType: 'Menzel (House)', yearBuilt: 1985, 
        agentName: 'Karim Trabelsi', 
        location: { lat: 33.8060, lon: 10.9600 }, 
        isFeatured: false 
    },
    { 
        id_placeholder: 3, 
        slug: 'beachfront-apartment-aghir', 
        imageUrl: '/property-3.jpg',
        galleryImages: ['/property-3.jpg', '/interior-5.jpg', '/beach-view.jpg'],
        videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_HERE', 
        title: 'Beachfront Apartment in Aghir', 
        address: 'Coastal Road, Aghir, Djerba', 
        price: 350000, beds: 2, baths: 1, area: 90,
        description: 'Modern apartment with direct access to the beach in Aghir. Perfect holiday home or rental investment with stunning sea views from the balcony.',
        features: ['Direct Beach Access', 'Sea View Balcony', 'Shared Pool', 'Furnished', 'Rental Potential'], // <<< Pass array directly
        propertyType: 'Apartment', yearBuilt: 2015,
        agentName: 'Aisha Ben Ali', 
        location: { lat: 33.7480, lon: 11.0350 },
        isFeatured: true 
    },
    { 
        id_placeholder: 4, 
        slug: 'olive-grove-land-guellala', 
        imageUrl: '/placeholder-property.jpg', 
        galleryImages: ['/placeholder-property.jpg', '/olive-grove.jpg'],
        videoUrl: null, 
        title: 'Olive Grove Land near Guellala', 
        address: 'Rural Route, near Guellala, Djerba', 
        price: 180000, beds: null, baths: null, area: 10000, 
        description: 'Large plot of agricultural land featuring mature olive trees. Located in a peaceful rural area near the pottery village of Guellala. Ideal for farming or building a secluded retreat.',
        features: ['Olive Trees', 'Agricultural Land', 'Quiet Location', 'Near Guellala'], // <<< Pass array directly
        propertyType: 'Land', yearBuilt: null,
        agentName: 'Karim Trabelsi', 
        location: { lat: 33.7300, lon: 10.7500 },
        isFeatured: false 
    },
];
const agentsData = [
    { name: 'Aisha Ben Ali', email: 'aisha.benali@immokraini.com', phone: '+216 75 123 456', imageUrl: '/agent-aisha.jpg' },
    { name: 'Karim Trabelsi', email: 'karim.trabelsi@immokraini.com', phone: '+216 75 987 654', imageUrl: '/agent-karim.jpg' },
];

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data
  console.log('Deleting existing data...');
  // Important: Delete properties first due to relation constraint if agent delete cascades
  await prisma.property.deleteMany({}); 
  await prisma.agent.deleteMany({});
  console.log('Existing data deleted.');

  // Seed Agents
  console.log(`Seeding ${agentsData.length} agents...`);
  const createdAgents = [];
  for (const agentData of agentsData) {
    const agent = await prisma.agent.create({ data: agentData });
    createdAgents.push(agent); 
    console.log(`Created agent with id: ${agent.id}`);
  }

  // Seed Properties
  console.log(`Seeding ${propertiesData.length} properties...`);
  for (const propData of propertiesData) {
    const agent = createdAgents.find(a => a.name === propData.agentName);
    const property = await prisma.property.create({
      data: {
        slug: propData.slug,
        title: propData.title,
        address: propData.address,
        price: propData.price,
        beds: propData.beds,
        baths: propData.baths,
        area: propData.area,
        description: propData.description,
        propertyType: propData.propertyType,
        yearBuilt: propData.yearBuilt,
        imageUrl: propData.imageUrl,
        // --- Pass arrays directly for PostgreSQL ---
        galleryImages: propData.galleryImages ?? [], 
        features: propData.features ?? [],       
        // --- End Pass arrays ---
        videoUrl: propData.videoUrl,
        latitude: propData.location?.lat,
        longitude: propData.location?.lon,
        agentId: agent?.id, 
        isFeatured: propData.isFeatured ?? false 
      },
    });
    console.log(`Created property: ${property.title}, Featured: ${property.isFeatured}`); 
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });