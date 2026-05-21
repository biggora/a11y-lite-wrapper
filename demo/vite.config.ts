import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const demoRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/a11y-lite-wrapper/",
  root: demoRoot,
  build: {
    emptyOutDir: true,
    outDir: "../demo-dist"
  },
  resolve: {
    alias: [
      {
        find: /^a11y-lite-wrapper\/react$/,
        replacement: resolve(demoRoot, "../src/react/index.ts")
      },
      {
        find: /^a11y-lite-wrapper$/,
        replacement: resolve(demoRoot, "../src/index.ts")
      }
    ]
  }
});
