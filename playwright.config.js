import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  use: {
    baseURL: process.env.BACKEND_URL || "http://localhost:5000/api/v1",
  },
  reporter: 'dot',
});
