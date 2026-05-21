import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "combobox/index": "src/combobox/index.ts",
    "listbox/index": "src/listbox/index.ts",
    "keyboard/index": "src/keyboard/index.ts",
    "react/index": "src/react/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  outExtension({ format }) {
    return {
      js: format === "esm" ? ".mjs" : ".cjs"
    };
  },
  external: ["react"]
});
