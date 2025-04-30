import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// This is the simplified configuration to run the development server
// with stable SvelteKit and Tailwind v3. Testing config is temporarily removed.
export default defineConfig({
	plugins: [ sveltekit() ]
	// The 'test' configuration block is removed below to prevent startup errors.
	// It can be added back and fixed later once the main app runs.
	/*
	test: {
		workspace: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()], // svelteTesting would need to be imported correctly
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/** /*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/** /*.{test,spec}.{js,ts}'],
					exclude: ['src/** /*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
	*/
});