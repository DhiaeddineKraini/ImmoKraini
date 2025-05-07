// src/routes/saved-properties/+page.server.ts
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma'; 

export const load: PageServerLoad = async () => {
    console.log('--- SAVED PROPERTIES PAGE - SERVER LOAD RUNNING ---');
    try {
        const allPropertiesFromDb = await prisma.property.findMany({
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
                // Add other fields needed by PropertyCard
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const allProperties = allPropertiesFromDb.map(prop => ({
            ...prop,
            beds: prop.beds ?? null,
            baths: prop.baths ?? null,
            area: prop.area ?? null,
            imageUrl: prop.imageUrl ?? null,
            propertyType: prop.propertyType ?? null,
        }));

        console.log(`--- Loaded ${allProperties.length} total properties for saved page ---`);
        return { allProperties }; // Pass all properties to the client

    } catch (err) {
        console.error("Error loading all properties for saved page:", err);
        return { allProperties: [], error: "Could not load property data." };
    }
};