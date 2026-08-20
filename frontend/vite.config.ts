import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import wasm from "vite-plugin-wasm";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    wasm(),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
    include: [
      "@tanstack/router-plugin/vite",
      "@tanstack/react-router",
      "marked",
    ],
  },
  resolve: {
    alias: [
      { find: "devnote", replacement: path.resolve(__dirname, "src") },
      {
        find: "@tanstack/router-plugin/vite",
        replacement: path.resolve(
          __dirname,
          "node_modules/@tanstack/router-plugin/dist/esm/vite.js"
        ),
      },
    ],
  },
});
