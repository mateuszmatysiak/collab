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

describe("Edit category", () => {
	it("opens edit dialog when pressing a category card", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByText("Edytuj kategorię")).toBeTruthy();
			expect(screen.getByText("Zmień nazwę lub ikonę kategorii.")).toBeTruthy();
		});
	});

	it("pre-fills form with current category data", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByText("Edytuj kategorię")).toBeTruthy();
		});

		const nameInput = screen.getByPlaceholderText("np. Artykuły biurowe");
		expect(nameInput.props.value).toBe("Zakupy");
	});

	it("saves updated category name via API", async () => {
		const category = createUserCategory({
			id: "cat-1",
			name: "Zakupy",
			icon: "ShoppingCart",
		});
		setupMocks([category]);

		mockApiClient.patch.mockResolvedValueOnce({
			data: { category: { ...category, name: "Zakupy spożywcze" } },
		});

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByText("Edytuj kategorię")).toBeTruthy();
		});

		const nameInput = screen.getByPlaceholderText("np. Artykuły biurowe");
		fireEvent.changeText(nameInput, "Zakupy spożywcze");

		fireEvent.press(screen.getByText("Zapisz"));

		await waitFor(() => {
			expect(mockApiClient.patch).toHaveBeenCalledWith(
				`/api/categories/${category.id}`,
				expect.objectContaining({
					name: "Zakupy spożywcze",
				}),
			);
		});
	});

	it("does not call API when name is cleared to empty", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByText("Edytuj kategorię")).toBeTruthy();
		});

		const nameInput = screen.getByPlaceholderText("np. Artykuły biurowe");
		fireEvent.changeText(nameInput, "   ");

		fireEvent.press(screen.getByText("Zapisz"));

		expect(mockApiClient.patch).not.toHaveBeenCalled();
	});

	it("shows error alert on update failure", async () => {
		const category = createUserCategory({
			id: "cat-1",
			name: "Zakupy",
			icon: "ShoppingCart",
		});
		setupMocks([category]);

		mockApiClient.patch.mockRejectedValueOnce(new Error("Server error"));

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByText("Edytuj kategorię")).toBeTruthy();
		});

		const nameInput = screen.getByPlaceholderText("np. Artykuły biurowe");
		fireEvent.changeText(nameInput, "Nowa nazwa");

		fireEvent.press(screen.getByText("Zapisz"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Błąd",
				"Nie udało się zaktualizować kategorii. Spróbuj ponownie.",
			);
		});
	});

	it("closes dialog on cancel without saving", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByText("Edytuj kategorię")).toBeTruthy();
		});

		const cancelButtons = screen.getAllByText("Anuluj");
		fireEvent.press(cancelButtons[0]);

		await waitFor(() => {
			expect(screen.queryByText("Edytuj kategorię")).toBeNull();
		});

		expect(mockApiClient.patch).not.toHaveBeenCalled();
	});
});
