require("react-native-reanimated/mock"); // Must be first to work properly

jest.useFakeTimers();

process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000";

const mockSecureStore = new Map();

jest.mock("expo-secure-store", () => ({
	getItemAsync: jest.fn((key) =>
		Promise.resolve(mockSecureStore.get(key) ?? null),
	),
	setItemAsync: jest.fn((key, value) => {
		mockSecureStore.set(key, value);
		return Promise.resolve();
	}),
	deleteItemAsync: jest.fn((key) => {
		mockSecureStore.delete(key);
		return Promise.resolve();
	}),
}));

jest.mock("@/api/client", () => ({
	apiClient: {
		get: jest.fn().mockResolvedValue({ data: {} }),
		post: jest.fn().mockResolvedValue({ data: {} }),
		patch: jest.fn().mockResolvedValue({ data: {} }),
		put: jest.fn().mockResolvedValue({ data: {} }),
		delete: jest.fn().mockResolvedValue({ data: {} }),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	},
}));

const mockRouter = {
	push: jest.fn(),
	back: jest.fn(),
	replace: jest.fn(),
	navigate: jest.fn(),
};

jest.mock("expo-router", () => ({
	router: mockRouter,
	useRouter: () => mockRouter,
	useLocalSearchParams: jest.fn(() => ({})),
	usePathname: jest.fn(() => "/"),
	Slot: ({ children }) => children,
	Link: ({ children }) => children,
}));

jest.mock("nativewind", () => ({
	colorScheme: { set: jest.fn(), get: jest.fn(() => "light") },
	vars: jest.fn(() => ({})),
	styled: (component) => component,
	cssInterop: jest.fn(() => (component) => component),
	remapProps: jest.fn(() => (component) => component),
}));

jest.mock("@react-navigation/native", () => ({
	DarkTheme: { dark: true, colors: {} },
	DefaultTheme: { dark: false, colors: {} },
	ThemeProvider: ({ children }) => children,
}));

jest.mock("react-native-screens", () => ({
	FullWindowOverlay: ({ children }) => children,
	enableScreens: jest.fn(),
}));

jest.mock("react-native-draglist", () => {
	const { FlatList } = require("react-native");
	const React = require("react");
	return {
		__esModule: true,
		default: React.forwardRef((props, ref) =>
			React.createElement(FlatList, { ...props, ref }),
		),
	};
});

jest.mock("@rn-primitives/portal", () => {
	const React = require("react");
	const { View } = require("react-native");
	return {
		Portal: ({ children }) => React.createElement(View, null, children),
		PortalHost: () => null,
	};
});

jest.mock("lucide-react-native", () => {
	const React = require("react");
	const { Text } = require("react-native");
	return new Proxy(
		{},
		{
			get: (_target, name) => {
				if (typeof name !== "string") return undefined;
				return React.forwardRef((props, ref) =>
					React.createElement(Text, { ref, ...props }, name),
				);
			},
		},
	);
});
