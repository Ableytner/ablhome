import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    target: 'es2022',
    assetsDir: 'assets',
  },
  server: {
    host: true,
    port: 5173,
  },
});
