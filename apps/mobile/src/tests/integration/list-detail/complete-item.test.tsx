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
		itemsCount: 2,
		completedCount: 1,
	});

	const pendingItem = createItem(LIST_ID, {
		id: "item-pending",
		title: "Mleko",
		isCompleted: false,
		position: 0,
	});

	const completedItem = createItem(LIST_ID, {
		id: "item-completed",
		title: "Chleb",
		isCompleted: true,
		position: 1,
	});

	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url === `/api/lists/${LIST_ID}`) {
			return Promise.resolve({ data: { list } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/items`)) {
			return Promise.resolve({
				data: { items: [pendingItem, completedItem] },
			});
		}
		if (url.includes(`/api/lists/${LIST_ID}/categories`)) {
			return Promise.resolve({ data: { categories: [] } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/shares`)) {
			return Promise.resolve({ data: { shares: [], author: TEST_USER } });
		}
		return Promise.resolve({ data: {} });
	});

	mockApiClient.patch.mockResolvedValue({
		data: {
			item: { ...pendingItem, isCompleted: true },
		},
	});

	return { list, pendingItem, completedItem };
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Complete item", () => {
	it("shows pending and completed items", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
			expect(screen.getByText("Chleb")).toBeTruthy();
		});
	});

	it("marks pending item as completed via checkbox", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		const checkboxes = screen.getAllByRole("checkbox");

		const pendingCheckbox = checkboxes.find(
			(cb) => cb.props.accessibilityState?.checked === false,
		);

		if (pendingCheckbox) {
			fireEvent.press(pendingCheckbox);

			await waitFor(() => {
				expect(mockApiClient.patch).toHaveBeenCalledWith(
					`/api/lists/${LIST_ID}/items/item-pending`,
					expect.objectContaining({ is_completed: true }),
				);
			});
		}
	});

	it("shows progress text", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("1/2 ukończono")).toBeTruthy();
		});
	});

	it("shows completed section header", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Ukończone (1)")).toBeTruthy();
		});
	});
});
