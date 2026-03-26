import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const runtimeAssetFiles = [
  path.join("assets", "images", "mapslink-logo.png"),
  path.join("assets", "images", "candidate-avatar.png"),
  path.join("assets", "images", "mapslink-preview.png"),
  path.join("assets", "images", "logo-icon-192.png"),
  path.join("assets", "images", "logo-icon-512.png"),
  "manifest.json",
];

function copyRuntimeAssets() {
  return {
    name: "copy-runtime-assets",
    apply: "build",
    closeBundle() {
      const distDir = path.join(rootDir, "dist");
      runtimeAssetFiles.forEach((relativePath) => {
        const source = path.join(rootDir, relativePath);
        const target = path.join(distDir, relativePath);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
      });
    },
  };
}

export default defineConfig({
  appType: "spa",
  base: "/",
  plugins: [react(), copyRuntimeAssets()],
  build: {
    assetsDir: "static",
    rollupOptions: {
      input: {
        main: path.join(rootDir, "index.html"),
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("react-leaflet") ||
            id.includes("/leaflet/") ||
            id.includes("\\leaflet\\")
          ) {
            return "maps";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }

          return undefined;
        },
      },
    },
  },
});
