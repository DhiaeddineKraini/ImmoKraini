// src/routes/admin/staff/+page.server.ts
import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'; // Import Actions

export const load: PageServerLoad = async () => {
    try {
        const agents = await prisma.agent.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { properties: true }
                }
            }
        });
        return { agents };
    } catch (err) {
        console.error("Error loading staff:", err);
        return { agents: [], error: "Failed to load staff list." };
    }
};

// --- ADD DELETE ACTION ---
export const actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const agentId = formData.get('agentId') as string;

        if (!agentId) {
            return fail(400, { 
                deleteError: 'Invalid Agent ID.',
                deleteErrorCode: 'INVALID_ID'
            });
        }

        try {
            // First check if agent exists and get their details
            const agent = await prisma.agent.findUnique({
                where: { id: agentId },
                include: {
                    _count: {
                        select: { properties: true }
                    }
                }
            });

            if (!agent) {
                return fail(404, { 
                    deleteError: 'Agent not found.',
                    deleteErrorCode: 'NOT_FOUND'
                });
            }

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
                    select: { 
                        id: true,
                        name: true,
                        email: true
                    }
                })
            ]);

            return { 
                deleteSuccess: true, 
                deletedName: deletedAgent.name,
                deletedId: deletedAgent.id,
                unassignedProperties: agent._count.properties
            }; 

        } catch (err: any) {
            console.error("Error deleting agent:", err);
            
            // Handle specific Prisma errors
            if (err.code === 'P2025') {
                return fail(404, { 
                    deleteError: 'Agent not found.',
                    deleteErrorCode: 'NOT_FOUND'
                });
            }
            
            if (err.code === 'P2003') {
                return fail(400, {
                    deleteError: 'Cannot delete agent due to existing references.',
                    deleteErrorCode: 'REFERENCE_ERROR'
                });
            }

            // Handle other potential errors
            return fail(500, { 
                deleteError: 'An unexpected error occurred while deleting the agent.',
                deleteErrorCode: 'SERVER_ERROR'
            });
        }
    }
} satisfies Actions;