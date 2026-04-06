import { Text, View } from "react-native";
import { useAuth } from "@/contexts/auth.context";
import { TEST_USER } from "../../helpers/data";
import {
	mockApiClient,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

function AuthStatusDisplay() {
	const { user, isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<View>
				<Text>Ładowanie...</Text>
			</View>
		);
	}

	if (isAuthenticated && user) {
		return (
			<View>
				<Text>Zalogowany jako {user.name}</Text>
			</View>
		);
	}

	return (
		<View>
			<Text>Niezalogowany</Text>
		</View>
	);
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Session persistence", () => {
	it("keeps user logged in when access token is valid and /me returns user", async () => {
		mockApiClient.get.mockImplementation((url: string) => {
			if (url.includes("/api/auth/me")) {
				return Promise.resolve({ data: { user: TEST_USER } });
			}
			return Promise.resolve({ data: {} });
		});

		renderWithProviders(<AuthStatusDisplay />);

		await waitFor(() => {
			expect(
				screen.getByText(`Zalogowany jako ${TEST_USER.name}`),
			).toBeTruthy();
		});
	});

	it("shows unauthenticated state when /me fails (expired tokens)", async () => {
		mockApiClient.get.mockImplementation((url: string) => {
			if (url.includes("/api/auth/me")) {
				return Promise.reject({
					response: { status: 401, data: {} },
				});
			}
			return Promise.resolve({ data: {} });
		});

		renderWithProviders(<AuthStatusDisplay />);

		await waitFor(() => {
			expect(screen.getByText("Niezalogowany")).toBeTruthy();
		});
	});

	it("shows unauthenticated state when /me returns no user", async () => {
		mockApiClient.get.mockImplementation((url: string) => {
			if (url.includes("/api/auth/me")) {
				return Promise.resolve({ data: { user: null } });
			}
			return Promise.resolve({ data: {} });
		});

		renderWithProviders(<AuthStatusDisplay />);

		await waitFor(() => {
			expect(screen.getByText("Niezalogowany")).toBeTruthy();
		});
	});

	it("provides user data through auth context after successful auth check", async () => {
		mockApiClient.get.mockImplementation((url: string) => {
			if (url.includes("/api/auth/me")) {
				return Promise.resolve({
					data: {
						user: {
							...TEST_USER,
							name: "Mateusz Matysiak",
						},
					},
				});
			}
			return Promise.resolve({ data: {} });
		});

		renderWithProviders(<AuthStatusDisplay />);

		await waitFor(() => {
			expect(screen.getByText("Zalogowany jako Mateusz Matysiak")).toBeTruthy();
		});
	});
});
