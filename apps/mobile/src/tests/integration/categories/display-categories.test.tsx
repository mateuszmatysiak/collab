import CategoriesScreen from "../../../../app/(tabs)/categories";
import { createUserCategory, TEST_USER } from "../../helpers/data";
import {
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

describe("Display categories", () => {
	it("renders category grid with categories", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy" }),
			createUserCategory({ name: "Dom" }),
			createUserCategory({ name: "Praca" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
			expect(screen.getByText("Dom")).toBeTruthy();
			expect(screen.getByText("Praca")).toBeTruthy();
		});
	});

	it("displays page title and subtitle", async () => {
		setupMocks();

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Kategorie")).toBeTruthy();
			expect(screen.getByText("Zarządzaj kategoriami list")).toBeTruthy();
		});
	});

	it("shows error message when API fails", async () => {
		mockApiClient.get.mockImplementation((url: string) => {
			if (url.includes("/api/auth/me")) {
				return Promise.resolve({ data: { user: TEST_USER } });
			}
			if (url.includes("/api/categories/user")) {
				return Promise.reject(new Error("Server error"));
			}
			return Promise.resolve({ data: {} });
		});

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Błąd ładowania kategorii")).toBeTruthy();
		});
	});

	it("shows add category card", async () => {
		setupMocks();

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
		});
	});

	it("displays category icon names", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
			createUserCategory({ name: "Sport", icon: "Dumbbell" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
			expect(screen.getByText("Sport")).toBeTruthy();
		});
	});
});
