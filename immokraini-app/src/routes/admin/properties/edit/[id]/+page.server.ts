// src/routes/admin/properties/edit/[id]/+page.server.ts
import prisma from '$lib/server/prisma';
import { error, fail, redirect } from '@sveltejs/kit'; // Import redirect
import type { PageServerLoad, Actions } from './$types';
import { uploadImageToCloudinary } from '$lib/server/cloudinary'; // Import Cloudinary helper
import { Buffer } from 'buffer'; // Needed for buffer operations
import type { Prisma } from '@prisma/client'; // Import Prisma types

export const load: PageServerLoad = async ({ params }) => {
    const propertyId = params.id;

    try {
        // Fetch the specific property to edit
        const property = await prisma.property.findUniqueOrThrow({
            where: { id: propertyId },
        });

        // Fetch all agents for the dropdown
        const agents = await prisma.agent.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        });

        // Prepare property data for the form
        const formData = {
            ...property,
            // Convert JSON strings back to comma-separated strings for text inputs
            galleryImages: property.galleryImages ? JSON.parse(property.galleryImages).join(', ') : '',
            features: property.features ? JSON.parse(property.features).join(', ') : '',
            // Handle nulls for number inputs -> empty string
            beds: property.beds ?? '',
            baths: property.baths ?? '',
            area: property.area ?? '',
            yearBuilt: property.yearBuilt ?? '',
            latitude: property.latitude ?? '',
            longitude: property.longitude ?? '',
            agentId: property.agentId ?? '', // Use existing agentId or empty string
            // Keep original image URLs for display if needed
            currentImageUrl: property.imageUrl ?? '',
            currentGalleryString: property.galleryImages ?? '', // Keep original JSON string
        };

        return { 
            property: formData, // Pass pre-formatted data
            agents: agents      // Pass agent list
        };

    } catch (err: any) {
        console.error(`Error loading property ${propertyId} for edit:`, err);
        if (err.code === 'P2025') { // Prisma's RecordNotFound error code
            error(404, 'Property not found');
        } else {
            error(500, 'Failed to load property details');
        }
    }
};

export const actions: Actions = {
    // default action for updating
    default: async ({ request, params }) => {
        const propertyId = params.id; // Get ID from route params
        const formData = await request.formData();

        // --- Extract and Validate Data ---
        const data = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string, 
            address: formData.get('address') as string,
            price: parseInt(formData.get('price') as string || '0', 10),
            beds: parseInt(formData.get('beds') as string || '', 10) || null,
            baths: parseInt(formData.get('baths') as string || '', 10) || null,
            area: parseInt(formData.get('area') as string || '', 10) || null,
            propertyType: formData.get('propertyType') as string || null,
            yearBuilt: parseInt(formData.get('yearBuilt') as string || '', 10) || null,
            description: formData.get('description') as string || null,
            features: formData.get('features') as string || null, 
            videoUrl: formData.get('videoUrl') as string || null,
            latitude: parseFloat(formData.get('latitude') as string || '') || null,
            longitude: parseFloat(formData.get('longitude') as string || '') || null,
            agentId: formData.get('agentId') as string || null,
        };
        // Keep track of original data passed back on error
        const originalFormDataForRepopulation = {
            ...data,
            features: data.features ?? '', // Pass back comma string
            galleryImages: formData.get('currentGalleryString') as string ?? '', // Pass back original gallery string
            currentImageUrl: formData.get('currentImageUrl') as string ?? '',
            agentId: data.agentId ?? '',
        };


        // Basic required field validation
        if (!data.title || !data.slug || !data.address || !data.price) {
            return fail(400, { error: 'Missing required fields.', data: originalFormDataForRepopulation }); 
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
             return fail(400, { error: 'Invalid slug format.', data: originalFormDataForRepopulation });
        }
        const existing = await prisma.property.findUnique({ where: { slug: data.slug }});
        if (existing && existing.id !== propertyId) { 
             return fail(400, { error: `Slug "${data.slug}" is already taken.`, data: originalFormDataForRepopulation });
        }
        // --- End Basic Validation ---


        // --- Handle File Uploads ---
        let newMainImageUrl: string | null = null;
        const newGalleryUrls: string[] = [];
        const mainImageFile = formData.get('imageUrl') as File | null;
        const galleryImageFiles = formData.getAll('galleryImages') as File[];

        try {
            if (mainImageFile && mainImageFile.size > 0) {
                const fileBuffer = Buffer.from(await mainImageFile.arrayBuffer());
                newMainImageUrl = await uploadImageToCloudinary(fileBuffer); 
                if (!newMainImageUrl) throw new Error('Main image upload failed.');
            }

            if (galleryImageFiles && galleryImageFiles.length > 0 && galleryImageFiles[0].size > 0) {
                 for (const file of galleryImageFiles) {
                     if (file && file.size > 0) {
                         const fileBuffer = Buffer.from(await file.arrayBuffer());
                         const url = await uploadImageToCloudinary(fileBuffer);
                         if (url) newGalleryUrls.push(url);
                         else console.warn(`Skipping failed gallery upload: ${file.name}`);
                     }
                 }
            }
        } catch (uploadError: any) {
             return fail(500, { error: `File upload failed: ${uploadError.message}`, data: originalFormDataForRepopulation });
        }
        // --- End File Uploads ---


        // --- Prepare Final Data for Prisma Update ---
        const featuresArray = data.features?.split(',').map(f => f.trim()).filter(f => f) ?? [];
        
        const updateData: Prisma.PropertyUpdateInput = {
            title: data.title,
            slug: data.slug,
            address: data.address,
            price: data.price,
            beds: data.beds,
            baths: data.baths,
            area: data.area,
            propertyType: data.propertyType,
            yearBuilt: data.yearBuilt,
            description: data.description,
            videoUrl: data.videoUrl,
            latitude: data.latitude,
            longitude: data.longitude,
            features: featuresArray.length > 0 ? JSON.stringify(featuresArray) : null,
            agent: data.agentId ? { connect: { id: data.agentId } } : { disconnect: true }, 
            // Only include image fields if new images were uploaded
            ...(newMainImageUrl && { imageUrl: newMainImageUrl }),
            ...(newGalleryUrls.length > 0 && { galleryImages: JSON.stringify(newGalleryUrls) }),
        };

        // --- Update Property in Database ---
        try {
            const updatedProperty = await prisma.property.update({
                where: { id: propertyId },
                data: updateData
            });
            console.log('Updated property:', updatedProperty.id, updatedProperty.title);
            
            // Option 1: Redirect back to the property list on success
            redirect(303, '/admin/properties'); 
            
            // Option 2: Return success message (comment out redirect if using this)
            // return { success: true, updatedTitle: updatedProperty.title };

        } catch (dbError: any) {
            console.error("Error updating property:", dbError);
             if (dbError.code === 'P2025') { 
                 return fail(404, { error: 'Property not found.', data: originalFormDataForRepopulation });
            }
            return fail(500, { error: 'Failed to update property in database.', data: originalFormDataForRepopulation });
        }
    }
};