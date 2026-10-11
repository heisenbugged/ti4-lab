import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      // server.ts owns the HTTP server (socket.io, /health, /metrics) and runs
      // Vite in middleware mode, so Start has to install its SSR middleware there.
      vite: { installDevServerMiddleware: true },
      router: { quoteStyle: "double", semicolons: true },
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    warmup: {
      clientFiles: [
        "./src/routes/__root.tsx",
        "./src/routes/draft/prechoice/**/*.tsx",
        "./src/routes/draft/new/**/*.tsx",
        "./src/routes/draft/$id/**/*.tsx",
      ],
    },
  },
});
