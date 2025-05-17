import { locale } from './i18n';
import { browser } from '$app/environment';

// Initialize the locale from localStorage when the app loads
export function initLocale() {
  if (browser) {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      locale.set(savedLocale);
    }
    
    // Subscribe to locale changes to save them to localStorage
    locale.subscribe(value => {
      if (browser && value) {
        localStorage.setItem('locale', value);
      }
    });
  }
}
