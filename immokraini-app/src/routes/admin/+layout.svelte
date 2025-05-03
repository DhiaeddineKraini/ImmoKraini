<script lang="ts">
    import '../../app.css'; // Import global styles
    import { page } from '$app/stores'; // To highlight active link
    import { LayoutDashboard, Building, Users, LogOut } from 'lucide-svelte'; // Icons
</script>

<div class="admin-layout flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-gray-800 text-gray-200 flex flex-col shadow-lg">
        <div class="p-4 border-b border-gray-700">
            <a href="/admin" class="text-xl font-semibold text-white hover:text-sky-blue transition-colors">ImmoKraini Admin</a>
        </div>
        <nav class="flex-grow p-4 space-y-2">
            <a 
                href="/admin" 
                class="flex items-center px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                class:bg-gray-700={$page.url.pathname === '/admin'}
                aria-current={$page.url.pathname === '/admin' ? 'page' : undefined}
            >
                <LayoutDashboard class="w-5 h-5 mr-3" /> Dashboard
            </a>
            <a 
                href="/admin/properties" 
                class="flex items-center px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                class:bg-gray-700={$page.url.pathname.startsWith('/admin/properties')}
                aria-current={$page.url.pathname.startsWith('/admin/properties') ? 'page' : undefined}
            >
                <Building class="w-5 h-5 mr-3" /> Properties
            </a>
             <a 
                href="/admin/staff" 
                class="flex items-center px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                class:bg-gray-700={$page.url.pathname.startsWith('/admin/staff')}
                aria-current={$page.url.pathname.startsWith('/admin/staff') ? 'page' : undefined}
            >
                <Users class="w-5 h-5 mr-3" /> Staff
            </a>
        </nav>
        <div class="p-4 border-t border-gray-700">
             <a href="/" class="flex items-center px-3 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
                <LogOut class="w-4 h-4 mr-2 rotate-180" /> View Public Site
            </a>
        </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-grow flex flex-col">
         <header class="bg-white p-4 shadow-md border-b border-gray-200">
            <p class="text-sm text-gray-600">Admin Dashboard</p>
         </header>
         <main class="flex-grow p-4 md:p-8 overflow-y-auto">
            <slot />
         </main>
    </div>
</div>

<style>
    /* Admin layout specific styles */
</style>