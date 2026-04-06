import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import type React from "react";
import { AuthProvider } from "@/contexts/auth.context";
import { ThemeProvider } from "@/contexts/theme.context";
import ProfileScreen from "../../../../app/(tabs)/profile";
import { TEST_USER } from "../../helpers/data";
import {
	act,
	createTestQueryClient,
	fireEvent,
	mockApiClient,
	screen,
	waitFor,
} from "../../helpers/test-utils";

function renderWithTheme(ui: React.ReactElement) {
	const queryClient = createTestQueryClient();

	return render(ui, {
		wrapper: ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<ThemeProvider>{children}</ThemeProvider>
				</AuthProvider>
			</QueryClientProvider>
		),
	});
}

function setupMocks() {
	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url.includes("/api/lists")) {
			return Promise.resolve({ data: { lists: [] } });
		}
		return Promise.resolve({ data: {} });
	});
}

beforeEach(async () => {
	jest.clearAllMocks();
	await SecureStore.deleteItemAsync("theme");
});

describe("Theme toggle", () => {
	it("shows dark mode switch with 'Wyłączony' by default (light theme)", async () => {
		setupMocks();

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Tryb ciemny")).toBeTruthy();
			expect(screen.getByText("Wyłączony")).toBeTruthy();
		});
	});

	it("toggles from light to dark theme", async () => {
		setupMocks();

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Wyłączony")).toBeTruthy();
		});

		const switchElement = screen.getByRole("switch");
		expect(switchElement.props.value).toBe(false);

		await act(() => {
			fireEvent(switchElement, "valueChange", true);
		});

		await waitFor(() => {
			expect(screen.getByText("Włączony")).toBeTruthy();
		});
	});

	it("toggles from dark back to light theme", async () => {
		await SecureStore.setItemAsync("theme", "dark");

		setupMocks();

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Włączony")).toBeTruthy();
		});

		const switchElement = screen.getByRole("switch");
		expect(switchElement.props.value).toBe(true);

		await act(() => {
			fireEvent(switchElement, "valueChange", false);
		});

		await waitFor(() => {
			expect(screen.getByText("Wyłączony")).toBeTruthy();
		});
	});

	it("persists theme to SecureStore", async () => {
		setupMocks();

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Wyłączony")).toBeTruthy();
		});

		const switchElement = screen.getByRole("switch");

		await act(() => {
			fireEvent(switchElement, "valueChange", true);
		});

		await waitFor(() => {
			expect(screen.getByText("Włączony")).toBeTruthy();
		});

		const storedTheme = await SecureStore.getItemAsync("theme");
		expect(storedTheme).toBe("dark");
	});
});
