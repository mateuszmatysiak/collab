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
	const item = createItem(LIST_ID, {
		id: "item-1",
		title: "Mleko",
		description: "2 litry",
		position: 0,
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
			return Promise.resolve({ data: { categories: [] } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/shares`)) {
			return Promise.resolve({ data: { shares: [], author: TEST_USER } });
		}
		return Promise.resolve({ data: {} });
	});

	mockApiClient.patch.mockResolvedValue({
		data: { item: { ...item, title: "Chleb" } },
	});

	return { list, item };
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Edit item", () => {
	it("shows item title and description", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
			expect(screen.getByText("2 litry")).toBeTruthy();
		});
	});

	it("edits title on press → change → blur", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Mleko"));

		await waitFor(() => {
			const input = screen.getByDisplayValue("Mleko");
			expect(input).toBeTruthy();
		});

		const input = screen.getByDisplayValue("Mleko");
		fireEvent.changeText(input, "Chleb");
		fireEvent(input, "blur");

		await waitFor(() => {
			expect(mockApiClient.patch).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/item-1`,
				expect.objectContaining({ title: "Chleb" }),
			);
		});
	});

	it("does not save when title is emptied (rollback)", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Mleko"));

		await waitFor(() => {
			expect(screen.getByDisplayValue("Mleko")).toBeTruthy();
		});

		const input = screen.getByDisplayValue("Mleko");
		fireEvent.changeText(input, "");
		fireEvent(input, "blur");

		expect(mockApiClient.patch).not.toHaveBeenCalledWith(
			`/api/lists/${LIST_ID}/items/item-1`,
			expect.objectContaining({ title: "" }),
		);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});
	});

	it("does not save when title is unchanged", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Mleko")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Mleko"));

		await waitFor(() => {
			expect(screen.getByDisplayValue("Mleko")).toBeTruthy();
		});

		const input = screen.getByDisplayValue("Mleko");
		fireEvent(input, "blur");

		expect(mockApiClient.patch).not.toHaveBeenCalledWith(
			`/api/lists/${LIST_ID}/items/item-1`,
			expect.objectContaining({ title: "Mleko" }),
		);
	});

	it("edits description on press → change → blur", async () => {
		setupMocks();

		mockApiClient.patch.mockResolvedValue({
			data: {
				item: createItem(LIST_ID, {
					id: "item-1",
					title: "Mleko",
					description: "3 litry",
				}),
			},
		});

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("2 litry")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("2 litry"));

		await waitFor(() => {
			expect(screen.getByDisplayValue("2 litry")).toBeTruthy();
		});

		const input = screen.getByDisplayValue("2 litry");
		fireEvent.changeText(input, "3 litry");
		fireEvent(input, "blur");

		await waitFor(() => {
			expect(mockApiClient.patch).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items/item-1`,
				expect.objectContaining({ description: "3 litry" }),
			);
		});
	});
});
