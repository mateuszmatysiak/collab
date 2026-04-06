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

describe("Search categories", () => {
	it("shows search input", async () => {
		setupMocks();

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Szukaj kategorii...")).toBeTruthy();
		});
	});

	it("filters categories by name", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy spożywcze" }),
			createUserCategory({ name: "Dom i ogród" }),
			createUserCategory({ name: "Zakupy online" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy spożywcze")).toBeTruthy();
			expect(screen.getByText("Dom i ogród")).toBeTruthy();
			expect(screen.getByText("Zakupy online")).toBeTruthy();
		});

		const searchInput = screen.getByPlaceholderText("Szukaj kategorii...");
		fireEvent.changeText(searchInput, "Zakupy");

		await waitFor(() => {
			expect(screen.getByText("Zakupy spożywcze")).toBeTruthy();
			expect(screen.getByText("Zakupy online")).toBeTruthy();
			expect(screen.queryByText("Dom i ogród")).toBeNull();
		});
	});

	it("shows empty grid when no categories match search", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy" }),
			createUserCategory({ name: "Dom" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		const searchInput = screen.getByPlaceholderText("Szukaj kategorii...");
		fireEvent.changeText(searchInput, "Nieistniejąca");

		await waitFor(() => {
			expect(screen.queryByText("Zakupy")).toBeNull();
			expect(screen.queryByText("Dom")).toBeNull();
		});

		expect(screen.getByText("Dodaj kategorię")).toBeTruthy();
	});

	it("shows all categories after clearing search", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy" }),
			createUserCategory({ name: "Dom" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
			expect(screen.getByText("Dom")).toBeTruthy();
		});

		const searchInput = screen.getByPlaceholderText("Szukaj kategorii...");
		fireEvent.changeText(searchInput, "Zakupy");

		await waitFor(() => {
			expect(screen.queryByText("Dom")).toBeNull();
		});

		fireEvent.changeText(searchInput, "");

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
			expect(screen.getByText("Dom")).toBeTruthy();
		});
	});
});
