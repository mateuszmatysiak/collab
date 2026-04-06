import { Alert } from "react-native";
import { ListDetailContent } from "../../../../app/(tabs)/lists/[id]";
import { createList, OTHER_USER, TEST_USER } from "../setup/mocks/data";
import {
	fireEvent,
	mockApiClient,
	mockRouter,
	renderWithProviders,
	screen,
	waitFor,
} from "../setup/test-utils";

const LIST_ID = "list-1";

function setupMocks(listOverrides?: Parameters<typeof createList>[0]) {
	const list = createList({
		id: LIST_ID,
		name: "Zakupy",
		authorId: TEST_USER.id,
		...listOverrides,
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
			return Promise.resolve({
				data: { shares: [], author: TEST_USER },
			});
		}
		return Promise.resolve({ data: {} });
	});

	return list;
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Delete list", () => {
	it("shows delete button for owner", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		expect(screen.getAllByText("Trash2").length).toBeGreaterThan(0);
	});

	it("hides delete button for non-owner", async () => {
		setupMocks({ authorId: OTHER_USER.id });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		expect(screen.queryByText("Usuń listę")).toBeNull();
	});

	it("shows confirmation dialog when delete is pressed", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		const [trashIcon] = screen.getAllByText("Trash2");
		fireEvent.press(trashIcon);

		await waitFor(() => {
			expect(screen.getByText("Usuń listę")).toBeTruthy();
			expect(screen.getByText(/Czy na pewno chcesz usunąć listę/)).toBeTruthy();
		});
	});

	it("closes dialog on cancel", async () => {
		setupMocks();

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		const [trashIcon] = screen.getAllByText("Trash2");
		fireEvent.press(trashIcon);

		await waitFor(() => {
			expect(screen.getByText("Usuń listę")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Anuluj"));

		await waitFor(() => {
			expect(screen.queryByText("Usuń listę")).toBeNull();
		});
	});

	it("deletes list and navigates back on confirm", async () => {
		setupMocks();
		mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } });

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		const [trashIcon] = screen.getAllByText("Trash2");
		fireEvent.press(trashIcon);

		await waitFor(() => {
			expect(screen.getByText("Usuń listę")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Usuń"));

		await waitFor(() => {
			expect(mockApiClient.delete).toHaveBeenCalledWith(
				`/api/lists/${LIST_ID}`,
			);
		});

		await waitFor(() => {
			expect(mockRouter.back).toHaveBeenCalled();
		});
	});

	it("shows error alert on delete failure", async () => {
		setupMocks();
		mockApiClient.delete.mockRejectedValueOnce(new Error("Server error"));

		renderWithProviders(<ListDetailContent id={LIST_ID} />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		const [trashIcon] = screen.getAllByText("Trash2");
		fireEvent.press(trashIcon);

		await waitFor(() => {
			expect(screen.getByText("Usuń listę")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Usuń"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Błąd",
				"Nie udało się usunąć listy.",
			);
		});
	});
});
