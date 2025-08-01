import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteImagemin from "vite-plugin-imagemin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteImagemin({
      pngquant: {
        quality: [0.4, 0.6], // More aggressive PNG compression (lower quality range)
        speed: 3, // Compress at a slower speed for better results (1-10, where 10 is fastest)
      },
      optipng: {
        optimizationLevel: 7, // Max optimization level for PNG
      },
      mozjpeg: {
        quality: 60, // Lower quality for JPEG (you can go as low as 50 for aggressive compression)
        progressive: true, // Enables progressive JPEGs, which are smaller
      },
      webp: {
        quality: 50, // Aggressive compression for WebP (lower quality)
      },
      gifsicle: {
        optimizationLevel: 3, // Max optimization for GIFs
      },
      // Optional: You can also add svg compression if you are using SVGs
      svgo: {
        plugins: [
          { removeViewBox: false }, // Keep the viewBox attribute (important for responsive SVGs)
          { cleanupIDs: false }, // Remove unnecessary IDs
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 100 * 1024,
  },
});
