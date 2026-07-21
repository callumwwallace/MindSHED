import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
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
