import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        id: '/',
        name: 'Anime Tracker',
        short_name: 'AnimeTracker',
        description: 'Track your favorite anime and never miss an episode!',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#8b5cf6',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: 'screenshots/desktop.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshots/mobile.png',
            sizes: '375x667',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
