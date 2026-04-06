import LoginScreen from "../../../../app/(auth)/login";
import { TEST_USER } from "../../helpers/data";
import {
	fireEvent,
	mockApiClient,
	mockRouter,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

function setupSuccessfulLogin() {
	mockApiClient.post.mockResolvedValueOnce({
		data: {
			accessToken: "test-access-token",
			refreshToken: "test-refresh-token",
		},
	});

	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		return Promise.resolve({ data: {} });
	});
}

function getSubmitButton() {
	const buttons = screen.getAllByText("Zaloguj się");
	return buttons[buttons.length - 1];
}

async function fillAndSubmitLogin(login: string, password: string) {
	const loginInput = screen.getByPlaceholderText("jankowalski");
	const passwordInput = screen.getByPlaceholderText("Wprowadź swoje hasło");

	fireEvent.changeText(loginInput, login);
	fireEvent.changeText(passwordInput, password);

	fireEvent.press(getSubmitButton());
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Login", () => {
	it("renders login form with title and subtitle", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<LoginScreen />);

		expect(screen.getAllByText("Zaloguj się").length).toBeGreaterThan(0);
		expect(
			screen.getByText("Wprowadź swoje dane, aby się zalogować"),
		).toBeTruthy();
	});

	it("shows login and password input fields", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<LoginScreen />);

		expect(screen.getByPlaceholderText("jankowalski")).toBeTruthy();
		expect(screen.getByPlaceholderText("Wprowadź swoje hasło")).toBeTruthy();
		expect(screen.getByText("Login")).toBeTruthy();
		expect(screen.getByText("Hasło")).toBeTruthy();
	});

	it("logs in successfully and navigates to lists", async () => {
		setupSuccessfulLogin();

		renderWithProviders(<LoginScreen />);

		await fillAndSubmitLogin("testuser", "password123");

		await waitFor(() => {
			expect(mockApiClient.post).toHaveBeenCalledWith("/api/auth/login", {
				login: "testuser",
				password: "password123",
			});
		});

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/lists");
		});
	});

	it("shows server error message on login failure", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		const axiosError = {
			response: {
				status: 401,
				data: {
					error: { message: "Nieprawidłowy login lub hasło" },
				},
			},
		};
		mockApiClient.post.mockRejectedValueOnce(axiosError);

		renderWithProviders(<LoginScreen />);

		await fillAndSubmitLogin("wrong", "wrong123");

		await waitFor(() => {
			expect(screen.getByText("Nieprawidłowy login lub hasło")).toBeTruthy();
		});
	});

	it("shows connection error when server is unreachable", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		const axiosError = {
			request: {},
			response: undefined,
		};
		mockApiClient.post.mockRejectedValueOnce(axiosError);

		renderWithProviders(<LoginScreen />);

		await fillAndSubmitLogin("testuser", "password123");

		await waitFor(() => {
			expect(
				screen.getByText(
					"Nie można połączyć się z serwerem. Sprawdź połączenie.",
				),
			).toBeTruthy();
		});
	});

	it("shows validation error when login is empty", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<LoginScreen />);

		fireEvent.press(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText("Login jest wymagany")).toBeTruthy();
		});
	});

	it("shows validation error when password is empty", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<LoginScreen />);

		const loginInput = screen.getByPlaceholderText("jankowalski");
		fireEvent.changeText(loginInput, "testuser");

		fireEvent.press(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText("Hasło jest wymagane")).toBeTruthy();
		});
	});

	it("navigates to register page", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<LoginScreen />);

		fireEvent.press(screen.getByText("Zarejestruj się"));

		expect(mockRouter.push).toHaveBeenCalledWith("/(auth)/register");
	});

	it("shows password toggle button", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<LoginScreen />);

		expect(screen.getByLabelText("Pokaż hasło")).toBeTruthy();
	});

	it("toggles password visibility", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<LoginScreen />);

		const toggleButton = screen.getByLabelText("Pokaż hasło");
		fireEvent.press(toggleButton);

		expect(screen.getByLabelText("Ukryj hasło")).toBeTruthy();
	});
});
