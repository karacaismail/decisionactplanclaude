import { defineConfig, devices } from '@playwright/test'

/** Chromium ve WebKit. Firefox çalıştırılmaz (kalıcı kullanıcı kararı). */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5179',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5179 --strictPort',
    url: 'http://localhost:5179',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium-320', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'webkit-390', use: { ...devices['Desktop Safari'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-1280', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } } },
  ],
})
