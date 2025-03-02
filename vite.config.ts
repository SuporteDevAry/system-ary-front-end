import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const PORT = Number(process.env.REACT_PORT) || 3000;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env": JSON.stringify(env),
    },
    plugins: [react()],
    server: {
      port: PORT,
      allowedHosts: ["sistema.prod.dev.br"],
    },
    assetsInclude: ["**/*.jpg", "**/*.png"],
  };
});
