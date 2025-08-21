import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // Ignore TypeScript errors during build
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  build: {
    // Continue build even with TypeScript errors
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress TypeScript-related warnings
        if (warning.code === "TS2307" || warning.code === "TS2339") return;
        warn(warning);
      },
    },
  },
});
