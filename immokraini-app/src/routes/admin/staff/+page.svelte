<!-- src/routes/admin/staff/+page.svelte -->
<script lang="ts">
    // --- Add these types ---
    type Agent = {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        imageUrl: string | null;
        _count?: { properties: number };
    };

    type MyPageData = {
        agents: Agent[];
        error?: string;
    };

    type MyActionData = {
        deleteError?: string;
        deleteErrorCode?: string;
        deleteSuccess?: boolean;
        deletedName?: string;
        deletedId?: string;
        unassignedProperties?: number;
    };

    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-svelte'; 

    export let data: MyPageData;
    export let form: MyActionData;

    $: agents = data?.agents || [];
    $: deleteError = form?.deleteError ?? null;
    $: deleteErrorCode = form?.deleteErrorCode ?? null;
    $: deleteSuccess = form?.deleteSuccess ?? false;
    $: deletedName = form?.deletedName ?? '';
    $: unassignedProperties = form?.unassignedProperties ?? 0;

    // Confirmation dialog function for delete
    function confirmDelete(event: Event) {
        const formElement = event.currentTarget as HTMLFormElement;
        const agentName = formElement.dataset.agentName || 'this staff member';
        if (!window.confirm(`Are you sure you want to delete "${agentName}"? This will unassign them from any properties.`)) {
            event.preventDefault(); 
        }
    }

    // Function to get error message based on error code
    function getErrorMessage(code: string | null): string {
        switch (code) {
            case 'INVALID_ID':
                return 'Invalid agent ID provided.';
            case 'NOT_FOUND':
                return 'The agent you are trying to delete no longer exists.';
            case 'REFERENCE_ERROR':
                return 'Cannot delete this agent due to existing references. Please contact support.';
            case 'SERVER_ERROR':
                return 'An unexpected error occurred. Please try again later.';
            default:
                return deleteError || 'An error occurred while deleting the agent.';
        }
    }
</script>

<svelte:head>
    <title>Manage Staff | ImmoKraini Admin</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Manage Staff / Agents</h1>
    <a href="/admin/staff/add" class="inline-flex items-center bg-brand-blue text-white font-semibold py-2 px-4 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out text-sm">
        <Plus class="w-4 h-4 mr-2" /> Add New Staff
    </a>
</div>

<!-- Feedback Messages -->
{#if data?.error}
    <div class="feedback error">
        <AlertCircle class="w-5 h-5 flex-shrink-0" />
        <span>{data.error}</span>
    </div>
{/if}

{#if deleteError}
    <div class="feedback error">
        <AlertCircle class="w-5 h-5 flex-shrink-0" />
        <span>{getErrorMessage(deleteErrorCode)}</span>
    </div>
{/if}

{#if deleteSuccess}
    <div class="feedback success">
        <CheckCircle class="w-5 h-5 flex-shrink-0" />
        <span>
            Staff member "{deletedName}" deleted successfully.
            {#if unassignedProperties > 0}
                {unassignedProperties} {unassignedProperties === 1 ? 'property was' : 'properties were'} unassigned.
            {/if}
        </span>
    </div>
{/if}

<div class="bg-white p-4 sm:p-6 rounded-lg shadow-md overflow-x-auto">
    <table class="w-full min-w-[600px] text-sm text-left text-gray-600">
        <thead class="text-xs text-gray-700 uppercase bg-gray-100 border-b">
            <tr>
                <th scope="col" class="px-4 py-3">Photo</th>
                <th scope="col" class="px-4 py-3">Name</th>
                <th scope="col" class="px-4 py-3">Email</th>
                <th scope="col" class="px-4 py-3">Phone</th>
                <th scope="col" class="px-4 py-3">Properties</th>
                <th scope="col" class="px-4 py-3 text-right">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each agents as agent (agent.id)}
                <tr class="bg-white border-b hover:bg-gray-50">
                    <td class="px-4 py-2">
                        <img 
                            src={agent.imageUrl || '/default-avatar.png'} 
                            alt="Photo of {agent.name}"
                            class="w-10 h-10 rounded-full object-cover"
                            width="40" height="40"
                        />
                    </td>
                    <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {agent.name}
                    </th>
                    <td class="px-4 py-3">{agent.email}</td>
                    <td class="px-4 py-3">{agent.phone || '-'}</td>
                    <td class="px-4 py-3">{agent._count?.properties ?? 0}</td>
                    <td class="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <a href={`/admin/staff/edit/${agent.id}`} class="text-blue-600 hover:text-blue-800 inline-flex items-center p-1 align-middle" title="Edit">
                            <Edit class="w-4 h-4" />
                        </a>
                        <!-- Delete Form -->
                        <form 
                            method="POST" 
                            action="?/delete" 
                            use:enhance={() => async ({ result }) => {
                                if (result.type === 'success') {
                                    await invalidateAll();
                                }
                            }}
                            class="inline-block align-middle"
                            on:submit={confirmDelete}
                            data-agent-name={agent.name} 
                        >
                            <input type="hidden" name="agentId" value={agent.id} />
                            <button type="submit" class="text-red-600 hover:text-red-800 inline-flex items-center p-1" title="Delete">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </form>
                    </td>
                </tr>
            {:else}
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-500">No staff members found.</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    /* Simple feedback message styling */
    .feedback { @apply mb-4 p-3 rounded-md text-sm border flex items-center gap-2; }
    .feedback.error { @apply bg-red-100 text-red-700 border-red-300; }
    .feedback.success { @apply bg-green-100 text-green-700 border-green-300; }
</style>