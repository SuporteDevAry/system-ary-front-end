import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env": JSON.stringify(env),
    },
    plugins: [react()],
    server: {
      port: 8000, // definir a porta para 8080
    },
  };
});
