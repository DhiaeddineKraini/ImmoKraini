// src/routes/admin/properties/+page.server.ts
import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Load all properties for the list view
export const load: PageServerLoad = async () => {
    try {
        const properties = await prisma.property.findMany({
            select: { 
                id: true,
                slug: true,
                title: true,
                propertyType: true,
                price: true,
                isFeatured: true, // Select the correct field from schema
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // Map features to isFeatured in the processed properties
        const processedProperties = properties.map(p => ({ ...p, isFeatured: !!p.isFeatured }));
        return { properties: processedProperties }; 
    } catch (err) {
        console.error("Error loading properties for admin:", err);
        return { properties: [], error: "Failed to load properties." };
    }
};

// Handle property deletion AND feature toggle
export const actions: Actions = {
    // --- Delete Action (Existing) ---
    delete: async ({ request }) => {
        const formData = await request.formData();
        const propertyId = formData.get('propertyId') as string;
        if (!propertyId) { return fail(400, { deleteError: 'Invalid Property ID.' }); }
        try {
            const deletedProperty = await prisma.property.delete({ where: { id: propertyId }, select: { title: true } });
            return { deleteSuccess: true, deletedTitle: deletedProperty.title }; 
        } catch (err: any) {
            console.error("Error deleting property:", err);
            if (err.code === 'P2025') { return fail(404, { deleteError: 'Property not found.' }); }
            return fail(500, { deleteError: 'Failed to delete property.' });
        }
    },

    // --- Toggle Featured Action (NEW / VERIFIED) ---
    toggleFeatured: async ({ request }) => {
        const formData = await request.formData();
        const propertyId = formData.get('propertyId') as string;
        // Read the current state passed from the form (comes as string 'true' or 'false')
        const currentFeaturedState = formData.get('currentFeaturedState') === 'true'; 

        if (!propertyId) {
            return fail(400, { toggleError: 'Invalid Property ID.' });
        }

        const newFeaturedState = !currentFeaturedState; // Calculate the new state

        try {
            console.log(`Updating property ${propertyId} featured status to: ${newFeaturedState}`);
            const updatedProperty = await prisma.property.update({
                where: { id: propertyId },
                data: { isFeatured: newFeaturedState }, // Update the features field
                select: { title: true, isFeatured: true } // Select needed fields for feedback
            });
            console.log(`Updated property: ${updatedProperty.title}, Featured: ${updatedProperty.isFeatured}`);
            
            // Return success state and updated info for feedback
            return { 
                toggleSuccess: true, 
                updatedTitle: updatedProperty.title,
                updatedStatus: updatedProperty.isFeatured // Send back the actual new status
            }; 

        } catch (err: any) {
            console.error("Error toggling featured status:", err);
             if (err.code === 'P2025') { // Record to update not found
                 return fail(404, { toggleError: 'Property not found.' });
            }
            return fail(500, { toggleError: 'Failed to update featured status.' });
        }
    }
};