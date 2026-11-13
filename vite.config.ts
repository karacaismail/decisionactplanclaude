import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: https://karacaismail.github.io/decisionactplanclaude/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/decisionactplanclaude/' : '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Yetenek tabanlı teslim: grafik ve rapor parçaları ayrı dosyada kalır.
        manualChunks: (id: string) => {
          if (id.includes('node_modules/echarts') || id.includes('node_modules/zrender')) return 'echarts'
          if (id.includes('node_modules/antd') || id.includes('node_modules/@ant-design') || id.includes('node_modules/rc-')) return 'antd'
          if (id.includes('node_modules/react')) return 'react'
          return undefined
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}))
