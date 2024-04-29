import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import TrivialCore from 'trivial-core'

new TrivialCore.ActionRegistry().build()

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    extensions: ['.js','.vue', 'scss'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['trivial-core'],
  },
  build: {
    commonjsOptions: {
      include: [/trivial-core/, /node_modules/],
    },
  },
})