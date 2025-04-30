// This is the relevant part of tailwind.config.js
export default {
  // Ensure this line is present and correct:
  content: [
    './src/**/*.{html,js,svelte,ts}' 
  ], 

  theme: {
    extend: {
      // Your colors should be here
      colors: {
        'brand-orange': '#FFC067',
        'sky-blue':     '#66F4FF',
        'brand-blue':   '#66C4FF',
        'muted-blue':   '#7D9AAF',
      },
    },
  },

  plugins: [
    // Your plugins (forms, typography) should be here if you imported them
    // e.g., formsPlugin, typographyPlugin
  ],
};