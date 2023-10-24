// import path from "path";
import { defineConfig } from "vite";
import builtins from "builtin-modules";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import fs from "fs/promises";
import process from "node:process";
import manifest from "./manifest.json";
import path from "path";

import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
const env = dotenv.config();
dotenvExpand.expand(env);

const isWatch = process.argv.includes("--watch");

export default defineConfig(() => {
  // const isProd = command === "build"; // always true
  return {
    plugins: [
      vue(),
      {
        name: "postbuild-commands",
        async closeBundle() {
          if (!isWatch) return;

          if (!process.env.OB_PLUGIN_DIST) {
            console.log(
              "为了更好的开发体验，你可以在 .env 中配置 OB_PLUGIN_DIST"
            );
            return;
          }
          const dist = process.env.OB_PLUGIN_DIST + manifest.id + "-dev";

          await fs.mkdir(dist, { recursive: true });

          const copy = async (src: string, dist: string) => {
            await fs.copyFile(src, path.resolve(dist, src));
          };
          // do something
          // copy file
          await Promise.all([
            await copy("./main.js", dist),
            await copy("./styles.css", dist),
            await copy("./manifest.json", dist),
            await copy("./.hotreload", dist),
          ]);
          console.log("复制结果到", dist);
        },
      },
    ],
    build: {
      // 都是 electron 了怕啥
      target: "esnext",
      sourcemap: isWatch ? "inline" : false,
      minify: true,
      commonjsOptions: {
        ignoreTryCatch: false,
      },
      // 使用 vite 就是为了 lib 打包
      lib: {
        entry: fileURLToPath(new URL("./src/starterIndex.ts", import.meta.url)),
        formats: ["cjs"],
      },
      css: {},
      rollupOptions: {
        output: {
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
          exports: "named",
        },
        external: [
          "obsidian",
          "electron",
          "codemirror",
          "@codemirror/autocomplete",
          "@codemirror/closebrackets",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/comment",
          "@codemirror/fold",
          "@codemirror/gutter",
          "@codemirror/highlight",
          "@codemirror/history",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/matchbrackets",
          "@codemirror/panel",
          "@codemirror/rangeset",
          "@codemirror/rectangular-selection",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/stream-parser",
          "@codemirror/text",
          "@codemirror/tooltip",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/lr",
          "@lezer/highlight",
          ...builtins,
        ],
      },
      // Use root as the output dir
      emptyOutDir: false,
      outDir: ".",
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
