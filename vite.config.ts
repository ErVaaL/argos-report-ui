import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte(),
    federation({
      name: "remoteReport",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.svelte",
      },
      shared: ["svelte"],
    }),
  ],
  build: { target: "esnext" },
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: true,
  },
});
