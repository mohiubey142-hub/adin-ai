import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    publicDir: 'public',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Adin AI - Free CV Builder & Cover Letter Maker',
          short_name: 'Adin AI',
          description: 'Create professional CV and cover letter free with Adin AI. Best free CV builder and cover letter maker online.',
          theme_color: '#8b5cf6',
          background_color: '#0a0a0a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
          // ✅ FIX: Prevent service worker from hijacking SEO/static files
          // Without this, the SPA navigateFallback (index.html) intercepts
          // requests to robots.txt, sitemap.xml, etc. and serves the app
          // shell instead of the real file — this was the root cause of
          // "homepage loads instead of robots.txt/sitemap.xml" for returning visitors.
          navigateFallbackDenylist: [
            /^\/robots\.txt$/,
            /^\/sitemap\.xml$/,
            /^\/manifest\.webmanifest$/,
            /^\/browserconfig\.xml$/,
            /^\/favicon\.ico$/,
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/js\.puter\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'puter-cdn',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                }
              }
            }
          ]
        }
      })
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
      // ✅ CHUNK SIZE LIMIT INCREASED (warning hatane ke liye)
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'clerk-vendor': ['@clerk/clerk-react'],
            'lucide-vendor': ['lucide-react'],
            // ✅ NAYA: PDF libraries ko alag file mein
            'pdf-vendor': ['html2pdf.js', 'jspdf'],
            // ✅ NAYA: Image libraries ko alag file mein
            'image-vendor': ['react-easy-crop'],
          }
        }
      },
      sourcemap: false,
      minify: 'esbuild',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        }
      }
    }
  };
});
