import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import type { Property } from '@prisma/client';

// -------------------------------------------------------------------
// Properties search page - server-side data loader
// -------------------------------------------------------------------
// Accepts the following query-string parameters:
//   • location   – substring matched against title/address
//   • type       – exact match on propertyType
//   • minPrice   – minimum price (integer)
//   • maxPrice   – maximum price (integer)
//   • minBeds    – minimum number of bedrooms
//   • minBaths   – minimum number of bathrooms
//   • sortBy     – field to sort by (price, area, createdAt)
//   • sortOrder  – sort direction (asc, desc)
//   • page       – page number for pagination
//   • perPage    – items per page
// -------------------------------------------------------------------

type ProcessedProperty = {
    id: string;
    slug: string;
    title: string;
    address: string;
    price: number;
    beds: number;
    baths: number;
    area: number;
    propertyType: string | null;
    imageUrl: string | null;
    createdAt: Date;
};

export const load: PageServerLoad = async ({ url }) => {
  console.log('--- [properties/search] load() START ---');

  try {
    // Extract and normalize search parameters
    const location = url.searchParams.get('location')?.toLowerCase() || '';
    const propertyType = url.searchParams.get('type') || '';
    const minPrice = url.searchParams.get('minPrice') ? parseInt(url.searchParams.get('minPrice')!) : null;
    const maxPrice = url.searchParams.get('maxPrice') ? parseInt(url.searchParams.get('maxPrice')!) : null;
    const minBeds = url.searchParams.get('minBeds') ? parseInt(url.searchParams.get('minBeds')!) : null;
    const minBaths = url.searchParams.get('minBaths') ? parseInt(url.searchParams.get('minBaths')!) : null;
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const perPage = Math.max(1, parseInt(url.searchParams.get('perPage') || '12'));

    console.log('Search Parameters:', {
      location,
      propertyType,
      minPrice,
      maxPrice,
      minBeds,
      minBaths,
      sortBy,
      sortOrder,
      page,
      perPage
    });

    // Build the where clause
    const where: any = {};

    if (location) {
      where.address = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (minBeds) {
      where.beds = {
        gte: minBeds
      };
    }

    if (minBaths) {
      where.baths = {
        gte: minBaths
      };
    }

    console.log('Prisma where clause:', JSON.stringify(where, null, 2));

    // Get total count for pagination
    const totalCount = await prisma.property.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
    const validPage = Math.min(Math.max(1, page), totalPages);

    // Calculate skip value
    const skip = Math.max(0, (validPage - 1) * perPage);

    // Validate sort parameters
    const validSortFields = ['price', 'area', 'createdAt'];
    const validSortOrders = ['asc', 'desc'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const finalSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

    console.log('Query parameters:', {
      skip,
      take: perPage,
      orderBy: { [finalSortBy]: finalSortOrder }
    });

    // Get properties with pagination and sorting
    const properties = await prisma.property.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { [finalSortBy]: finalSortOrder },
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
        createdAt: true
      }
    });

    console.log(`Found ${properties.length} properties`);
    console.log('Properties:', properties.map(p => ({
      id: p.id,
      title: p.title,
      beds: p.beds,
      baths: p.baths,
      price: p.price,
      propertyType: p.propertyType
    })));

    // Process properties to handle null values
    const processedProperties: ProcessedProperty[] = properties.map(property => ({
      ...property,
      price: property.price || 0,
      beds: property.beds || 0,
      baths: property.baths || 0,
      area: property.area || 0
    }));

    console.log('--- [properties/search] load() SUCCESS ---');

    return {
      properties: processedProperties,
      searchCriteria: {
        location,
        type: propertyType,
        minPrice,
        maxPrice,
        minBeds,
        minBaths,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder
      },
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        perPage
      }
    };
  } catch (err) {
    console.error('Error in search page load:', err);
    throw error(500, 'Failed to load properties');
  }
};