import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],

  // 🔥 IMPORTANT FOR /admin
  base: "",

  server: {
    port: 5173,
    strictPort: true,

    // 🔁 API PROXY (KEEP AS-IS)
    proxy: {
      "/server": {
        target: "https://catalogmakerpro.in",
        changeOrigin: true,
        secure: false,   // correct for HTTPS + self certs
        timeout: 60000,
      },
    },
  },
});
