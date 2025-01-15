/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#D4AF37', // 暗金色
          '@secondary-color': '#F5DEB3', // 浅金色
        },
      },
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames(assets) {
          if (assets.name.endsWith(".css")) {
            return "css/[name]-[hash].css";
          }
          const imgExts = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
          if (imgExts.some((ext) => assets.name.endsWith(ext))) {
            return "image/[name]-[hash].[ext]";
          }
          return "assets/[name]-[hash].[ext]";
        },
        manualChunks(id) {
          if (id.includes("node_modules/.pnpm")) {
            const name = id.split('/')[6][0];
            return name;
          }
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true, // 生产环境移除debugger
      },
    },
  },
})
