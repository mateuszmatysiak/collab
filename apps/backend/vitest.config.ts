import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		globalSetup: ["./tests/global-setup.ts"],
		setupFiles: ["./tests/setup.ts"],
		environment: "node",

		fileParallelism: false,

		testTimeout: 30000,
		hookTimeout: 30000,

		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.ts"],
			exclude: ["src/index.ts", "src/types/**", "src/db/seed.ts"],
		},

		alias: {
			"@collab-list/shared": resolve(__dirname, "../../packages/shared/src"),
		},
	},
});
