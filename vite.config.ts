import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Set base to '/' for development and './' for production
  // This helps with both local development and GitHub Pages deployment
  base: mode === 'production' ? './' : '/',
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ['..']
    }
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
