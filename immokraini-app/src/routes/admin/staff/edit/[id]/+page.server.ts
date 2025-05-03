// src/routes/admin/staff/edit/[id]/+page.server.ts
import prisma from '$lib/server/prisma';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { uploadImageToCloudinary } from '$lib/server/cloudinary'; 
import { Buffer } from 'buffer'; 
import type { Prisma } from '@prisma/client'; 

// Load existing agent data
export const load: PageServerLoad = async ({ params }) => {
    const agentId = params.id;
    try {
        const agent = await prisma.agent.findUniqueOrThrow({
            where: { id: agentId },
        });
        // Return data needed for the form
        return { 
            agent: {
                id: agent.id,
                name: agent.name,
                email: agent.email,
                phone: agent.phone ?? '', // Default to empty string for form
                imageUrl: agent.imageUrl ?? '', // Default to empty string
                // Don't pass back sensitive fields if they exist (e.g., password hash)
            }
        };
    } catch (err: any) {
        console.error(`Error loading agent ${agentId} for edit:`, err);
        if (err.code === 'P2025') { error(404, 'Agent not found'); } 
        else { error(500, 'Failed to load agent details'); }
    }
};

// Handle agent update
export const actions: Actions = {
    default: async ({ request, params }) => {
        const agentId = params.id;
        const formData = await request.formData();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string || null; // Store null if empty
        const imageFile = formData.get('imageUrl') as File | null;
        const currentImageUrl = formData.get('currentImageUrl') as string || null; // Get current URL

        // --- Validation ---
        if (!name || !email) {
            return fail(400, { error: 'Name and Email are required.', name, email, phone, imageUrl: currentImageUrl });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return fail(400, { error: 'Invalid email format.', name, email, phone, imageUrl: currentImageUrl });
        }
        // Check if email changed and if the new one is taken by ANOTHER agent
        const existing = await prisma.agent.findUnique({ where: { email: email }});
        if (existing && existing.id !== agentId) { 
             return fail(400, { error: `Email "${email}" is already in use.`, name, email, phone, imageUrl: currentImageUrl });
        }
        // --- End Validation ---

        let newImageUrl: string | null = currentImageUrl; // Start with current image

        // --- Handle Image Upload ---
        try {
            if (imageFile && imageFile.size > 0) {
                console.log(`Uploading new image for agent ${agentId}: ${imageFile.name}`);
                const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
                const uploadedUrl = await uploadImageToCloudinary(fileBuffer, 'immokraini_agents'); // Use a different folder
                if (!uploadedUrl) throw new Error('Agent image upload failed.');
                newImageUrl = uploadedUrl; // Set new URL if upload succeeds
                console.log(`Agent image uploaded: ${newImageUrl}`);
                // TODO: Optionally delete the OLD image from Cloudinary here if newImageUrl is different from currentImageUrl
            }
        } catch (uploadError: any) {
             console.error("Error during agent image upload:", uploadError);
             return fail(500, { error: `Image upload failed: ${uploadError.message}`, name, email, phone, imageUrl: currentImageUrl });
        }
        // --- End Image Upload ---

        // --- Prepare Data for Update ---
        const updateData: Prisma.AgentUpdateInput = {
            name: name,
            email: email,
            phone: phone,
            imageUrl: newImageUrl, // Use new or existing URL
        };

        // --- Update Agent in Database ---
        try {
            const updatedAgent = await prisma.agent.update({
                where: { id: agentId },
                data: updateData
            });
            console.log('Updated agent:', updatedAgent.id, updatedAgent.name);
            
            // Redirect back to the staff list on success
            redirect(303, '/admin/staff'); 

        } catch (dbError: any) {
            console.error("Error updating agent:", dbError);
             if (dbError.code === 'P2025') { 
                 return fail(404, { error: 'Agent not found.', name, email, phone, imageUrl: currentImageUrl });
            }
            return fail(500, { error: 'Failed to update agent in database.', name, email, phone, imageUrl: currentImageUrl });
        }
    }
};