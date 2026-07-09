import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.0:8000', // This is standard localhost in python uvicorn
        changeOrigin: true,
      },
    },
  },
})
