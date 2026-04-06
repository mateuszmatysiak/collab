import { ListDetailContent } from "../../../../app/(tabs)/lists/[id]";
import { createList, TEST_USER } from "../../helpers/data";
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

	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url === `/api/lists/${LIST_ID}`) {
			return Promise.resolve({ data: { list } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/items`)) {
			return Promise.resolve({ data: { items: [] } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/categories`)) {
			return Promise.resolve({ data: { categories: [] } });
		}
		if (url.includes(`/api/lists/${LIST_ID}/shares`)) {
			return Promise.resolve({ data: { shares: [], author: TEST_USER } });
		}
		return Promise.resolve({ data: {} });
	});

	mockApiClient.patch.mockResolvedValue({ data: { list } });

	return list;
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Edit list name", () => {
	it("shows list name in header", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});
	});

	it("edits name on press → change → blur", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByDisplayValue("Zakupy")).toBeTruthy();
		});

		const input = screen.getByDisplayValue("Zakupy");
		fireEvent.changeText(input, "Nowe zakupy");
		fireEvent(input, "blur");

		await waitFor(() => {
			expect(mockApiClient.patch).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}`,
				expect.objectContaining({ name: "Nowe zakupy" }),
			);
		});
	});

	it("does not save when name is emptied (rollback)", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByDisplayValue("Zakupy")).toBeTruthy();
		});

		const input = screen.getByDisplayValue("Zakupy");
		fireEvent.changeText(input, "");
		fireEvent(input, "blur");

		expect(mockApiClient.patch).not.toHaveBeenCalledWith(
			`/api/lists/${LIST_ID}`,
			expect.objectContaining({ name: "" }),
		);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});
	});

	it("does not save when name is unchanged", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Zakupy"));

		await waitFor(() => {
			expect(screen.getByDisplayValue("Zakupy")).toBeTruthy();
		});

		const input = screen.getByDisplayValue("Zakupy");
		fireEvent(input, "blur");

		expect(mockApiClient.patch).not.toHaveBeenCalledWith(
			`/api/lists/${LIST_ID}`,
			expect.anything(),
		);
	});
});
