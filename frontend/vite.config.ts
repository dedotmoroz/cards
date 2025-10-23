import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// const CF_HOST = 'colours-cache-villa-filled.trycloudflare.com'


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',   // именно строка, не true
    port: 5173,
    strictPort: true,
    // allowedHosts: [CF_HOST],

    hmr: { host: '192.168.1.50', port: 5173 }
    // hmr: {
    //   protocol: 'wss',
    //   host: CF_HOST,
    //   clientPort: 443,
    // },
  }
});


