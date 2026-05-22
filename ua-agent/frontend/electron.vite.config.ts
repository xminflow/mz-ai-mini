import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import type { Plugin } from "vite";
import JavaScriptObfuscator from "javascript-obfuscator";

const rendererAlias = {
  "@": path.resolve(__dirname, "src"),
};

// 仅在生产打包时混淆 main / preload 代码，开发构建不受影响
function obfuscatePlugin(): Plugin {
  return {
    name: "obfuscate-output",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        chunk.code = JavaScriptObfuscator.obfuscate(chunk.code, {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: false,
          identifierNamesGenerator: "hexadecimal",
          renameGlobals: false,
          rotateStringArray: true,
          selfDefending: false,
          stringArray: true,
          stringArrayEncoding: ["base64"],
          stringArrayThreshold: 0.75,
        }).getObfuscatedCode();
      }
    },
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), obfuscatePlugin()],
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
    plugins: [externalizeDepsPlugin(), obfuscatePlugin()],
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
