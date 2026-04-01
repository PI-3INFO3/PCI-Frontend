import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      id: 'com.tarefas-pwa',
      name: 'Gerenciador de Tarefas',
      short_name: 'Tarefas',
      description: 'Aplicativo PWA para gerenciar tarefas diárias',
      theme_color: '#4a90d9',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/public/logo-96-96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: '/public/logo-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/public/logo-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    devOptions: {
      enabled: true,
    },
  })],
})

