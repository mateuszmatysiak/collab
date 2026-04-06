import { Alert } from "react-native";
import CategoriesScreen from "../../../../app/(tabs)/categories";
import { createUserCategory, TEST_USER } from "../../helpers/data";
import {
	fireEvent,
	mockApiClient,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

function setupMocks(categories: ReturnType<typeof createUserCategory>[] = []) {
	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url.includes("/api/categories/user")) {
			return Promise.resolve({ data: { categories } });
		}
		return Promise.resolve({ data: {} });
	});

	return { categories };
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Add category", () => {
	it("opens add dialog when pressing add card", async () => {
		setupMocks();

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Dodaj kategorię"));

		await waitFor(() => {
			expect(screen.getByText("Nowa kategoria")).toBeTruthy();
			expect(
				screen.getByText("Utwórz własną kategorię w swoim słowniku."),
			).toBeTruthy();
		});
	});

	it("allows entering category name", async () => {
		setupMocks();

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Dodaj kategorię"));

		await waitFor(() => {
			expect(screen.getByPlaceholderText("np. Artykuły biurowe")).toBeTruthy();
		});

		const nameInput = screen.getByPlaceholderText("np. Artykuły biurowe");
		fireEvent.changeText(nameInput, "Nowa kategoria testowa");

		expect(nameInput.props.value).toBe("Nowa kategoria testowa");
	});

	it("creates category with name and icon via API", async () => {
		setupMocks();

		const newCategory = createUserCategory({
			id: "new-cat-1",
			name: "Elektronika",
			icon: "ShoppingCart",
		});

		mockApiClient.post.mockResolvedValueOnce({
			data: { category: newCategory },
		});

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Dodaj kategorię"));

		await waitFor(() => {
			expect(screen.getByPlaceholderText("np. Artykuły biurowe")).toBeTruthy();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText("np. Artykuły biurowe"),
			"Elektronika",
		);

		fireEvent.press(screen.getByText("Utwórz"));

		await waitFor(() => {
			expect(mockApiClient.post).toHaveBeenCalledWith(
				"/api/categories/user",
				expect.objectContaining({
					name: "Elektronika",
					icon: "ShoppingCart",
				}),
			);
		});
	});

	it("does not call API when name is empty or whitespace", async () => {
		setupMocks();

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Dodaj kategorię"));

		await waitFor(() => {
			expect(screen.getByPlaceholderText("np. Artykuły biurowe")).toBeTruthy();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText("np. Artykuły biurowe"),
			"   ",
		);

		fireEvent.press(screen.getByText("Utwórz"));

		expect(mockApiClient.post).not.toHaveBeenCalled();
	});

	it("resets form after successful creation", async () => {
		setupMocks();

		const newCategory = createUserCategory({
			id: "new-cat-2",
			name: "Sport",
			icon: "ShoppingCart",
		});

		mockApiClient.post.mockResolvedValueOnce({
			data: { category: newCategory },
		});

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Dodaj kategorię"));

		await waitFor(() => {
			expect(screen.getByPlaceholderText("np. Artykuły biurowe")).toBeTruthy();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText("np. Artykuły biurowe"),
			"Sport",
		);

		fireEvent.press(screen.getByText("Utwórz"));

		await waitFor(() => {
			expect(mockApiClient.post).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(screen.queryByText("Nowa kategoria")).toBeNull();
		});
	});

	it("shows error alert on creation failure", async () => {
		setupMocks();

		mockApiClient.post.mockRejectedValueOnce(new Error("Server error"));

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Dodaj kategorię"));

		await waitFor(() => {
			expect(screen.getByPlaceholderText("np. Artykuły biurowe")).toBeTruthy();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText("np. Artykuły biurowe"),
			"Test",
		);

		fireEvent.press(screen.getByText("Utwórz"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Błąd",
				"Nie udało się utworzyć kategorii. Spróbuj ponownie.",
			);
		});
	});

	it("closes dialog on cancel", async () => {
		setupMocks();

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Dodaj kategorię"));

		await waitFor(() => {
			expect(screen.getByText("Nowa kategoria")).toBeTruthy();
		});

		const cancelButtons = screen.getAllByText("Anuluj");
		fireEvent.press(cancelButtons[0]);

		await waitFor(() => {
			expect(screen.queryByText("Nowa kategoria")).toBeNull();
		});
	});
});
