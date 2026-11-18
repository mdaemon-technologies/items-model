import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

const OUT_DIR = "dist";

// The bundle paths come from package.json, which consumers resolve them through.
const BUNDLES: Record<string, string> = {
  es: pkg.module,
  cjs: pkg.common,
  umd: pkg.main
};

export default defineConfig({
  publicDir: false,
  build: {
    outDir: OUT_DIR,
    // Vite ignores tsconfig's target; keep the bundles at ES2015 as before.
    target: "es2015",
    // dist/ is emptied first; tsc -p tsconfig.build.json then writes the
    // declarations (see the "build" script).
    emptyOutDir: true,
    lib: {
      entry: "src/items-model.ts",
      name: "ItemsModel",
      formats: ["es", "cjs", "umd"],
      fileName: format => BUNDLES[format].slice(`${OUT_DIR}/`.length)
    },
    rolldownOptions: {
      output: {
        // The class is the module: module.exports (CJS), window.ItemsModel (UMD).
        exports: "default",
        // Library mode leaves ES output unminified; minify it like the CJS and UMD bundles.
        minify: true,
        // Keep the CJS and UMD bundles strict, as the TypeScript modules are.
        strict: true
      }
    }
  }
});
