import { ListDetailContent } from "../../../../app/(tabs)/lists/[id]";
import {
	createCategory,
	createItem,
	createList,
	TEST_USER,
} from "../setup/mocks/data";
import {
	fireEvent,
	mockApiClient,
	renderWithProviders,
	screen,
	waitFor,
} from "../setup/test-utils";

const LIST_ID = "list-1";

function setupMocks() {
	const list = createList({
		id: LIST_ID,
		name: "Zakupy",
		authorId: TEST_USER.id,
	});

	const item = createItem(LIST_ID, {
		id: "item-1",
		title: "Mleko",
		position: 0,
	});

	const categories = [
		createCategory({ id: "cat-1", name: "Nabiał", icon: "Milk", type: "user" }),
		createCategory({
			id: "cat-2",
			name: "Pieczywo",
			icon: "Wheat",
			type: "user",
		}),
		createCategory({
			id: "cat-3",
			name: "Lokalna",
			icon: "Tag",
			type: "local",
			authorName: "Other User",
		}),
	];

	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url === `/api/lists/${LIST_ID}`) {
			return Promise.resolve({ data: { list } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/items`)) {
			return Promise.resolve({ data: { items: [item] } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/categories`)) {
			return Promise.resolve({ data: { categories } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/shares`)) {
			return Promise.resolve({ data: { shares: [], author: TEST_USER } });
		}
		if (url.includes("/api/categories/user")) {
			return Promise.resolve({ data: { categories: [] } });
		}
		return Promise.resolve({ data: {} });
	});

	mockApiClient.patch.mockResolvedValue({
		data: {
			item: { ...item, categoryId: "cat-1", categoryType: "user" },
		},
	});

	return { item, categories };
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Category assignment", () => {
	it("opens category dialog when category icon is pressed", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const banIcons = screen.getAllByText("Ban");

		fireEvent.press(banIcons[0]);

		await waitFor(() => {
			expect(screen.getByText("Wybierz kategorię")).toBeTruthy();
		});
	});

	it("shows existing categories in the dialog", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const banIcons = screen.getAllByText("Ban");
		fireEvent.press(banIcons[0]);

		await waitFor(() => {
			expect(screen.getByText("Nabiał")).toBeTruthy();
			expect(screen.getByText("Pieczywo")).toBeTruthy();
			expect(screen.getByText("Lokalna")).toBeTruthy();
		});
	});

	it("assigns category when selected", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const banIcons = screen.getAllByText("Ban");
		fireEvent.press(banIcons[0]);

		await waitFor(() => {
			expect(screen.getByText("Nabiał")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Nabiał"));

		await waitFor(() => {
			expect(mockApiClient.patch).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/item-1`,
				expect.objectContaining({
					categoryId: "cat-1",
					categoryType: "user",
				}),
			);
		});
	});

	it("removes category when 'Brak kategorii' is selected", async () => {
		const list = createList({
			id: LIST_ID,
			name: "Zakupy",
			authorId: TEST_USER.id,
		});
		const item = createItem(LIST_ID, {
			id: "item-1",
			title: "Mleko",
			position: 0,
			categoryId: "cat-1",
			categoryType: "user",
			categoryIcon: "Milk",
		});

		mockApiClient.get.mockImplementation((url: string) => {
			if (url.includes("/api/auth/me")) {
				return Promise.resolve({ data: { user: TEST_USER } });
			}
			if (url === `/api/lists/${LIST_ID}`) {
				return Promise.resolve({ data: { list } });
			}
			if (url.includes(`/api/lists/${LIST_ID}/items`)) {
				return Promise.resolve({ data: { items: [item] } });
			}
			if (url.includes(`/api/lists/${LIST_ID}/categories`)) {
				return Promise.resolve({
					data: {
						categories: [createCategory({ id: "cat-1", name: "Nabiał" })],
					},
				});
			}
			if (url.includes(`/api/lists/${LIST_ID}/shares`)) {
				return Promise.resolve({
					data: { shares: [], author: TEST_USER },
				});
			}
			if (url.includes("/api/categories/user")) {
				return Promise.resolve({ data: { categories: [] } });
			}
			return Promise.resolve({ data: {} });
		});

		mockApiClient.patch.mockResolvedValue({
			data: { item: { ...item, categoryId: null, categoryType: null } },
		});

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const milkIcons = screen.getAllByText("Milk");
		fireEvent.press(milkIcons[0]);

		await waitFor(() => {
			expect(screen.getByText("Brak kategorii")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Brak kategorii"));

		await waitFor(() => {
			expect(mockApiClient.patch).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/item-1`,
				expect.objectContaining({
					categoryId: null,
					categoryType: null,
				}),
			);
		});
	});
});
