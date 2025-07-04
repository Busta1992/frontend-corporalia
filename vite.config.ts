// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/Corporalia': {
        target: 'http://localhost:8080', // la URL de tu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
