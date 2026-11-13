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
        manualChunks: {
          antd: ['antd'],
          react: ['react', 'react-dom', 'react-router'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}))
