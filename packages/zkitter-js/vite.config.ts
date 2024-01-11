// vite.config.js
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [nodePolyfills(), dts()],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Zkitter",
      fileName: "zkitter",
    },
    rollupOptions: {
      // NOTE: Original had "snarkjs" as external
      external: [],
    },
  },
});
