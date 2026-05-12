import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const rendererAlias = {
  "@": path.resolve(__dirname, "src"),
};

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/main",
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "src/main/index.ts"),
          "utility/index": path.resolve(__dirname, "src/utility/keyword-crawl/index.ts"),
          "utility/debug-cli": path.resolve(__dirname, "src/utility/keyword-crawl/debug-cli.ts"),
        },
        output: { format: "cjs", entryFileNames: "[name].cjs" },
      },
    },
    resolve: { alias: rendererAlias },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: { index: path.resolve(__dirname, "src/preload/index.ts") },
        output: { format: "cjs", entryFileNames: "[name].cjs" },
      },
    },
    resolve: { alias: rendererAlias },
  },
  renderer: {
    root: __dirname,
    plugins: [react()],
    server: {
      port: 6173,
      strictPort: true,
    },
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: { index: path.resolve(__dirname, "index.html") },
      },
    },
    resolve: { alias: rendererAlias },
  },
});
