import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      // expõe variáveis como texto no build; ajuste os nomes conforme usa no código
      "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        // se não estiver usando alias, pode até remover esse bloco
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
  };
});
