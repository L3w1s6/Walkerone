import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react(), tailwindcss(), mkcert()
  ],

  server: {
    https: true, // Ensure HTTPS
    proxy: { // Make backend think that all requests come from itself, avoids errors with communicating between http and https
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
        changeOrigin: true
      },
      '/test': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/get': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/add': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/delete': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/show': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/register': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/getUserData': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/getRoutes': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/addRoute': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/deleteRoute': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/showRoutesByUser': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/showRoutesByTime': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/getDoctors': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
