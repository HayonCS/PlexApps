import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { vitePluginGraphqlLoader } from "vite-plugin-graphql-loader";

const scriptsDir = path.join(__dirname, "../entry/scripts");

/** A map of of entry points for every file in scripts */
const scriptEntry = fs
  .readdirSync(scriptsDir)
  .filter((f) => /\.tsx?$/.test(f))
  .filter((f) => fs.statSync(path.join(scriptsDir, f)).isFile())
  .reduce((o, f) => {
    o[`scripts/${f.replace(/\.tsx?$/, "")}`] = path.resolve(path.join(scriptsDir, f));
    return o;
  }, {});

const entry = Object.assign(
  {
    server: "./entry/server.ts",
  },
  scriptEntry
);

console.info(entry);

export default defineConfig(({ command }) => {
  if (command === "build") {
    return {
      root: ".",
      assetsInclude: ["**/*.graphql"],
      resolve: {
        alias: {
          server: path.resolve(__dirname, "../modules/server"),
          context: path.resolve(__dirname, "../modules/context"),
          records: path.resolve(__dirname, "../modules/records"),
          db: path.resolve(__dirname, "../modules/db"),
          modules: path.resolve(__dirname, "../modules"),
          "atomic-object": path.resolve(__dirname, "../modules/atomic-object"),
          "node-environment": path.resolve(__dirname, "../modules/node-environment"),
          "rest-endpoints": path.resolve(__dirname, "../modules/rest-endpoints"),
          "domain-services": path.resolve(__dirname, "../modules/domain-services"),
          client: path.resolve(__dirname, "../modules/client"),
          "graphql-api": path.resolve(__dirname, "../modules/graphql-api"),
          core: path.resolve(__dirname, "../modules/core"),
          helpers: path.resolve(__dirname, "../modules/helpers"),
          subversion: path.resolve(__dirname, "../modules/subversion"),
        },
      },
      appType: "spa",
      build: {
        ssr: true,
        rollupOptions: {
          input: entry,
          output: {
            entryFileNames: "[name].mjs",
            chunkFileNames: "[name].mjs",
            assetFileNames: "[name].[ext]",
            dir: "dist",
          },
          external: ["child_process"],
        },
        emptyOutDir: false,
        minify: false,
      },
      plugins: [react(), vitePluginGraphqlLoader()],
      define: {},
    };
  }
});
