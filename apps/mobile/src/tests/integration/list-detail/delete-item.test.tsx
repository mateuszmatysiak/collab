import { ListDetailContent } from "../../../../app/(tabs)/lists/[id]";
import { createItem, createList, TEST_USER } from "../../helpers/data";
import {
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

	const pendingItem1 = createItem(LIST_ID, {
		id: "item-1",
		title: "Mleko",
		position: 0,
	});

	const pendingItem2 = createItem(LIST_ID, {
		id: "item-2",
		title: "Chleb",
		position: 1,
	});

	const deletedItem = createItem(LIST_ID, {
		id: "item-deleted",
		title: "Masło",
		position: 2,
		deletedAt: new Date("2024-06-01"),
	});

	const items = [pendingItem1, pendingItem2, deletedItem];

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

describe("Delete item", () => {
	it("soft deletes item when X is pressed", async () => {
		setupMocks();
		mockApiClient.delete.mockResolvedValue({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const xIcons = screen.getAllByText("X");
		fireEvent.press(xIcons[0]);

		await waitFor(() => {
			expect(mockApiClient.delete).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/item-1`,
			);
		});
	});

	it("shows deleted section with deleted items", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Usunięte (1)")).toBeTruthy();
			expect(screen.getByText("Masło")).toBeTruthy();
		});
	});

	it("restores deleted item", async () => {
		setupMocks();
		mockApiClient.put.mockResolvedValue({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Masło")).toBeTruthy();
		});

		const restoreIcons = screen.getAllByText("RotateCcw");

		fireEvent.press(restoreIcons[restoreIcons.length - 1]);

		await waitFor(() => {
			expect(mockApiClient.put).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/item-deleted/restore`,
			);
		});
	});

	it("permanently deletes item with confirmation dialog", async () => {
		setupMocks();
		mockApiClient.delete.mockResolvedValue({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Masło")).toBeTruthy();
		});

		const xIcons = screen.getAllByText("X");

		fireEvent.press(xIcons[xIcons.length - 1]);

		await waitFor(() => {
			expect(screen.getByText("Trwałe usunięcie")).toBeTruthy();
			expect(screen.getByText(/Tej operacji nie można cofnąć/)).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Usuń trwale"));

		await waitFor(() => {
			expect(mockApiClient.delete).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/item-deleted/permanent`,
			);
		});
	});
});
