import RegisterScreen from "../../../../app/(auth)/register";
import { TEST_USER } from "../../helpers/data";
import {
	fireEvent,
	mockApiClient,
	mockRouter,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

function setupSuccessfulRegister() {
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
	const buttons = screen.getAllByText("Zarejestruj się");
	return buttons[buttons.length - 1];
}

async function fillAndSubmitRegister(
	name: string,
	login: string,
	password: string,
) {
	const nameInput = screen.getByPlaceholderText("Jan Kowalski");
	const loginInput = screen.getByPlaceholderText("jankowalski");
	const passwordInput = screen.getByPlaceholderText("Wprowadź swoje hasło");

	fireEvent.changeText(nameInput, name);
	fireEvent.changeText(loginInput, login);
	fireEvent.changeText(passwordInput, password);

	fireEvent.press(getSubmitButton());
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Register", () => {
	it("renders registration form with title and subtitle", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		expect(screen.getAllByText("Zarejestruj się").length).toBeGreaterThan(0);
		expect(screen.getByText("Utwórz konto, aby rozpocząć")).toBeTruthy();
	});

	it("shows name, login and password input fields", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		expect(screen.getByPlaceholderText("Jan Kowalski")).toBeTruthy();
		expect(screen.getByPlaceholderText("jankowalski")).toBeTruthy();
		expect(screen.getByPlaceholderText("Wprowadź swoje hasło")).toBeTruthy();
		expect(screen.getByText("Imię i nazwisko")).toBeTruthy();
		expect(screen.getByText("Login")).toBeTruthy();
		expect(screen.getByText("Hasło")).toBeTruthy();
	});

	it("registers successfully and navigates to lists", async () => {
		setupSuccessfulRegister();

		renderWithProviders(<RegisterScreen />);

		await fillAndSubmitRegister("Jan Kowalski", "jankowalski", "password123");

		await waitFor(() => {
			expect(mockApiClient.post).toHaveBeenCalledWith("/api/auth/register", {
				name: "Jan Kowalski",
				login: "jankowalski",
				password: "password123",
			});
		});

		await waitFor(() => {
			expect(mockRouter.replace).toHaveBeenCalledWith("/(tabs)/lists");
		});
	});

	it("shows server error message on registration failure", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		const axiosError = {
			response: {
				status: 409,
				data: {
					error: { message: "Użytkownik o takim loginie już istnieje" },
				},
			},
		};
		mockApiClient.post.mockRejectedValueOnce(axiosError);

		renderWithProviders(<RegisterScreen />);

		await fillAndSubmitRegister("Jan Kowalski", "jankowalski", "password123");

		await waitFor(() => {
			expect(
				screen.getByText("Użytkownik o takim loginie już istnieje"),
			).toBeTruthy();
		});
	});

	it("shows generic error when no server response", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		const axiosError = {
			response: undefined,
		};
		mockApiClient.post.mockRejectedValueOnce(axiosError);

		renderWithProviders(<RegisterScreen />);

		await fillAndSubmitRegister("Jan Kowalski", "jankowalski", "password123");

		await waitFor(() => {
			expect(
				screen.getByText("Nastąpił błąd podczas rejestracji"),
			).toBeTruthy();
		});
	});

	it("shows validation error when name is empty", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		fireEvent.press(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText("Imię i nazwisko jest wymagane")).toBeTruthy();
		});
	});

	it("shows validation error when login is empty", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		const nameInput = screen.getByPlaceholderText("Jan Kowalski");
		fireEvent.changeText(nameInput, "Jan Kowalski");

		fireEvent.press(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText("Login jest wymagany")).toBeTruthy();
		});
	});

	it("shows validation error when password is too short", async () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		const nameInput = screen.getByPlaceholderText("Jan Kowalski");
		const loginInput = screen.getByPlaceholderText("jankowalski");
		const passwordInput = screen.getByPlaceholderText("Wprowadź swoje hasło");

		fireEvent.changeText(nameInput, "Jan Kowalski");
		fireEvent.changeText(loginInput, "jankowalski");
		fireEvent.changeText(passwordInput, "abc");

		fireEvent.press(getSubmitButton());

		await waitFor(() => {
			expect(screen.getByText("Hasło musi mieć minimum 6 znaków")).toBeTruthy();
		});
	});

	it("navigates to login page", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		fireEvent.press(screen.getByText("Zaloguj się"));

		expect(mockRouter.push).toHaveBeenCalledWith("/(auth)/login");
	});

	it("shows password toggle button", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		expect(screen.getByLabelText("Pokaż hasło")).toBeTruthy();
	});

	it("toggles password visibility", () => {
		mockApiClient.get.mockResolvedValue({ data: {} });

		renderWithProviders(<RegisterScreen />);

		const toggleButton = screen.getByLabelText("Pokaż hasło");
		fireEvent.press(toggleButton);

		expect(screen.getByLabelText("Ukryj hasło")).toBeTruthy();
	});
});
