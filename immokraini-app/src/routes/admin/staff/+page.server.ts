// src/routes/admin/staff/+page.server.ts
import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'; // Import Actions

export const load: PageServerLoad = async () => {
    try {
        const agents = await prisma.agent.findMany({
            orderBy: { name: 'asc' }
        });
        return { agents };
    } catch (err) {
        console.error("Error loading staff:", err);
        return { agents: [], error: "Failed to load staff list." };
    }
};

// --- ADD DELETE ACTION ---
export const actions: Actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const agentId = formData.get('agentId') as string;

        if (!agentId) {
            return fail(400, { deleteError: 'Invalid Agent ID.' });
        }

        try {
            console.log(`Attempting to delete agent with ID: ${agentId}`);

            // Use a transaction to ensure both operations succeed or fail together
            const [_, deletedAgent] = await prisma.$transaction([
                // 1. Update properties assigned to this agent to have null agentId
                prisma.property.updateMany({
                    where: { agentId: agentId },
                    data: { agentId: null }, 
                }),
                // 2. Delete the agent
                prisma.agent.delete({
                    where: { id: agentId },
                    select: { name: true } // Select name for feedback
                })
            ]);

            console.log(`Deleted agent: ${deletedAgent.name} and unassigned their properties.`);
            return { deleteSuccess: true, deletedName: deletedAgent.name }; 

        } catch (err: any) {
            console.error("Error deleting agent:", err);
            if (err.code === 'P2025') { // Record to delete not found
                 return fail(404, { deleteError: 'Agent not found.' });
            }
            // Handle other potential errors (e.g., transaction failure)
            return fail(500, { deleteError: 'Failed to delete agent.' });
        }
    }
};