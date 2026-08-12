import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    migrate: "src/scripts/migrate-entry.ts",
    "seed-pilot-code": "src/scripts/seed-pilot-code-entry.ts",
    "run-data-lifecycle": "src/scripts/data-lifecycle-entry.ts",
  },
  format: ["cjs"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  // The production container contains only this audited artifact and Node. API
  // dependencies are bundled so mobile/build tooling cannot leak into runtime.
  noExternal: [/.*/],
});
