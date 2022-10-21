import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import visualizer from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";
import legacy from "@vitejs/plugin-legacy";

const postCssScss = require("postcss-scss");

const viteCompressionFilter = /\.(js|mjs|json|css|html|svg)$/i;

// https://vitejs.dev/config/
export default defineConfig({
    root: "frontend",
    server: {
        port: 3010,
    },
    define: {
        "FRONTEND_VERSION": JSON.stringify(process.env.npm_package_version),
    },
    plugins: [
        vue(),
        legacy({
            targets: [ "since 2015" ],
        }),
        visualizer({
            filename: "tmp/dist-stats.html"
        }),
        viteCompression({
            algorithm: "gzip",
            filter: viteCompressionFilter,
        }),
        viteCompression({
            algorithm: "brotliCompress",
            filter: viteCompressionFilter,
        }),
    ],
    css: {
        postcss: {
            "parser": postCssScss,
            "map": false,
        }
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
    }
});
