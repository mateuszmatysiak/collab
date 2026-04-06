/** @type {import('jest').Config} */
module.exports = {
	preset: "jest-expo",
	rootDir: __dirname,
	setupFiles: ["./jest.setup.js"],
	setupFilesAfterEnv: ["./jest.setup.afterenv.js"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"^@/assets/(.*)$": "<rootDir>/assets/$1",
		"^@collab-list/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
	},
	transformIgnorePatterns: [
		"node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|nativewind|react-native-reanimated|@rn-primitives/.*|lucide-react-native|class-variance-authority|clsx|tailwind-merge|react-native-draglist|react-native-screens|react-native-safe-area-context|react-native-error-boundary|@tanstack/react-query|react-native-worklets)",
	],
	testMatch: ["<rootDir>/src/__tests__/**/*.test.tsx"],
	testTimeout: 15000,
};
