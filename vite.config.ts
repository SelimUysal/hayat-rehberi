import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(), tailwindcss(),
      {
        name: 'generate-app-version',
        apply: 'build',
        generateBundle() {
          const version = process.env.GITHUB_SHA || process.env.VITE_APP_VERSION || '';
          if (!/^[a-f0-9]{40}$/i.test(version)) return;
          this.emitFile({
            type: 'asset',
            fileName: 'app-version.json',
            source: JSON.stringify({ version })
          });
        }
      }
    ],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.GITHUB_SHA || process.env.VITE_APP_VERSION || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});
