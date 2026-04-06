import { ListDetailContent } from "../../../../app/(tabs)/lists/[id]";
import { createItem, createList, TEST_USER } from "../setup/mocks/data";
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

	const pendingItems = [
		createItem(LIST_ID, { id: "p1", title: "Mleko", position: 0 }),
		createItem(LIST_ID, { id: "p2", title: "Chleb", position: 1 }),
		createItem(LIST_ID, { id: "p3", title: "Masło", position: 2 }),
	];

	const completedItems = [
		createItem(LIST_ID, {
			id: "c1",
			title: "Jajka",
			isCompleted: true,
			position: 3,
		}),
		createItem(LIST_ID, {
			id: "c2",
			title: "Ser",
			isCompleted: true,
			position: 4,
		}),
	];

	const deletedItems = [
		createItem(LIST_ID, {
			id: "d1",
			title: "Szynka",
			deletedAt: new Date("2024-06-01"),
			position: 5,
		}),
		createItem(LIST_ID, {
			id: "d2",
			title: "Bułki",
			deletedAt: new Date("2024-06-01"),
			position: 6,
		}),
	];

	const items = [...pendingItems, ...completedItems, ...deletedItems];

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

	return { list, items };
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Batch operations", () => {
	it("shows completed and deleted sections", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Ukończone (2)")).toBeTruthy();
			expect(screen.getByText("Usunięte (2)")).toBeTruthy();
		});
	});

	it("resets all completed items", async () => {
		setupMocks();
		mockApiClient.put.mockResolvedValue({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Ukończone (2)")).toBeTruthy();
		});

		const rotateIcons = screen.getAllByText("RotateCcw");
		fireEvent.press(rotateIcons[0]);

		await waitFor(() => {
			expect(screen.getByText("Resetuj zaznaczenia")).toBeTruthy();
			expect(
				screen.getByText("Czy na pewno chcesz odznaczyć wszystkie elementy?"),
			).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Resetuj"));

		await waitFor(() => {
			expect(mockApiClient.put).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/reset`,
			);
		});
	});

	it("deletes all completed items", async () => {
		setupMocks();
		mockApiClient.delete.mockResolvedValue({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Ukończone (2)")).toBeTruthy();
		});

		const trashIcons = screen.getAllByText("Trash2");
		fireEvent.press(trashIcons[1]);

		await waitFor(() => {
			expect(screen.getByText("Usuń zaznaczone")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Usuń"));

		await waitFor(() => {
			expect(mockApiClient.delete).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/completed`,
			);
		});
	});

	it("restores all deleted items", async () => {
		setupMocks();
		mockApiClient.put.mockResolvedValue({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Usunięte (2)")).toBeTruthy();
		});

		const rotateIcons = screen.getAllByText("RotateCcw");
		fireEvent.press(rotateIcons[1]);

		await waitFor(() => {
			expect(screen.getByText("Przywróć wszystkie")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Przywróć"));

		await waitFor(() => {
			expect(mockApiClient.put).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/restore-all`,
			);
		});
	});

	it("permanently deletes all deleted items", async () => {
		setupMocks();
		mockApiClient.delete.mockResolvedValue({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Usunięte (2)")).toBeTruthy();
		});

		const trashIcons = screen.getAllByText("Trash2");
		fireEvent.press(trashIcons[trashIcons.length - 1]);

		await waitFor(() => {
			expect(screen.getByText("Trwałe usunięcie")).toBeTruthy();
			expect(screen.getByText(/Tej operacji nie można cofnąć/)).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Usuń trwale"));

		await waitFor(() => {
			expect(mockApiClient.delete).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/deleted`,
			);
		});
	});
});
