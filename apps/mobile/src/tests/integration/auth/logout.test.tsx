import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react-native";
import type React from "react";
import { AuthProvider } from "@/contexts/auth.context";
import { ThemeProvider } from "@/contexts/theme.context";
import ProfileScreen from "../../../../app/(tabs)/profile";
import { TEST_USER } from "../../helpers/data";
import {
	createTestQueryClient,
	fireEvent,
	mockApiClient,
	mockRouter,
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

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Logout", () => {
	it("shows logout button on profile screen", async () => {
		setupMocks();

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Wyloguj")).toBeTruthy();
		});
	});

	it("opens confirmation dialog when pressing logout button", async () => {
		setupMocks();

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Wyloguj")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Wyloguj"));

		await waitFor(() => {
			expect(screen.getByText("Wylogowanie")).toBeTruthy();
			expect(
				screen.getByText("Czy na pewno chcesz się wylogować?"),
			).toBeTruthy();
		});
	});

	it("logs out and navigates to login on confirmation", async () => {
		setupMocks();
		mockApiClient.post.mockResolvedValueOnce({ data: {} });

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Wyloguj")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Wyloguj"));

		await waitFor(() => {
			expect(screen.getByText("Wylogowanie")).toBeTruthy();
		});

		const dialogButtons = screen.getAllByText("Wyloguj");
		const confirmButton = dialogButtons[dialogButtons.length - 1];
		fireEvent.press(confirmButton);

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/login");
		});
	});

	it("closes dialog when pressing cancel", async () => {
		setupMocks();

		renderWithTheme(<ProfileScreen />);

		await waitFor(() => {
			expect(screen.getByText("Wyloguj")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Wyloguj"));

		await waitFor(() => {
			expect(screen.getByText("Wylogowanie")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Anuluj"));

		await waitFor(() => {
			expect(screen.queryByText("Wylogowanie")).toBeNull();
		});

		expect(mockApiClient.post).not.toHaveBeenCalled();
	});
});
