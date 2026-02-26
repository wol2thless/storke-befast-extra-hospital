
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: "/stroke-befast",
  resolve: {
    alias: {
      "@":  "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@layouts": "/src/layouts",
      "@routes": "/src/routes",
      "@utils": "/src/utils",
      "@assets": "/src/assets",
      "@styles": "/src/styles",
      "@hooks": "/src/hooks",
      "@context": "/src/context",
      "@services": "/src/services",
      "@store": "/src/store",
    }
  },
  server: {
    proxy: {
      '/api/appointment': {
        target: 'http://192.168.99.225',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/appointment/, '/api/stroke-befast')
      }
    }
  }
});