// vitest.config.ts or vite.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup-client.ts'],
    // other settings...
  }
});
