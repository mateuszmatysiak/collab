import { Alert } from "react-native";
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

function setupMocks(items: ReturnType<typeof createItem>[] = []) {
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

	return list;
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Add item", () => {
	it("shows add item form with placeholder", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Tytuł elementu...")).toBeTruthy();
			expect(screen.getByPlaceholderText("Dodatkowy opis...")).toBeTruthy();
		});
	});

	it("creates an item with title and description", async () => {
		setupMocks();

		const newItem = createItem(LIST_ID, {
			id: "new-item-1",
			title: "Mleko",
			description: "2 litry",
		});

		mockApiClient.post.mockResolvedValueOnce({ data: { item: newItem } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Tytuł elementu...")).toBeTruthy();
		});

		const titleInput = screen.getByPlaceholderText("Tytuł elementu...");
		const descInput = screen.getByPlaceholderText("Dodatkowy opis...");

		fireEvent.changeText(titleInput, "Mleko");
		fireEvent.changeText(descInput, "2 litry");

		fireEvent(descInput, "submitEditing");

		await waitFor(() => {
			expect(mockApiClient.post).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}/items`,
				expect.objectContaining({
					title: "Mleko",
					description: "2 litry",
				}),
			);
		});
	});

	it("resets form after successful creation", async () => {
		setupMocks();

		const newItem = createItem(LIST_ID, { id: "new-item-2", title: "Chleb" });
		mockApiClient.post.mockResolvedValueOnce({ data: { item: newItem } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Tytuł elementu...")).toBeTruthy();
		});

		const titleInput = screen.getByPlaceholderText("Tytuł elementu...");
		fireEvent.changeText(titleInput, "Chleb");
		fireEvent(
			screen.getByPlaceholderText("Dodatkowy opis..."),
			"submitEditing",
		);

		await waitFor(() => {
			expect(mockApiClient.post).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(titleInput.props.value).toBe("");
		});
	});

	it("shows error alert on creation failure", async () => {
		setupMocks();

		mockApiClient.post.mockRejectedValueOnce(new Error("Server error"));

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText("Tytuł elementu...")).toBeTruthy();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText("Tytuł elementu..."),
			"Test",
		);
		fireEvent(
			screen.getByPlaceholderText("Dodatkowy opis..."),
			"submitEditing",
		);

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Błąd",
				"Nie udało się dodać elementu. Spróbuj ponownie.",
			);
		});
	});
});
