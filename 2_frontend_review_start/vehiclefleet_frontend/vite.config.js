import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwidcss
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
