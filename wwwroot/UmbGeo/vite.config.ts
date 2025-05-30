import { defineConfig } from "vite";

export default defineConfig(({ command} ) => {
  const buildMode = process.env.build_mode?.trim();

  return {
    build: {
      lib: {
        entry: "src/umb-geo.ts", // Property file
        formats: ["es"],
        fileName: "umb-geo",
      },
      outDir: "dist", // your web component will be saved in this location
      sourcemap: buildMode == 'development' ? true : false,
      rollupOptions: {
        external: [/^@umbraco/],
      },
    },
  }
});
