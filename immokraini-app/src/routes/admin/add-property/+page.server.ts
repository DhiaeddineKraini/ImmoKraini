// src/routes/admin/add-property/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

// Optional: Load agents for dropdown later
// export const load: PageServerLoad = async () => {
//     const agents = await prisma.agent.findMany({ select: { id: true, name: true }});
//     return { agents };
// };

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();

        // --- Extract and Validate Data ---
        const data = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string,
            address: formData.get('address') as string,
            price: parseInt(formData.get('price') as string || '0', 10),
            beds: parseInt(formData.get('beds') as string || '', 10) || null, // Handle empty string
            baths: parseInt(formData.get('baths') as string || '', 10) || null,
            area: parseInt(formData.get('area') as string || '', 10) || null,
            propertyType: formData.get('propertyType') as string || null,
            yearBuilt: parseInt(formData.get('yearBuilt') as string || '', 10) || null,
            description: formData.get('description') as string || null,
            features: formData.get('features') as string || null, // Will be stringified later
            imageUrl: formData.get('imageUrl') as string || null,
            galleryImages: formData.get('galleryImages') as string || null, // Will be stringified later
            videoUrl: formData.get('videoUrl') as string || null,
            latitude: parseFloat(formData.get('latitude') as string || '') || null,
            longitude: parseFloat(formData.get('longitude') as string || '') || null,
            agentId: formData.get('agentId') as string || null,
        };

        // Basic required field validation
        if (!data.title || !data.slug || !data.address || !data.price) {
            return fail(400, { error: 'Missing required fields (Title, Slug, Address, Price).', data });
        }
        // Slug format validation
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
             return fail(400, { error: 'Slug must contain only lowercase letters, numbers, and hyphens.', data });
        }
        // Check if slug already exists
        const existing = await prisma.property.findUnique({ where: { slug: data.slug }});
        if (existing) {
             return fail(400, { error: `Slug "${data.slug}" is already taken. Please choose another.`, data });
        }
        // Add more validation as needed...

        // --- Prepare Data for Prisma ---
        // Split comma-separated strings and stringify arrays
        const featuresArray = data.features?.split(',').map(f => f.trim()).filter(f => f) ?? [];
        const galleryArray = data.galleryImages?.split(',').map(f => f.trim()).filter(f => f) ?? [];

        const prismaData = {
            ...data,
            features: featuresArray.length > 0 ? JSON.stringify(featuresArray) : null,
            galleryImages: galleryArray.length > 0 ? JSON.stringify(galleryArray) : null,
            // Ensure agentId is null if empty string was submitted
            agentId: data.agentId === '' ? null : data.agentId, 
        };

        // --- Create Property in Database ---
        try {
            const newProperty = await prisma.property.create({
                data: prismaData
            });
            console.log('Created new property:', newProperty.id, newProperty.title);
            
            // Option 1: Redirect to the new property's page
            // redirect(303, `/properties/${newProperty.slug}`); 
            
            // Option 2: Return success message to the form
            return { success: true, addedTitle: newProperty.title };

        } catch (err) {
            console.error("Error creating property:", err);
            return fail(500, { error: 'Failed to create property in database.', data });
        }
    }
};