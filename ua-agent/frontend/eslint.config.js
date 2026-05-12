import js from "@eslint/js";
import tseslint from "typescript-eslint";

const rendererBan = {
  files: [
    "src/renderer/**/*.{ts,tsx}",
    "src/features/**/*.{ts,tsx}",
    "src/shared/**/*.{ts,tsx}",
  ],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "child_process",
            message:
              "Renderer/feature/shared code must reach Node only through the preload-exposed window.api.",
          },
          {
            name: "node:child_process",
            message:
              "Renderer/feature/shared code must reach Node only through the preload-exposed window.api.",
          },
          {
            name: "electron",
            message:
              "Renderer/feature/shared code must reach Electron only through the preload-exposed window.api.",
          },
          {
            name: "fs/promises",
            message:
              "Renderer/feature/shared code must reach Node only through the preload-exposed window.api.",
          },
          {
            name: "node:fs/promises",
            message:
              "Renderer/feature/shared code must reach Node only through the preload-exposed window.api.",
          },
        ],
      },
    ],
  },
};

// Per Constitution II + plan.md "Structure Decision": only the main process is
// allowed to import child_process / electron.utilityProcess. The utility-process
// tree (src/utility/**) is forked BY main but is itself not allowed to spawn
// children or fork further utility processes.
const utilityBan = {
  files: ["src/utility/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "child_process",
            message:
              "Utility-process code must not spawn child processes. Only src/main/** may import child_process or electron.utilityProcess.",
          },
          {
            name: "node:child_process",
            message:
              "Utility-process code must not spawn child processes. Only src/main/** may import child_process or electron.utilityProcess.",
          },
          {
            name: "electron",
            message:
              "Utility-process code must not import electron. Only src/main/** may import electron (incl. utilityProcess).",
          },
        ],
      },
    ],
  },
};

const allowUnderscoreUnused = {
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
};

export default tseslint.config(
  {
    ignores: ["node_modules/**", "out/**", "dist/**", ".vite/**", "dist-tsc/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  allowUnderscoreUnused,
  rendererBan,
  utilityBan,
);
