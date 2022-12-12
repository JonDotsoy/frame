import { mergeConfig } from "vite"
import { configDefaults, defineConfig } from "vitest/config"

export default mergeConfig(
  configDefaults,
  defineConfig({
    test: {
      testTimeout: 30_000,
    },
  })
)
