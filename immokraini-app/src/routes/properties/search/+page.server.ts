import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import type { Prisma } from '@prisma/client';

// -------------------------------------------------------------------
// Properties search page ‑ server‑side data loader (no `mode: "insensitive"`)
// -------------------------------------------------------------------
// Accepts the following query‑string parameters:
//   • location   – substring matched against title/address
//   • type       – exact match on propertyType
//   • minPrice   – minimum price (integer)
//   • maxPrice   – maximum price (integer)
//
// Returns a list of properties for display in the <PropertyCard />
// component together with the raw search criteria so the UI can keep
// the form in sync.
// -------------------------------------------------------------------
export const load: PageServerLoad = async ({ url }) => {
  console.log('--- [properties/search] load() START ---');

  /* ---------------------------------------------------------------
     1.  Extract and normalise search parameters
  --------------------------------------------------------------- */
  const location  = url.searchParams.get('location')?.trim() || '';
  const type      = url.searchParams.get('type')?.trim()      || '';
  const minPrice  = parseInt(url.searchParams.get('minPrice') || '0', 10);
  const maxPrice  = parseInt(url.searchParams.get('maxPrice') || '0', 10);

  console.log('Search params →', { location, type, minPrice, maxPrice });

  /* ---------------------------------------------------------------
     2.  Build a Prisma "where" clause dynamically
  --------------------------------------------------------------- */
  const where: Prisma.PropertyWhereInput = {};
  const priceFilter: Prisma.IntFilter = {};
  let   priceConditionsMet = false;

  if (location) {
    // Without `mode: "insensitive"` we compare as‑is; ensure the UI
    // sends the desired case or rely on a DB collation that ignores case.
    where.OR = [
      { address: { contains: location } },
      { title:   { contains: location } }
    ];
  }

  if (type) {
    where.propertyType = { equals: type };
  }

  if (minPrice > 0) { priceFilter.gte = minPrice; priceConditionsMet = true; }
  if (maxPrice > 0) { priceFilter.lte = maxPrice; priceConditionsMet = true; }
  if (priceConditionsMet) {
    where.price = priceFilter;
  }

  console.log('Prisma where clause →', JSON.stringify(where, null, 2));

  /* ---------------------------------------------------------------
     3.  Query the database
  --------------------------------------------------------------- */
  try {
    console.log('Executing Prisma query…');

    const rows = await prisma.property.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        address: true,
        price: true,
        beds: true,
        baths: true,
        area: true,
        imageUrl: true,
        propertyType: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Prisma returned ${rows.length} row(s).`);

    /* -----------------------------------------------------------
       4.  Post‑process rows (defensive null handling)
    ----------------------------------------------------------- */
    const properties = rows.map((prop) => ({
      ...prop,
      beds:         prop.beds ?? null,
      baths:        prop.baths ?? null,
      area:         prop.area ?? null,
      imageUrl:     prop.imageUrl ?? null,
      propertyType: prop.propertyType ?? null,
    }));

    console.log('--- [properties/search] load() SUCCESS ---');

    return {
      properties,
      searchCriteria: {
        location:  url.searchParams.get('location')  || '',
        type:      url.searchParams.get('type')      || '',
        minPrice:  url.searchParams.get('minPrice')  || '',
        maxPrice:  url.searchParams.get('maxPrice')  || ''
      }
    };
  } catch (err) {
    /* -----------------------------------------------------------
       5.  Handle database errors gracefully
    ----------------------------------------------------------- */
    console.error('--- [properties/search] load() ERROR ---', err);

    return {
      properties: [],
      searchCriteria: {
        location:  url.searchParams.get('location')  || '',
        type:      url.searchParams.get('type')      || '',
        minPrice:  url.searchParams.get('minPrice')  || '',
        maxPrice:  url.searchParams.get('maxPrice')  || ''
      },
      error: 'Failed to load properties – please try again later.'
    };
  }
};