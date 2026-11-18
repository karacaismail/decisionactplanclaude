import { defineConfig } from '@playwright/test'
import projectConfig from '../../playwright.config'

/** İş 6 kontrolleri. Ortak kapılarla aynı sunucuyu ve port ayarını kullanır. */
export default defineConfig({
  ...projectConfig,
  testDir: '.',
  testMatch: 'mobile-layout.browser.spec.ts',
  outputDir: '../../.pane/scratch/node_modules/mobile-results',
  timeout: 180_000,
  workers: 1,
  use: { ...projectConfig.use, actionTimeout: 15_000 },
  projects: [
    { name: 'mobile-chromium', use: { browserName: 'chromium', viewport: { width: 320, height: 720 }, hasTouch: true } },
    { name: 'mobile-webkit', use: { browserName: 'webkit', viewport: { width: 320, height: 720 }, hasTouch: true } },
  ],
})
