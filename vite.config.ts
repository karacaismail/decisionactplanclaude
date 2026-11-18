import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages: https://karacaismail.github.io/decisionactplanclaude/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/decisionactplanclaude/' : '/',
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    target: 'es2022',
    manifest: true,
    // WebKit, başarısız modulepreload isteğini sayfa yenilense de saklayabiliyor.
    // https://bugs.webkit.org/show_bug.cgi?id=270357
    // Uygulamanın dinamik importları ve ayrı CSS yüklemesi korunur.
    modulePreload: false,
    rollupOptions: {
      preserveEntrySignatures: false,
      output: {
        // Ekranlar dinamik import ile ayrılır. Ortak bir ekran parçası oluşturulmaz.
        codeSplitting: {
          groups: [
            {
              name: 'report-build',
              test: /\/src\/reports\/(build|handoff|foundation)\.ts$/,
              // Ortak veri ve motor kodu rapor parçasına taşınmamalı.
              includeDependenciesRecursively: false,
            },
            {
              name: (id: string) => {
                if (id.includes('node_modules/echarts') || id.includes('node_modules/zrender')) return 'echarts'
                if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design') || id.includes('node_modules/rc-')) return 'antd'
                if (id.includes('node_modules/react')) return 'react'
                return undefined
              },
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
  },
}))
