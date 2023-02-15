// vite.config.js
import basicSsl from "@vitejs/plugin-basic-ssl";
import { resolve } from "path";

export default {
  plugins: [basicSsl()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        home: resolve(__dirname, "/src/pages/index.html"),
        404: resolve(__dirname, "/src/pages/404.html"),
        cloud: resolve(__dirname, "/src/pages/cloudPage/index.html"),
        fox: resolve(__dirname, "/src/pages/foxPage/index.html"),
        lineDoge: resolve(__dirname, "/src/pages/lineDogePage/index.html"),
        cloudShader: resolve(__dirname, "/src/pages/cloudShader/index.html"),
      },
    },
  },
};
