import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	cleanup,
	type RenderOptions,
	render,
} from "@testing-library/react-native";
import { router } from "expo-router";
import type React from "react";
import { apiClient } from "@/api/client";

export const mockApiClient = apiClient as unknown as {
	get: jest.Mock;
	post: jest.Mock;
	patch: jest.Mock;
	put: jest.Mock;
	delete: jest.Mock;
};

export const mockRouter = router as unknown as {
	push: jest.Mock;
	back: jest.Mock;
	replace: jest.Mock;
	navigate: jest.Mock;
};

const activeQueryClients: QueryClient[] = [];

afterEach(async () => {
	await act(() => {
		jest.runOnlyPendingTimers();
	});

	cleanup();

	for (const client of activeQueryClients) {
		client.cancelQueries();
		client.clear();
		client.unmount();
	}
	activeQueryClients.length = 0;
});

export function createTestQueryClient() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: 0, gcTime: 0 },
			mutations: { retry: false },
		},
	});

	activeQueryClients.push(queryClient);

	return queryClient;
}

interface TestWrapperOptions {
	queryClient?: QueryClient;
}

function createTestWrapper(options: TestWrapperOptions = {}) {
	const queryClient = options.queryClient ?? createTestQueryClient();

	return function TestWrapper({ children }: { children: React.ReactNode }) {
		const { AuthProvider } = require("@/contexts/auth.context");

		return (
			<QueryClientProvider client={queryClient}>
				<AuthProvider>{children}</AuthProvider>
			</QueryClientProvider>
		);
	};
}

export function renderWithProviders(
	ui: React.ReactElement,
	options?: Omit<RenderOptions, "wrapper"> & TestWrapperOptions,
) {
	const { queryClient, ...renderOptions } = options ?? {};

	const testQueryClient = queryClient ?? createTestQueryClient();

	const Wrapper = createTestWrapper({ queryClient: testQueryClient });

	return {
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
		queryClient: testQueryClient,
	};
}

export {
	act,
	fireEvent,
	screen,
	waitFor,
} from "@testing-library/react-native";
