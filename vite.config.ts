import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(configDir, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/three/examples')) return 'three-addons';
              if (id.includes('node_modules/three')) return 'three-vendor';
              if (id.includes('node_modules/@google/genai')) return 'ai-vendor';
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
              if (id.includes('node_modules/lucide-react') || id.includes('node_modules/motion')) return 'ui-vendor';
            },
          },
        },
      },
    };
});
