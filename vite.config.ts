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
      host: "0.0.0.0",
      strictPort: true,
      allowedHosts: ["sistema.prod.dev.br"],
      proxy: {
        // Redireciona requisições para '/api-cnpj' para a ReceitaWS
        "/api-cnpj": {
          target: "https://receitaws.com.br/v1",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api-cnpj/, ""),
        },
      },
    },
    assetsInclude: ["**/*.jpg", "**/*.png"],
  };
});
