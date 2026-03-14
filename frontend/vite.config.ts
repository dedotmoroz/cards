import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// const CF_HOST = 'colours-cache-villa-filled.trycloudflare.com'


export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-router': ['react-router-dom'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-state': ['zustand'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',   // именно строка, не true
    port: 8888,
    strictPort: true,
    // allowedHosts: [CF_HOST],

    hmr: { host: '192.168.1.50', port: 8888 }
    // hmr: {
    //   protocol: 'wss',
    //   host: CF_HOST,
    //   clientPort: 443,
    // },
  }
});


