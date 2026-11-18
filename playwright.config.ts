import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

/** Chromium ve WebKit. Firefox çalıştırılmaz (kalıcı kullanıcı kararı). */

/** Her çalışma kopyasına ayrı port verilir. Eski PW_PORT ayarı da desteklenir. */
const port = Number(process.env.PLAYWRIGHT_PORT ?? process.env.PW_PORT ?? 5179)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PLAYWRIGHT_PORT veya PW_PORT, 1 ile 65535 arasında tam sayı olmalıdır.')
}
const baseURL = `http://127.0.0.1:${port}`
const jsonOutputFile = process.env.PLAYWRIGHT_JSON_OUTPUT_FILE

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? './test-results',
  reporter: jsonOutputFile ? [['list'], ['json', { outputFile: jsonOutputFile }]] : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    url: baseURL,
    // Açık sunucu başka çalışma kopyasına ait olabilir. Dolu portta test durur.
    reuseExistingServer: false,
    timeout: 60_000,
  },
  // isMobile yalnız Playwright emülasyonunu ayarlar. Uygulamanın davranışını seçmez.
  projects: [
    { name: 'chromium-320', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-360', use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-landscape', use: { ...devices['Desktop Chrome'], viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true } },
    { name: 'chromium-1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'chromium-1920', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'webkit-320', use: { ...devices['Desktop Safari'], viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-360', use: { ...devices['Desktop Safari'], viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-375', use: { ...devices['Desktop Safari'], viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-390', use: { ...devices['Desktop Safari'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-landscape', use: { ...devices['Desktop Safari'], viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-tablet', use: { ...devices['Desktop Safari'], viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true } },
    { name: 'webkit-1280', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } } },
    { name: 'webkit-1920', use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } } },
  ],
})
