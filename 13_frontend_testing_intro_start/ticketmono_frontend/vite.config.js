import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// we need to also inlucde our test files
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // this file is going to run our mock service worker.
    setupFiles: ['./src/test/setup.js'], // we're going to add this shortly.
    globals: true
  }
})
