<script lang="ts">
	import '../app.css'; 
	import Header from '$lib/components/Header.svelte'; 
	import Footer from '$lib/components/Footer.svelte'; 
    import { fade } from 'svelte/transition'; // <<< Import fade transition
    import { page } from '$app/stores'; // <<< Import page store to get current path for key
</script>

<svelte:head>
    <title>ImmoKraini - Djerba Real Estate</title> 
    <meta name="description" content="Find your perfect property in Djerba, Tunisia with ImmoKraini. Explore listings for villas, apartments, land, and more. Your trusted local real estate experts." />
    <meta property="og:title" content="ImmoKraini - Djerba Real Estate" />
    <meta property="og:description" content="Your trusted local real estate experts in Djerba, Tunisia." />
    <meta property="og:image" content="/og-image.jpg" /> 
    <meta property="og:url" content="YOUR_WEBSITE_URL" /> 
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ImmoKraini - Djerba Real Estate" />
    <meta name="twitter:description" content="Your trusted local real estate experts in Djerba, Tunisia." />
    <meta name="twitter:image" content="/og-image.jpg" /> 
    <link rel="icon" href="/favicon.png" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" /> 
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> 
    <link rel="manifest" href="/manifest.webmanifest" /> 
</svelte:head>

<div class="flex flex-col min-h-screen"> 
  
  <Header />

  <main class="flex-grow relative"> 
    
    <!-- Keyed block around the slot for transitions -->
    {#key $page.url.pathname} 
        <div 
            class="page-transition" 
            in:fade={{ duration: 250, delay: 250 }} 
            out:fade={{ duration: 250 }}
        >
            <slot /> 
        </div>
    {/key}
    <!-- End Keyed block -->

  </main>

  <Footer /> 

</div>

<style>
    /* Optional: Style the transition wrapper if needed */
    /* .page-transition { */
        /* position: absolute; */ /* Example for more complex transitions */
        /* width: 100%; */
    /* } */
</style>