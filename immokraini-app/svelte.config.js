// svelte.config.js
// import adapter from '@sveltejs/adapter-auto'; 
// import adapter from '@sveltejs/adapter-cloudflare'; 
import adapter from '@sveltejs/adapter-vercel'; // <<< Use Vercel adapter
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),
    kit: {
        adapter: adapter({
            // Vercel adapter options (defaults are usually fine)
            // edge: false, // Deploy as Serverless Functions (default) not Edge Functions
            // runtime: 'nodejs18.x', // Or 'nodejs20.x' - Vercel usually detects
        })
    }
};

export default config;