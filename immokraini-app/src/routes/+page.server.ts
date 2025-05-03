// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
    try {
        const featuredPropertiesFromDb = await prisma.property.findMany({
            where: {
                isFeatured: true // Filter by 'featured' in features array
            },
            select: { // Select only needed fields for PropertyCard
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
            orderBy: {
                createdAt: 'desc' 
            },
            take: 4 // Limit number shown on homepage
        });

        // Process properties (ensure nulls are handled)
         const featuredProperties = featuredPropertiesFromDb.map(prop => ({
            ...prop,
            beds: prop.beds ?? null,
            baths: prop.baths ?? null,
            area: prop.area ?? null,
            imageUrl: prop.imageUrl ?? null,
            propertyType: prop.propertyType ?? null,
        }));

        return { featuredProperties }; 

    } catch (err) {
        console.error("Error fetching featured properties:", err);
        return { featuredProperties: [], error: "Could not load featured properties." };
    }
};