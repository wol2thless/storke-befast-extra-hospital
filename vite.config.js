
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [tailwindcss(), react()],
    base: env.VITE_BASE_PATH || "/stroke-befast",
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
          target: env.VITE_HIS_PROXY_TARGET || 'http://localhost',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/appointment/, '/api/stroke-befast')
        }
      }
    }
  };
});