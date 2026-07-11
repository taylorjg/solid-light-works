import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    {
      name: 'transform-jsx-in-js',
      enforce: 'pre',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null

        return transformWithOxc(code, id, { lang: 'jsx' })
      },
    },
    react({
      include: /\.(jsx|tsx|js)$/,
    }),
  ],
  optimizeDeps: {
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  base: '/solid-light-works/',
  build: {
    outDir: 'dist',
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
