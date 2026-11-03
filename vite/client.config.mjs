import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import commonjs from "vite-plugin-commonjs";
import * as path from "path";
import config from "config";
import dotenv from "dotenv";
import graphqlLoader from "vite-plugin-graphql-loader";

const DEV_PORT = config.get("viteDevServer.port");
const PROXY_HOST = config.get("server.apiHost");
const SSL_ENABLED = `${config.get("server.sslEnabled")}`.trim() === "true";
const HTTP = SSL_ENABLED ? "https" : "http";

dotenv.config();

export default defineConfig(() => {
  return {
    root: ".",
    appType: "spa",
    server: {
      host: "0.0.0.0",
      port: DEV_PORT,
      strictPort: true,
      cors: true,
      origin: "",
      proxy: {
        "/graphql": `${HTTP}://${PROXY_HOST}`,
        "^/graphql/.*": `${HTTP}://${PROXY_HOST}`,
        "/graphiql": `${HTTP}://${PROXY_HOST}`,
        "^/graphiql/.*": `${HTTP}://${PROXY_HOST}`,
        "^/auth/.*": `${HTTP}://${PROXY_HOST}`,
        "^/arena/.*": `${HTTP}://${PROXY_HOST}`,
        "^/api/.*": `${HTTP}://${PROXY_HOST}`,
        "^/socket.io/.*": `${HTTP}://${PROXY_HOST}`,
        "/metrics": `${HTTP}://${PROXY_HOST}`,
        "^/metrics/.*": `${HTTP}://${PROXY_HOST}`,
      },
    },
    optimizeDeps: {
      exclude: [],
      force: true,
    },
    build: {
      path: path.resolve(__dirname, "../dist"),
      outDir: "./dist/",
      emptyOutDir: false,
    },
    publicDir: false,
    assetsInclude: ["**/*.webm"],
    plugins: [
      react({
        include: "**/*.{jsx,tsx}",
      }),
      commonjs(),
      tsconfigPaths(),
      graphqlLoader(),
    ],

    // Define environment variables in the client to instrument behavior.
    // Note that when vite uses this config on DevOps it will NOT have access to the same environment variables as the Node server running on the deployed endpoint.
    // Therefore, this configuration CANNOT be used to provide client components with direct access to server side environment variables.
    // Instead, limit these definitions to static content or to settings used during development or testing.
    // If necessary, you can set ENV layers in the docker/deployment/prod/Dockerfile that will get picked up by yarn build when the deployed image is built.
    define: {
      // Allow switching on NODE_ENV in client code
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),

      // Special login component when using local auth
      "process.env.AUTH_LOCAL": JSON.stringify(process.env.AUTH_LOCAL),

      // Display a different look depending on which endpoint the app is running from
      "process.env.APP_ENDPOINT": JSON.stringify(process.env.APP_ENDPOINT),

      // Tell the client if we are in end to end testing mode
      "process.env.E2E_MODE": JSON.stringify(process.env.E2E_MODE),

      // The HTTP port the app is bound to
      "process.env.PORT": JSON.stringify(process.env.PORT),

      // Used for web sockets
      "process.env.SSL_ENABLED": JSON.stringify(SSL_ENABLED),

      // DataGrid license
      "process.env.DATA_GRID_LICENSE_KEY": JSON.stringify(config.get("dataGridLicenseKey")),

      // Read Only Mode
      "process.env.READ_ONLY_MODE": JSON.stringify(process.env.READ_ONLY_MODE),
    },
  };
});
