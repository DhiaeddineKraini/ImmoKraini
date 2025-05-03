// src/routes/admin/add-property/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/prisma';
import { uploadImageToCloudinary } from '$lib/server/cloudinary'; // <<< Import helper
import { Buffer } from 'buffer'; // Needed for buffer operations

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();

        // --- Extract Text/Number Data ---
        const data = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string,
            address: formData.get('address') as string,
            price: 0, // Initialize with default value
            beds: null as number | null,
            baths: null as number | null,
            area: null as number | null,
            yearBuilt: null as number | null,
            propertyType: null as string | null,
            description: null as string | null,
            // ... other text/number fields ...
            features: formData.get('features') as string || null, 
            videoUrl: formData.get('videoUrl') as string || null,
            latitude: parseFloat(formData.get('latitude') as string || '') || null,
            longitude: parseFloat(formData.get('longitude') as string || '') || null,
            agentId: formData.get('agentId') as string || null,
            // --- Fields to be populated from uploads ---
            imageUrl: null as string | null, 
            galleryImages: null as string | null, // Will store JSON string of URLs
        };
        // Parse numbers safely
        data.price = parseInt(formData.get('price') as string || '0', 10);
        data.beds = parseInt(formData.get('beds') as string || '', 10) || null;
        data.baths = parseInt(formData.get('baths') as string || '', 10) || null;
        data.area = parseInt(formData.get('area') as string || '', 10) || null;
        data.yearBuilt = parseInt(formData.get('yearBuilt') as string || '', 10) || null;
        data.propertyType = formData.get('propertyType') as string || null;
        data.description = formData.get('description') as string || null;


        // --- Basic Validation ---
        if (!data.title || !data.slug || !data.address || !data.price) { return fail(400, { error: 'Missing required fields.', data }); }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) { return fail(400, { error: 'Invalid slug format.', data }); }
        const existing = await prisma.property.findUnique({ where: { slug: data.slug }});
        if (existing) { return fail(400, { error: `Slug "${data.slug}" is already taken.`, data }); }
        // --- End Validation ---


        // --- Process File Uploads ---
        const mainImageFile = formData.get('imageUrl') as File | null;
        const galleryImageFiles = formData.getAll('galleryImages') as File[]; // Use getAll for multiple

        let mainImageUrl: string | null = null;
        const galleryUrls: string[] = [];

        try {
            // Upload Main Image
            if (mainImageFile && mainImageFile.size > 0) {
                console.log(`Uploading main image: ${mainImageFile.name}`);
                const fileBuffer = Buffer.from(await mainImageFile.arrayBuffer());
                mainImageUrl = await uploadImageToCloudinary(fileBuffer);
                if (!mainImageUrl) throw new Error('Main image upload failed.');
                data.imageUrl = mainImageUrl; // Update data object
                console.log(`Main image uploaded: ${mainImageUrl}`);
            }

            // Upload Gallery Images
            if (galleryImageFiles && galleryImageFiles.length > 0) {
                 console.log(`Uploading ${galleryImageFiles.length} gallery images...`);
                 for (const file of galleryImageFiles) {
                     if (file && file.size > 0) {
                         console.log(`Uploading gallery image: ${file.name}`);
                         const fileBuffer = Buffer.from(await file.arrayBuffer());
                         const url = await uploadImageToCloudinary(fileBuffer);
                         if (url) {
                             galleryUrls.push(url);
                             console.log(`Gallery image uploaded: ${url}`);
                         } else {
                             console.warn(`Skipping failed gallery upload: ${file.name}`);
                             // Decide if you want to fail the whole request or just skip the image
                             // throw new Error(`Gallery image upload failed for ${file.name}`); 
                         }
                     }
                 }
                 if (galleryUrls.length > 0) {
                     data.galleryImages = JSON.stringify(galleryUrls); // Store as JSON string
                 }
            }
        } catch (uploadError: any) {
             console.error("Error during file upload:", uploadError);
             return fail(500, { error: `File upload failed: ${uploadError.message}`, data });
        }
        // --- End File Uploads ---


        // --- Prepare Final Data for Prisma ---
        const featuresArray = data.features?.split(',').map(f => f.trim()).filter(f => f) ?? [];
        const prismaData = {
            ...data, // Includes imageUrl and galleryImages URLs now
            features: featuresArray.length > 0 ? JSON.stringify(featuresArray) : null,
            agentId: data.agentId === '' ? null : data.agentId, 
        };

        // --- Create Property in Database ---
        try {
            const newProperty = await prisma.property.create({
                data: prismaData
            });
            console.log('Created new property:', newProperty.id, newProperty.title);
            
            // Return success message
            return { success: true, addedTitle: newProperty.title };

        } catch (dbError) {
            console.error("Error creating property in DB:", dbError);
            // Attempt to delete uploaded images if DB save fails? (More complex cleanup)
            return fail(500, { error: 'Failed to save property to database after upload.', data });
        }
    }
};

// Optional: Load function remains commented out unless needed for agent dropdown
// export const load: PageServerLoad = async () => { ... };