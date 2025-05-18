import { derived, writable } from "svelte/store";
import translations from "./translations"; // <-- Use external translations.js
/** @type {Record<string, Record<string, string>>} */
const translationsTyped = translations;

// Define the type for translations
/**
 * @typedef {Object.<string, Object.<string, string>>} Translations
 */

export const locale = writable("en");
export const locales = Object.keys(translations);

/**
 * @param {string} locale
 * @param {string} key
 * @param {Record<string, any>} vars
 * @returns {string}
 */
function translate(locale, key, vars = {}) {
  if (!key) throw new Error("no key provided to $t()");
  if (!locale) throw new Error(`no translation for key "${key}"`);

  if (!translationsTyped[locale]) {
    locale = "en";
  }

  // Attempt to grab the translation from the translations object
  let text = translationsTyped[locale][key];

  // If the key doesn't exist in the chosen locale, try English
  if (!text && locale !== "en") {
    text = translationsTyped["en"][key];
  }

  // If it's still missing, return the key itself
  if (!text) {
    return key;
  }

  // Replace any passed-in variables in the translation string
  Object.keys(vars).forEach((k) => {
    // Fix: match {minBeds} not {{minBeds}}
    const regex = new RegExp(`{${k}}`, "g");
    text = text.replace(regex, vars[k]);
  });

  return text;
}

export const t = derived(locale, ($locale) => (
  /**
   * @param {string} key
   * @param {Record<string, any>} vars
   */
  (key, vars = {}) => translate($locale, key, vars)
));
