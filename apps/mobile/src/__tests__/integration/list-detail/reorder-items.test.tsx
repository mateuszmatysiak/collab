import { ListDetailContent } from "../../../../app/(tabs)/lists/[id]";
import { createItem, createList, TEST_USER } from "../setup/mocks/data";
import {
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

	const items = [
		createItem(LIST_ID, { id: "item-1", title: "Mleko", position: 0 }),
		createItem(LIST_ID, { id: "item-2", title: "Chleb", position: 1 }),
		createItem(LIST_ID, { id: "item-3", title: "Masło", position: 2 }),
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
});

describe("Reorder items", () => {
	it("renders items in position order", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
			expect(screen.getByText("Chleb")).toBeTruthy();
			expect(screen.getByText("Masło")).toBeTruthy();
		});

		const allTexts = screen.getAllByText(/Mleko|Chleb|Masło/);
		expect(allTexts).toHaveLength(3);
	});
});
