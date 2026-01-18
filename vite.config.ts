import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Vite automatically loads .env files and exposes VITE_* variables via import.meta.env
    // No need to manually define them
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false, // Allow automatic port switching if 3000 is busy
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
