// src/routes/admin/add-property/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/prisma';
import { uploadImageToCloudinary } from '$lib/server/cloudinary';
import { Buffer } from 'buffer';
import type { Prisma } from '@prisma/client';

export const actions: Actions = {
	default: async ({ request }) => {
		/* ------------------------------------------------------------------
		   1.  Grab the multi‑part form data
		------------------------------------------------------------------ */
		const formData = await request.formData();

		/* ------------------------------------------------------------------
		   2.  Extract scalar inputs
		------------------------------------------------------------------ */
		const data = {
			title: formData.get('title') as string,
			slug: formData.get('slug') as string,
			address: formData.get('address') as string,
			price: parseInt((formData.get('price') as string) || '0', 10),
			beds: parseInt((formData.get('beds') as string) || '', 10) || null,
			baths: parseInt((formData.get('baths') as string) || '', 10) || null,
			area: parseInt((formData.get('area') as string) || '', 10) || null,
			yearBuilt: parseInt((formData.get('yearBuilt') as string) || '', 10) || null,
			propertyType: (formData.get('propertyType') as string) || null,
			description: (formData.get('description') as string) || null,
			videoUrl: (formData.get('videoUrl') as string) || null,
			latitude: parseFloat((formData.get('latitude') as string) || '') || null,
			longitude: parseFloat((formData.get('longitude') as string) || '') || null,
			agentId: (formData.get('agentId') as string) || null
		};

		/* ------------------------------------------------------------------
		   3.  Basic validation
		------------------------------------------------------------------ */
		if (!data.title || !data.slug || !data.address || !data.price) {
			return fail(400, { error: 'Missing required fields.', data });
		}
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
			return fail(400, { error: 'Invalid slug format.', data });
		}
		const existing = await prisma.property.findUnique({ where: { slug: data.slug } });
		if (existing) {
			return fail(400, { error: `Slug "${data.slug}" is already taken.`, data });
		}

		/* ------------------------------------------------------------------
		   4.  Handle file uploads (main image + gallery)
		------------------------------------------------------------------ */
		const mainImageFile = formData.get('imageUrl') as File | null;
		const galleryImageFiles = formData.getAll('galleryImages') as File[];

		let mainImageUrl: string | null = null;
		const galleryUrls: string[] = [];

		try {
			// -- Main image
			if (mainImageFile && mainImageFile.size > 0) {
				const fileBuffer = Buffer.from(await mainImageFile.arrayBuffer());
				mainImageUrl = await uploadImageToCloudinary(fileBuffer);
				if (!mainImageUrl) throw new Error('Main image upload failed.');
			}

			// -- Gallery images
			for (const file of galleryImageFiles) {
				if (file && file.size > 0) {
					const buf = Buffer.from(await file.arrayBuffer());
					const url = await uploadImageToCloudinary(buf);
					if (url) galleryUrls.push(url);
				}
			}
		} catch (err: unknown) {
			console.error('Error during file upload:', err);
			return fail(500, { error: 'File upload failed.', data });
		}

		/* ------------------------------------------------------------------
		   5.  Convert comma‑separated “features” to string[]
		------------------------------------------------------------------ */
		const featuresCsv = (formData.get('features') as string) || '';
		const featuresArray =
			featuresCsv
				.split(',')
				.map((f) => f.trim())
				.filter(Boolean) ?? [];

		/* ------------------------------------------------------------------
		   6.  Assemble the Prisma create payload
		------------------------------------------------------------------ */
		const prismaData: Prisma.PropertyCreateInput = {
			title: data.title,
			slug: data.slug,
			address: data.address,
			price: data.price,
			beds: data.beds,
			baths: data.baths,
			area: data.area,
			yearBuilt: data.yearBuilt,
			propertyType: data.propertyType,
			description: data.description,
			videoUrl: data.videoUrl,
			latitude: data.latitude,
			longitude: data.longitude,

			// relations
			agent: data.agentId ? { connect: { id: data.agentId } } : undefined,

			// uploads
			imageUrl: mainImageUrl,
			galleryImages: galleryUrls, // Use the array directly
			features: featuresArray     // Use the array directly
		};

		/* ------------------------------------------------------------------
		   7.  Persist to the database
		------------------------------------------------------------------ */
		try {
			const newProperty = await prisma.property.create({ data: prismaData });
			console.log('Created new property:', newProperty.id, newProperty.title);
			return { success: true, addedTitle: newProperty.title };
		} catch (dbError) {
			console.error('Error saving property:', dbError);
			return fail(500, { error: 'Failed to save property to database.', data });
		}
	}
};
