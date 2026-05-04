import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteSingleFile(), tsconfigPaths()],
  esbuild: {
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
  },
  build: {
    target: "es2020",
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    minify: "esbuild",
    reportCompressedSize: false,
    rollupOptions: {
      input: "./toybox.html",
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});
