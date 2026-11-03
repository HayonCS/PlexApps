import { defineConfig, defineProject } from "vitest/config";
import path from "path";
import config from "config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import commonjs from "vite-plugin-commonjs";

const nodeProject = defineProject({
  test: {
    extends: true,
    name: { label: "node", color: "green" },
    include: ["**/*.spec.ts"],
    environment: "node",
  },

  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
    }),
    commonjs(),
    tsconfigPaths(),
  ],
  define: {
    "process.env": {},
    // DataGrid license
    "process.env.DATA_GRID_LICENSE_KEY": JSON.stringify(config.get("dataGridLicenseKey")),
  },
});

const jsDomProject = defineProject({
  extends: true,
  test: {
    name: { label: "jsdom", color: "purple" },
    extends: true,
    include: ["modules\/**\/*.test.?(c|m)[jt]s?(x)"],
    environment: "jsdom",
  },
  plugins: [react({}), commonjs(), tsconfigPaths()],
  define: {
    "process.env": {},
    // DataGrid license
    "process.env.DATA_GRID_LICENSE_KEY": JSON.stringify(config.get("dataGridLicenseKey")),
  },
});

const myConfig = defineConfig(() => {
  return {
    root: ".",
    test: {
      testTimeout: 30000,
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
      typecheck: {
        tsconfig: path.resolve(__dirname, "../tsconfig.base.json"),
      },
      server: {
        deps: {
          inline: ["@toolpad/core", "@mui/x-data-grid"],
        },
      },
      globals: true,
      setupFiles: ["vite/vitest-setup.js"],
      projects: [jsDomProject, nodeProject],
    },
    maxWorkers: 15,
  };
});

export default myConfig;
