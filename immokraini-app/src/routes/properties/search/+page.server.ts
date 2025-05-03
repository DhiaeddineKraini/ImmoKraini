import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';        // Comment out if you don’t have Prisma wired up
import type { Prisma } from '@prisma/client';

/* ------------------------------------------------------------------
   ❶  Fallback data for local‑only use (no database required)
   ------------------------------------------------------------------ */
const propertiesDatabase = [
  {
    id: 1,
    slug: 'luxury-villa-houmt-souk',
    imageUrl: '/property-1.jpg',
    galleryImages: ['/property-1.jpg', '/interior-1.jpg', '/interior-2.jpg', '/exterior-1.jpg'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'Luxury Villa near Houmt Souk',
    address: 'Route Touristique, Houmt Souk, Djerba',
    price: 950000,
    beds: 4,
    baths: 3,
    area: 280,
    description: 'Stunning luxury villa...',
    features: ['Private Pool', 'Sea View', 'Modern Kitchen'],
    propertyType: 'Villa',
    yearBuilt: 2019,
    agent: {
      name: 'Aisha Ben Ali',
      phone: '+216 75 123 456',
      email: 'aisha.benali@immokraini.com'
    },
    location: { lat: 33.8718, lon: 10.8500 }
  },
  /* … add the other placeholder objects exactly as before … */
];

/* ------------------------------------------------------------------
   ❷  Helper: build a Prisma‑compatible `where` clause **and** a JS
       predicate we can reuse against the fallback array.
   ------------------------------------------------------------------ */
function buildFilters(params: URLSearchParams) {
  const location = params.get('location')?.toLowerCase() || '';
  const type      = params.get('type')?.toLowerCase()      || '';
  const minPrice  = parseInt(params.get('minPrice') || '0', 10);
  const maxPrice  = parseInt(params.get('maxPrice') || '0', 10);

  /* ----- A)  Prisma `where` object (works on SQLite & Postgres) ----- */
  const where: Prisma.PropertyWhereInput = {};
  const priceFilter: Prisma.IntFilter = {};
  let   priceConditions = false;

  if (location) {
    where.OR = [
      { address: { contains: location } },
      { title:   { contains: location } }
    ];
  }

  if (type) {
    where.propertyType = { equals: type };
  }

  if (minPrice > 0) { priceFilter.gte = minPrice; priceConditions = true; }
  if (maxPrice > 0) { priceFilter.lte = maxPrice; priceConditions = true; }
  if (priceConditions) where.price = priceFilter;

  /* ----- B)  Plain JS predicate for fallback array ----------------- */
  const predicate = (property: any) => {
    if (location &&
        !property.address.toLowerCase().includes(location) &&
        !property.title.toLowerCase().includes(location)) return false;

    if (type) {
      const pType = property.propertyType?.toLowerCase() || '';
      if (pType !== type && !(type === 'house' && pType.includes('house'))) return false;
    }

    if (minPrice > 0 && property.price < minPrice) return false;
    if (maxPrice > 0 && property.price > maxPrice) return false;

    return true;
  };

  return { where, predicate, rawCriteria: { location, type, minPrice, maxPrice } };
}

/* ------------------------------------------------------------------
   ❸  SvelteKit `load` function
   ------------------------------------------------------------------ */
export const load: PageServerLoad = async ({ url }) => {
  const { where, predicate, rawCriteria } = buildFilters(url.searchParams);

  /* Try Prisma first ------------------------------------------------ */
  try {
    const rows = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    /* Ensure JSON/text columns are parsed so they match placeholder */
    const properties = rows.map(r => ({
      ...r,
      galleryImages: r.galleryImages ? JSON.parse(r.galleryImages) : [],
      features:      r.features      ? JSON.parse(r.features)      : [],
      // Optional columns (keep nulls so UI can test with `??`)
      beds: r.beds ?? null,
      baths: r.baths ?? null,
      area: r.area ?? null,
      description: r.description ?? null,
      propertyType: r.propertyType ?? null,
      yearBuilt: r.yearBuilt ?? null,
      imageUrl: r.imageUrl ?? null,
      videoUrl: r.videoUrl ?? null,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      agentId: r.agentId ?? null
    }));

    return {
      properties,
      searchCriteria: {
        location: url.searchParams.get('location') || '',
        type:     url.searchParams.get('type')     || '',
        minPrice: url.searchParams.get('minPrice') || '',
        maxPrice: url.searchParams.get('maxPrice') || ''
      }
    };
  } catch (err) {
    console.warn('[load] Prisma failed, falling back to local DB:', err);
    /* Fallback to in‑memory array ----------------------------------- */
    const properties = propertiesDatabase.filter(predicate);

    return {
      properties,
      searchCriteria: {
        location: url.searchParams.get('location') || '',
        type:     url.searchParams.get('type')     || '',
        minPrice: url.searchParams.get('minPrice') || '',
        maxPrice: url.searchParams.get('maxPrice') || ''
      },
      error: 'Using local placeholder data – database unreachable.'
    };
  }
};
