import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  expect: {
    timeout: 30000,
  },
  reporter: 'html',
  use: {
    headless: false,
    browserName: 'chromium',
  },
});