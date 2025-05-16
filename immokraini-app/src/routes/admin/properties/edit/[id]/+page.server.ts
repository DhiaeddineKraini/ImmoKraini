// src/routes/admin/properties/edit/[id]/+page.server.ts
import prisma from '$lib/server/prisma';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { uploadImageToCloudinary } from '$lib/server/cloudinary';
import { Buffer } from 'buffer';
import type { Prisma } from '@prisma/client';

/**
 * Load a single property along with agents for the edit form.
 */
export const load: PageServerLoad = async ({ params }) => {
    const propertyId = params.id;

    try {
        // Fetch the property and agents in parallel
        const [property, agents] = await Promise.all([
            prisma.property.findUniqueOrThrow({ where: { id: propertyId } }),
            prisma.agent.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            })
        ]);

        /*
         * Prepare data for the form.  We keep the raw arrays for the
         * <select>/<chips> components while also providing string versions
         * for plain text inputs (comma‑separated).
         */
        const formData = {
            ...property,
            galleryImages: property.galleryImages ?? [],
            features: property.features ?? [],
            galleryImagesString: Array.isArray(property.galleryImages) ? property.galleryImages.join(', ') : '',
            featuresString: Array.isArray(property.features) ? property.features.join(', ') : '',

            // fallback empty strings keep Svelte inputs controlled
            beds: property.beds ?? '',
            baths: property.baths ?? '',
            area: property.area ?? '',
            yearBuilt: property.yearBuilt ?? '',
            latitude: property.latitude ?? '',
            longitude: property.longitude ?? '',
            agentId: property.agentId ?? '',
            currentImageUrl: property.imageUrl ?? ''
        };

        return { property: formData, agents };
    } catch (err: any) {
        console.error(`Error loading property ${propertyId}:`, err);
        if (err.code === 'P2025') throw error(404, 'Property not found');
        throw error(500, 'Failed to load property details');
    }
};

/**
 * Update action for the edit page.
 */
export const actions: Actions = {
    default: async ({ request, params }) => {
        const propertyId = params.id;
        const formData = await request.formData();

        /* ---------- Helpers ---------- */
        const parseIntOrNull = (v: FormDataEntryValue | null) =>
            v && typeof v === 'string' && v.trim() !== '' ? parseInt(v, 10) : null;
        const parseFloatOrNull = (v: FormDataEntryValue | null) =>
            v && typeof v === 'string' && v.trim() !== '' ? parseFloat(v) : null;

        /* ---------- Extract plain fields ---------- */
        const data = {
            title: formData.get('title') as string,
            slug: formData.get('slug') as string,
            address: formData.get('address') as string,
            price: parseInt(formData.get('price') as string || '0', 10),
            beds: parseIntOrNull(formData.get('beds')),
            baths: parseIntOrNull(formData.get('baths')),
            area: parseIntOrNull(formData.get('area')),
            propertyType: (formData.get('propertyType') as string) || null,
            yearBuilt: parseIntOrNull(formData.get('yearBuilt')),
            description: (formData.get('description') as string) || null,
            videoUrl: (formData.get('videoUrl') as string) || null,
            latitude: parseFloatOrNull(formData.get('latitude')),
            longitude: parseFloatOrNull(formData.get('longitude')),
            agentId: (formData.get('agentId') as string) || null
        };

        const originalFormDataForRepopulation = {
            ...data,
            featuresString: (formData.get('features') as string) ?? '',
            galleryImagesString: (formData.get('galleryImagesString') as string) ?? '',
            currentImageUrl: (formData.get('currentImageUrl') as string) ?? ''
        };

        /* ---------- Basic validation ---------- */
        if (!data.title || !data.slug || !data.address || !data.price) {
            return fail(400, { error: 'Missing required fields.', data: originalFormDataForRepopulation });
        }
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
            return fail(400, { error: 'Invalid slug format.', data: originalFormDataForRepopulation });
        }
        const existing = await prisma.property.findUnique({ where: { slug: data.slug } });
        if (existing && existing.id !== propertyId) {
            return fail(400, { error: `Slug "${data.slug}" is already taken.`, data: originalFormDataForRepopulation });
        }

        /* ---------- Handle file uploads ---------- */
        let newMainImageUrl: string | null = null;
        const newGalleryUrls: string[] = [];
        const mainImageFile = formData.get('imageUrl') as File | null;
        const galleryImageFiles = formData.getAll('galleryImages') as File[];

        // New image inputs
        const newMainImageFile = formData.get('newMainImageFile') as File | null;
        const newGalleryImageFiles = formData.getAll('newGalleryImageFiles') as File[];
        const imagesToDeleteUrlsString = formData.get('imagesToDeleteUrls') as string || '';
        const imagesToDelete = imagesToDeleteUrlsString.split(',').map(url => url.trim()).filter(url => url);

        // Determine if the current main image is marked for deletion
        const currentMainImageUrl = formData.get('currentImageUrl') as string || '';
        const deleteCurrentMainImage = imagesToDelete.includes(currentMainImageUrl);

        try {
            // Process new main image file if provided
            if (newMainImageFile && newMainImageFile.size > 0) {
                const buffer = Buffer.from(await newMainImageFile.arrayBuffer());
                newMainImageUrl = await uploadImageToCloudinary(buffer);
            } else if (deleteCurrentMainImage) {
                 // If no new main image is uploaded, but current is marked for deletion
                newMainImageUrl = null; // Explicitly set to null to remove it
            }

            // Process new gallery image files
            if (newGalleryImageFiles && newGalleryImageFiles.length > 0 && newGalleryImageFiles[0].size > 0) {
                for (const file of newGalleryImageFiles) {
                    if (!file || file.size === 0) continue;
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const url = await uploadImageToCloudinary(buffer);
                    if (url) newGalleryUrls.push(url);
                }
            }
        } catch (uploadErr: any) {
            return fail(500, {
                error: `File upload failed: ${uploadErr.message}`,
                data: originalFormDataForRepopulation
            });
        }

        /* ---------- Prepare update ---------- */
        const featuresString = (formData.get('features') as string) || '';
        const featuresArray = featuresString
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean);

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
            features: featuresArray,
            agent: data.agentId && data.agentId !== '' ? { connect: { id: data.agentId } } : { disconnect: true },
            ...(newMainImageUrl && { imageUrl: newMainImageUrl }),
            ...(newGalleryUrls.length > 0 && { galleryImages: newGalleryUrls })
        };

        // Logic to update imageUrl and galleryImages based on new uploads and deletions
        let finalImageUrl: string | null | undefined = undefined; // undefined means no change unless specified
        if (newMainImageUrl) { // New image uploaded, replaces old or sets new
            finalImageUrl = newMainImageUrl;
        } else if (deleteCurrentMainImage) { // No new image, but old one deleted
            finalImageUrl = null;
        }
        // Only add imageUrl to updateData if it's explicitly set (to new URL or null)
        if (finalImageUrl !== undefined) {
            updateData.imageUrl = finalImageUrl;
        }

        // Logic for gallery images
        const currentProperty = await prisma.property.findUnique({ 
            where: { id: propertyId }, 
            select: { galleryImages: true }
        });
        let existingGalleryImages = currentProperty?.galleryImages || [];

        // Filter out images marked for deletion
        existingGalleryImages = existingGalleryImages.filter(url => !imagesToDelete.includes(url));
        
        // Add newly uploaded images
        const finalGalleryImages = [...existingGalleryImages, ...newGalleryUrls];

        // Only update galleryImages if there are changes (new uploads or deletions)
        // This prevents overwriting with an empty array if no new images and no deletions of existing ones.
        if (newGalleryUrls.length > 0 || imagesToDelete.length > 0) {
             updateData.galleryImages = finalGalleryImages;
        }

        /* ---------- Update database ---------- */
        try {
            await prisma.property.update({ where: { id: propertyId }, data: updateData });
            throw redirect(303, '/admin/properties');
        } catch (dbErr: any) {
            console.error('Error updating property:', dbErr);
            if (dbErr.code === 'P2025') {
                return fail(404, { error: 'Property not found.', data: originalFormDataForRepopulation });
            }
            return fail(500, { error: 'Failed to update property in database.', data: originalFormDataForRepopulation });
        }
    }
};
