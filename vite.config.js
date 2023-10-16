// import path from "path";
import { defineConfig } from "vite";
import builtins from "builtin-modules";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import process from "node:process";

const prod = process.argv[2] === "production";

export default defineConfig(() => {
    return {
        plugins: [vue()],
        watch: !prod,
        build: {
            sourcemap: prod ? false : "inline",
            minify: prod,
            // Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
            commonjsOptions: {
                ignoreTryCatch: false,
            },
            lib: {
                entry: fileURLToPath(
                    new URL("./src/starterIndex.ts", import.meta.url)
                ),
                // entry: path.resolve(__dirname, "./src/starterIndex.ts"),
                formats: ["cjs"],
            },
            css: {},
            rollupOptions: {
                output: {
                    // Overwrite default Vite output fileName
                    entryFileNames: "main.js",
                    assetFileNames: "styles.css",
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
    };
});
