<script lang="ts">
    import { Award, TrendingUp, Users, ArrowRight } from 'lucide-svelte';
    import { t } from'$lib/i18n/i18n.js'; // Import translation store
</script>

<svelte:head>
    <title>{$t('sell.metaTitle')}</title>
    <meta name="description" content="{$t('sell.metaDescription')}" />
</svelte:head>

<!-- Section 1: Hero/Intro -->
<div class="bg-gradient-to-br from-sky-blue via-white to-brand-blue/10 pt-24 pb-16 md:pt-32 md:pb-24"> 
    <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-muted-blue">{$t('sell.heroTitle')}</h1>
        <p class="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            {$t('sell.heroSubtitle')}
        </p>
         <a href="#selling-process" class="inline-block bg-brand-orange text-gray-900 font-semibold py-3 px-8 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out">
            {$t('sell.heroCta')}
        </a>
    </div>
</div>

<!-- Section 2: Benefits -->
<section id="selling-process" class="py-16 px-4 bg-white">
    <div class="container mx-auto max-w-5xl">
         <h2 class="text-3xl font-bold text-center mb-12 text-muted-blue">{$t('sell.advantageTitle')}</h2>
         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div class="text-center p-6">
                 <TrendingUp class="w-12 h-12 text-brand-orange mx-auto mb-4" />
                 <h3 class="text-xl font-semibold text-gray-800 mb-2">{$t('sell.valuationTitle')}</h3>
                 <p class="text-gray-600 text-sm">{$t('sell.valuationDesc')}</p>
             </div>
              <div class="text-center p-6">
                 <Award class="w-12 h-12 text-brand-blue mx-auto mb-4" />
                 <h3 class="text-xl font-semibold text-gray-800 mb-2">{$t('sell.marketingTitle')}</h3>
                 <p class="text-gray-600 text-sm">{$t('sell.marketingDesc')}</p>
             </div>
              <div class="text-center p-6">
                 <Users class="w-12 h-12 text-muted-blue mx-auto mb-4" />
                 <h3 class="text-xl font-semibold text-gray-800 mb-2">{$t('sell.negotiationTitle')}</h3>
                 <p class="text-gray-600 text-sm">{$t('sell.negotiationDesc')}</p>
             </div>
        </div>
    </div>
</section>

<!-- Section 3: Call to Action -->
<section class="py-16 px-4 bg-brand-blue/10"> 
    <div class="container mx-auto text-center max-w-3xl">
         <h2 class="text-3xl font-bold mb-4 text-gray-800">{$t('sell.ctaTitle')}</h2>
         <p class="text-lg text-gray-700 mb-8">
             {$t('sell.ctaDesc')}
         </p>
         <a href="/contact" class="inline-flex items-center bg-brand-orange text-gray-900 font-semibold py-3 px-8 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out text-lg">
            {$t('sell.ctaButton')}
            <ArrowRight class="w-5 h-5 ml-2" />
        </a>
    </div>
</section>