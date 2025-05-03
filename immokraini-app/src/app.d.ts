// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
// Add these declarations for Swiper:
declare module 'lucide-svelte'; 
declare module 'swiper/element/bundle';
declare module 'swiper/element'; 
declare module 'swiper/types';   
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}
// Add this line to src/app.d.ts
export {};
