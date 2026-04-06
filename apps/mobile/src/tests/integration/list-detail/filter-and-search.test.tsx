import { ListDetailContent } from "../../../../app/(tabs)/lists/[id]";
import { createItem, createList, TEST_USER } from "../../helpers/data";
import {
	act,
	fireEvent,
	mockApiClient,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

const LIST_ID = "list-1";

function setupMocks() {
	const list = createList({
		id: LIST_ID,
		name: "Zakupy",
		authorId: TEST_USER.id,
	});

	const items = [
		createItem(LIST_ID, {
			id: "item-1",
			title: "Mleko",
			isCompleted: false,
			position: 0,
			categoryId: "cat-1",
			categoryType: "user",
			categoryName: "Nabiał",
		}),
		createItem(LIST_ID, {
			id: "item-2",
			title: "Chleb",
			isCompleted: false,
			position: 1,
		}),
		createItem(LIST_ID, {
			id: "item-3",
			title: "Jajka",
			isCompleted: true,
			position: 2,
			categoryId: "cat-1",
			categoryType: "user",
			categoryName: "Nabiał",
		}),
		createItem(LIST_ID, {
			id: "item-4",
			title: "Ser",
			isCompleted: true,
			position: 3,
		}),
		createItem(LIST_ID, {
			id: "item-5",
			title: "Masło",
			deletedAt: new Date("2024-06-01"),
			position: 4,
		}),
		createItem(LIST_ID, {
			id: "item-6",
			title: "Bułki",
			deletedAt: new Date("2024-06-01"),
			position: 5,
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
			return Promise.resolve({ data: { items } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/categories`)) {
			return Promise.resolve({ data: { categories: [] } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/shares`)) {
			return Promise.resolve({ data: { shares: [], author: TEST_USER } });
		}
		return Promise.resolve({ data: {} });
	});

	return { items };
}

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers();
});

afterEach(() => {
	jest.useRealTimers();
});

describe("Filter and search", () => {
	it("shows pending items by default (all filter)", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
			expect(screen.getByText("Chleb")).toBeTruthy();
		});

		expect(screen.getByText("Ukończone (2)")).toBeTruthy();
		expect(screen.getByText("Usunięte (2)")).toBeTruthy();
	});

	it("toggles search and filters by title", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const searchIcons = screen.getAllByText("Search");
		fireEvent.press(searchIcons[0]);

		// Search input should appear
		await waitFor(() => {
			expect(screen.getByPlaceholderText("Szukaj elementów...")).toBeTruthy();
		});

		const searchInput = screen.getByPlaceholderText("Szukaj elementów...");
		fireEvent.changeText(searchInput, "Mle");

		await act(() => {
			jest.advanceTimersByTime(300);
		});

		await waitFor(() => {
			expect(screen.queryByText("Chleb")).toBeNull();
		});
	});

	it("shows empty state when search has no results", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const searchIcons = screen.getAllByText("Search");
		fireEvent.press(searchIcons[0]);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Szukaj elementów...")).toBeTruthy();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText("Szukaj elementów..."),
			"xyz",
		);

		await act(() => {
			jest.advanceTimersByTime(300);
		});

		await waitFor(() => {
			expect(screen.getByText(/Brak wyników dla/)).toBeTruthy();
		});
	});

	it("clears search when X is pressed", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const searchIcons = screen.getAllByText("Search");
		fireEvent.press(searchIcons[0]);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Szukaj elementów...")).toBeTruthy();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText("Szukaj elementów..."),
			"Mle",
		);

		await act(() => {
			jest.advanceTimersByTime(300);
		});

		await waitFor(() => {
			expect(screen.queryByText("Chleb")).toBeNull();
		});

		const xInSearch = screen.getAllByText("X");
		fireEvent.press(xInSearch[0]);

		await act(() => {
			jest.advanceTimersByTime(300);
		});

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
			expect(screen.getByText("Chleb")).toBeTruthy();
		});
	});
});
