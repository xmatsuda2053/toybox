import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // 環境変数からターゲットを取得（未指定なら index.html）
  const target = process.env.APP_TARGET || "toybox";
  const inputHtml = `./root/${target}.html`;

  return {
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
        input: `${inputHtml}`,
        output: {
          inlineDynamicImports: true,
          manualChunks: undefined,
        },
      },
    },
  };
});
