import { defineConfig } from "vite";

// Relative asset paths so the built site can be served from any subpath
// (e.g. apps.charliekrug.com/bughunt) without a base-URL rewrite.
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
});
