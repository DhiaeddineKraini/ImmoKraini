// src/routes/admin/staff/add/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/prisma';
import { uploadImageToCloudinary } from '$lib/server/cloudinary'; 
import { Buffer } from 'buffer'; 
import type { Prisma } from '@prisma/client'; 

export const actions: Actions = {
    default: async ({ request }) => {
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string || null; 
        const imageFile = formData.get('imageUrl') as File | null;

        // --- Validation ---
        if (!name || !email) {
            return fail(400, { error: 'Name and Email are required.', name, email, phone });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return fail(400, { error: 'Invalid email format.', name, email, phone });
        }
        // Check if email already exists
        const existing = await prisma.agent.findUnique({ where: { email: email }});
        if (existing) { 
             return fail(400, { error: `Email "${email}" is already in use.`, name, email, phone });
        }
        // --- End Validation ---

        let imageUrl: string | null = null;

        // --- Handle Image Upload ---
        try {
            if (imageFile && imageFile.size > 0) {
                console.log(`Uploading image for new agent: ${imageFile.name}`);
                const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
                imageUrl = await uploadImageToCloudinary(fileBuffer, 'immokraini_agents'); 
                if (!imageUrl) throw new Error('Agent image upload failed.');
                console.log(`Agent image uploaded: ${imageUrl}`);
            }
        } catch (uploadError: any) {
             console.error("Error during agent image upload:", uploadError);
             return fail(500, { error: `Image upload failed: ${uploadError.message}`, name, email, phone });
        }
        // --- End Image Upload ---

        // --- Prepare Data for Create ---
        const agentData: Prisma.AgentCreateInput = {
            name: name,
            email: email,
            phone: phone,
            imageUrl: imageUrl, // Use uploaded URL or null
        };

        // --- Create Agent in Database ---
        try {
            const newAgent = await prisma.agent.create({
                data: agentData
            });
            console.log('Created new agent:', newAgent.id, newAgent.name);
            
            // Return success message (form will reset)
            return { success: true, addedName: newAgent.name };

        } catch (dbError: any) {
            console.error("Error creating agent:", dbError);
            // Attempt to delete uploaded image if DB save fails? (More complex)
            return fail(500, { error: 'Failed to save agent to database.', name, email, phone });
        }
    }
};