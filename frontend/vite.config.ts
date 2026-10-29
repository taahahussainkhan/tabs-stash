import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: 'localhost',
    port: 5174,
    proxy: {
      '/api': {
        // point the dev proxy at a local `npm run dev` in ../server by default;
        // set VITE_DEV_PROXY_TARGET to talk to the deployed API instead
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
