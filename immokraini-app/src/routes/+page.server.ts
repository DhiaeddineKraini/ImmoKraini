// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma'; // Make sure prisma client is imported

export const load: PageServerLoad = async () => {
    console.log('--- HOMEPAGE LOAD FUNCTION RUNNING ---'); 
    try {
        // Use Promise.all to fetch properties and agents concurrently
        const [propertiesResult, agentsResult] = await Promise.all([
            // Fetch Featured Properties (existing query)
            prisma.property.findMany({
                where: { isFeatured: true },
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
                orderBy: { createdAt: 'desc' },
                take: 4,
            }),
            // Fetch Agents
            prisma.agent.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    imageUrl: true,
                    // Add 'title' field here if you add it to the Agent model in schema.prisma
                },
                orderBy: { name: 'asc' },
                // Optionally limit the number: take: 3
            }),
        ]);

        console.log(`--- Found ${propertiesResult.length} featured properties in DB ---`);
        console.log(`--- Found ${agentsResult.length} agents in DB ---`);

        // Process properties
        const featuredProperties = propertiesResult.map((prop) => ({
            ...prop,
            beds: prop.beds ?? null,
            baths: prop.baths ?? null,
            area: prop.area ?? null,
            imageUrl: prop.imageUrl ?? null,
            propertyType: prop.propertyType ?? null,
        }));

        // Process agents
        const agents = agentsResult.map((agent) => ({
            ...agent,
            phone: agent.phone ?? null,
            imageUrl: agent.imageUrl ?? null,
            // title: agent.title ?? 'Agent' // Uncomment if title field exists
        }));

        console.log('--- HOMEPAGE LOAD FUNCTION SUCCESS ---');
        return {
            featuredProperties,
            agents,
        };
    } catch (err) {
        console.error('--- HOMEPAGE LOAD ERROR ---:', err);
        return {
            featuredProperties: [],
            agents: [],
            error: 'Could not load page data.',
        };
    }
};