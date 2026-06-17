import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': `${process.cwd()}/src`,
    },
  },
  plugins: [
    tanstackStart({
      spa: { enabled: true },
    }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: '::',
    port: 8081,
  },
});
