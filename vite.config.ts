import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    publicDir: 'public',
    plugins: [
      react(), 
      tailwindcss(),
      // ✅ PWA COMPLETELY REMOVED - Temporary fix
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // ✅ Instagram WebView ke liye ES2017 target
      target: 'es2017',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'clerk-vendor': ['@clerk/clerk-react'],
            'lucide-vendor': ['lucide-react'],
            'pdf-vendor': ['html2pdf.js', 'jspdf'],
            'image-vendor': ['react-easy-crop'],
          }
        }
      },
      sourcemap: false,
      minify: 'esbuild',
    }
  };
});