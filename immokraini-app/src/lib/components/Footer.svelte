<script lang="ts">
    import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-svelte';
    import { t } from '$lib/i18n/i18n.js'; // Correct import path for translation store
    const currentYear = new Date().getFullYear();
</script>

<footer class="bg-gray-800 text-gray-300 mt-auto"> 
    <div class="container mx-auto px-4 sm:px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            <!-- Column 1: Brand/About -->
            <div>
                <h3 class="text-lg font-semibold text-white mb-3">ImmoKraini</h3>
                <p class="text-sm">
                    {$t('footer.about')}
                </p>
            </div>

            <!-- Column 2: Quick Links -->
            <div>
                <h3 class="text-lg font-semibold text-white mb-3">{$t('footer.quickLinks')}</h3>
                <ul class="space-y-2 text-sm">
                    <li><a href="/properties" class="hover:text-brand-blue transition-colors">{$t('footer.links.properties')}</a></li>
                    <li><a href="/sell" class="hover:text-brand-blue transition-colors">{$t('footer.links.sell')}</a></li>
                    <li><a href="/about" class="hover:text-brand-blue transition-colors">{$t('footer.links.about')}</a></li> 
                    <li><a href="/contact" class="hover:text-brand-blue transition-colors">{$t('footer.links.contact')}</a></li>
                </ul>
            </div>

            <!-- Column 3: Social Media -->
            <div>
                <h3 class="text-lg font-semibold text-white mb-3">{$t('footer.followUs')}</h3>
                <div class="flex justify-center md:justify-start space-x-4">
                    <a href="#" aria-label="Facebook" class="text-gray-400 hover:text-sky-blue transition-colors">
                        <Facebook class="w-6 h-6" />
                    </a>
                    <a href="#" aria-label="Instagram" class="text-gray-400 hover:text-sky-blue transition-colors">
                        <Instagram class="w-6 h-6" />
                    </a>
                </div>
            </div>

        </div>

        <!-- Copyright -->
        <div class="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
            © {currentYear} ImmoKraini. {$t('footer.copyright')}
        </div>
    </div>
</footer>

<style>
    /* Footer specific styles if needed */
</style>