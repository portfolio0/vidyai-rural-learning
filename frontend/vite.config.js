import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxAgeSeconds: 300 } },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 2592000 } },
          },
        ],
      },
      manifest: false, // using public/manifest.json
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'recharts'],
          store: ['zustand', '@tanstack/react-query'],
        },
      },
    },
  },
});
