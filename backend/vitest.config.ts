import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "src/tests/api/**"],
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
