import { defineConfig } from "vite";

export default defineConfig(({ command} ) => {
  const buildMode = process.env.build_mode?.trim();

  return {
    build: {
      lib: {
        entry: "src/umb-geo.ts", // Property file
        formats: ["es"],
      },
      outDir: "dist", // all compiled files will be placed here
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/], // ignore the Umbraco Backoffice package in the build
        }
    },
  }
});
