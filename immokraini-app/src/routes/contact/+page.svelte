<script lang="ts">
    import ContactForm from '$lib/components/ContactForm.svelte';
    import { Phone, Mail, MapPin } from 'lucide-svelte';
    import { t } from'$lib/i18n/i18n.js'; // Import translation store
</script>

<svelte:head>
    <title>Contact ImmoKraini | Djerba Real Estate Agency</title>
    <meta name="description" content="Get in touch with ImmoKraini for all your real estate needs in Djerba. Contact us via phone, email, or visit our office." />
</svelte:head>

<!-- Keep light gray or white background -->
<div class="bg-gray-50 min-h-[calc(100vh-var(--header-height,10vh))]"> 
    <div class="container mx-auto px-4 py-16 md:py-24">
        <h1 class="text-4xl font-bold text-center mb-12 text-muted-blue">{$t('contact.heading')}</h1>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-start">
            
            <!-- Left Column: Contact Info & Map -->
            <div class="md:col-span-2 space-y-10 bg-white p-8 rounded-lg shadow-lg border-t-4 border-brand-orange"> 
                <div>
                    <h2 class="text-2xl font-semibold text-muted-blue mb-4">{$t('contact.officeInfo')}</h2> 
                    <address class="not-italic text-gray-700 space-y-3">
                        <p class="flex items-start">
                            <MapPin class="w-5 h-5 mr-3 mt-1 text-brand-orange flex-shrink-0" />
                            <span>{@html $t('contact.address')}</span>
                        </p>
                        <p class="flex items-center">
                            <Phone class="w-5 h-5 mr-3 text-brand-orange" />
                            <a href="tel:+21675123456" class="hover:text-brand-blue transition-colors">{$t('contact.phone')}</a> 
                        </p>
                        <p class="flex items-center">
                            <Mail class="w-5 h-5 mr-3 text-brand-orange" />
                            <a href="mailto:info@immokraini.com" class="hover:text-brand-blue transition-colors">{$t('contact.email')}</a> 
                        </p>
                    </address>
                </div>

                <!-- Map Placeholder -->
                <div>
                     <h3 class="text-xl font-semibold text-muted-blue mb-3">{$t('contact.findUs')}</h3> 
                     <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 border">
                         {$t('contact.mapPlaceholder')}
                     </div>
                </div>
            </div>

            <!-- Right Column: Contact Form -->
            <div class="md:col-span-3 bg-white p-8 rounded-lg shadow-lg border-t-4 border-brand-blue">
                 <h2 class="text-2xl font-semibold text-muted-blue mb-6">{$t('contact.sendMessage')}</h2> 
                 <ContactForm />
            </div>

        </div>
    </div>
</div>

<style>
    /* Add specific styles if needed */
</style>