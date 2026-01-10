// @ts-nocheck
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import * as mf from "@module-federation/rsbuild-plugin";

const moduleFederation =
  (mf as any).moduleFederationPlugin ??
  (mf as any).pluginModuleFederation ??
  (mf as any).default;

const BASE = process.env.ASSET_PREFIX ?? "auto";

export default defineConfig({
  output: {
    assetPrefix: BASE,
  },
  plugins: [
    pluginReact(),
    moduleFederation({
      name: "remoteReport",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.tsx",
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        "react-dom": { singleton: true, requiredVersion: false },
      },
    }),
  ],
  source: {
    entry: {
      index: "./src/index.ts",
    },
  },
  html: {
    template: "./index.html",
  },
  server: {
    host: "127.0.0.1",
    port: 5175,
    historyApiFallback: true,
    proxy: {
      "/api/v1": {
        target: "http://localhost:80",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
