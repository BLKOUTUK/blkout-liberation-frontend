import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    // Ensure accessibility and performance for community access
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Optimize for low-bandwidth community access
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'liberation-ui': ['framer-motion', 'lucide-react'],
          'accessibility': ['@radix-ui/react-accessible-icon', 'react-aria']
        }
      }
    }
  },
  server: {
    // Development server accessible for community testing
    host: true,
    port: 3000
  }
})