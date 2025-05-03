<script lang="ts">
    // Removed ContactForm import
    import { Award, TrendingUp, Users, ArrowRight } from 'lucide-svelte'; // Added ArrowRight
</script>

<svelte:head>
    <title>Sell Your Property in Djerba | ImmoKraini</title>
    <meta name="description" content="Thinking of selling your property in Djerba? Partner with ImmoKraini for expert valuation, marketing, and negotiation services." />
</svelte:head>

<!-- Section 1: Hero/Intro -->
<div class="bg-gradient-to-br from-sky-blue via-white to-brand-blue/10 pt-24 pb-16 md:pt-32 md:pb-24"> 
    <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 text-muted-blue">Sell Your Djerba Property with Confidence</h1>
        <p class="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
            Leverage our local expertise and targeted marketing strategies to achieve the best price for your home, villa, or land.
        </p>
         <a href="#selling-process" class="inline-block bg-brand-orange text-gray-900 font-semibold py-3 px-8 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out">
            Learn About Our Process
        </a>
    </div>
</div>

<!-- Section 2: Benefits -->
<section id="selling-process" class="py-16 px-4 bg-white">
    <div class="container mx-auto max-w-5xl">
         <h2 class="text-3xl font-bold text-center mb-12 text-muted-blue">Our Selling Advantage</h2>
         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div class="text-center p-6">
                 <TrendingUp class="w-12 h-12 text-brand-orange mx-auto mb-4" />
                 <h3 class="text-xl font-semibold text-gray-800 mb-2">Accurate Valuation</h3>
                 <p class="text-gray-600 text-sm">In-depth market analysis ensures your property is priced effectively from day one.</p>
             </div>
              <div class="text-center p-6">
                 <Award class="w-12 h-12 text-brand-blue mx-auto mb-4" />
                 <h3 class="text-xl font-semibold text-gray-800 mb-2">Strategic Marketing</h3>
                 <p class="text-gray-600 text-sm">Comprehensive online & offline campaigns to reach qualified buyers globally.</p>
             </div>
              <div class="text-center p-6">
                 <Users class="w-12 h-12 text-muted-blue mx-auto mb-4" />
                 <h3 class="text-xl font-semibold text-gray-800 mb-2">Expert Negotiation</h3>
                 <p class="text-gray-600 text-sm">Dedicated support to navigate offers and secure the best possible terms for you.</p>
             </div>
        </div>
    </div>
</section>

<!-- Section 3: Call to Action -->
<section class="py-16 px-4 bg-brand-blue/10"> 
    <div class="container mx-auto text-center max-w-3xl">
         <h2 class="text-3xl font-bold mb-4 text-gray-800">Ready to Take the Next Step?</h2>
         <p class="text-lg text-gray-700 mb-8">
             Contact us today for a confidential, no-obligation consultation and free market valuation of your Djerba property.
         </p>
         <a href="/contact" class="inline-flex items-center bg-brand-orange text-gray-900 font-semibold py-3 px-8 rounded-md shadow hover:opacity-90 transition duration-300 ease-in-out text-lg">
            Get Your Free Valuation
            <ArrowRight class="w-5 h-5 ml-2" />
        </a>
    </div>
</section>