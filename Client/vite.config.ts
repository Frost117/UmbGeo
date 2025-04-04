import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/umb-geo.ts", // Property file
      formats: ["es"],
      fileName: "umb-geo",
    },
    outDir: "../wwwroot/App_Plugins/UmbGeo", // your web component will be saved in this location
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
});
