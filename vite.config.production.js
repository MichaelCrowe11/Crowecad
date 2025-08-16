import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Production-optimized Vite configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Aggressive optimization for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'animation';
            if (id.includes('@tensorflow')) return 'tensorflow';
            if (id.includes('three')) return 'three';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('@tanstack')) return 'query';
            if (id.includes('react-hook-form')) return 'forms';
          }
        },
        // Use more aggressive chunking
        chunkFileNames: 'js/[name]-[hash:8].js',
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8][extname]'
      },
      // Tree-shake unused exports
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false
      }
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Source maps off for production
    sourcemap: false,
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
    // Asset optimization
    assetsInlineLimit: 4096
  }
});