<script lang="ts">
	import '../app.css'; 
	import Header from '$lib/components/Header.svelte'; 
	import Footer from '$lib/components/Footer.svelte'; 
    import { fade } from 'svelte/transition'; // Import fade transition
    import { page } from '$app/stores'; // Import page store to get current path for key
    import { t, locale } from '$lib/i18n/i18n'; // Import i18n
    import { initLocale } from '$lib/i18n/localeStorage'; // Import locale initialization
    import { onMount } from 'svelte';
    
    onMount(() => {
        // Initialize locale from localStorage
        initLocale();
    });
</script>

<svelte:head>
    <title>{$t("meta.title")}</title> 
    <meta name="description" content={$t("meta.description")} />
    <meta property="og:title" content={$t("meta.title")} />
    <meta property="og:description" content="Your trusted local real estate experts in Djerba, Tunisia." />
    <meta property="og:image" content="/og-image.jpg" /> 
    <meta property="og:url" content="YOUR_WEBSITE_URL" /> 
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={$t("meta.title")} />
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