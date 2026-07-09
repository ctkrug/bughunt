import { defineConfig } from "vite";

// Relative asset paths so the built site can be served from any subpath
// (e.g. apps.charliekrug.com/bughunt) without a base-URL rewrite.
export default defineConfig({
  base: "./",
  build: {
    // The publisher serves this directory as the live site at
    // apps.charliekrug.com/bughunt, so the built app IS the landing page.
    outDir: "site",
  },
});
