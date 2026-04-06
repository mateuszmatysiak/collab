import { Alert } from "react-native";
import CategoriesScreen from "../../../../app/(tabs)/categories";
import { createUserCategory, TEST_USER } from "../../helpers/data";
import {
	act,
	fireEvent,
	mockApiClient,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

function setupMocks(categories: ReturnType<typeof createUserCategory>[] = []) {
	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url.includes("/api/categories/user")) {
			return Promise.resolve({ data: { categories } });
		}
		return Promise.resolve({ data: {} });
	});

	return { categories };
}

async function triggerDeleteViaLongPress(categoryName: string) {
	fireEvent(screen.getByText(categoryName), "longPress");

	const alertCalls = (Alert.alert as jest.Mock).mock.calls;
	const lastCall = alertCalls[alertCalls.length - 1];
	const buttons = lastCall[2] as Array<{
		text: string;
		onPress?: () => void;
	}>;
	const deleteButton = buttons.find((b) => b.text === "Usuń");

	await act(() => {
		deleteButton?.onPress?.();
	});
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Delete category", () => {
	it("shows action menu on long press with delete option", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent(screen.getByText("Zakupy"), "longPress");

		expect(Alert.alert).toHaveBeenCalledWith(
			"Zakupy",
			"Wybierz akcję",
			expect.arrayContaining([
				expect.objectContaining({ text: "Usuń" }),
				expect.objectContaining({ text: "Edytuj" }),
				expect.objectContaining({ text: "Anuluj" }),
			]),
		);
	});

	it("opens delete dialog from long press menu", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		await triggerDeleteViaLongPress("Zakupy");

		await waitFor(() => {
			expect(screen.getByText("Usuń kategorię")).toBeTruthy();
		});
	});

	it("shows warning about uncategorizing items", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		await triggerDeleteViaLongPress("Zakupy");

		await waitFor(() => {
			expect(screen.getByText("Usuń kategorię")).toBeTruthy();
			expect(screen.getByText(/Tej operacji nie można cofnąć/)).toBeTruthy();
		});
	});

	it("deletes category after confirmation", async () => {
		const category = createUserCategory({
			id: "cat-1",
			name: "Zakupy",
			icon: "ShoppingCart",
		});
		setupMocks([category]);

		mockApiClient.delete.mockResolvedValueOnce({
			data: { success: true },
		});

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		await triggerDeleteViaLongPress("Zakupy");

		await waitFor(() => {
			expect(screen.getByText("Usuń kategorię")).toBeTruthy();
		});

		const deleteButtons = screen.getAllByText("Usuń");
		const confirmButton = deleteButtons[deleteButtons.length - 1];
		fireEvent.press(confirmButton);

		await waitFor(() => {
			expect(mockApiClient.delete).toHaveBeenCalledWith(
				`/api/categories/${category.id}`,
			);
		});
	});

	it("cancels deletion when pressing cancel button", async () => {
		const categories = [
			createUserCategory({ name: "Zakupy", icon: "ShoppingCart" }),
		];
		setupMocks(categories);

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		await triggerDeleteViaLongPress("Zakupy");

		await waitFor(() => {
			expect(screen.getByText("Usuń kategorię")).toBeTruthy();
		});

		const cancelButtons = screen.getAllByText("Anuluj");
		fireEvent.press(cancelButtons[0]);

		await waitFor(() => {
			expect(screen.queryByText("Usuń kategorię")).toBeNull();
		});

		expect(mockApiClient.delete).not.toHaveBeenCalled();
	});

	it("shows error alert on deletion failure", async () => {
		const category = createUserCategory({
			id: "cat-1",
			name: "Zakupy",
			icon: "ShoppingCart",
		});
		setupMocks([category]);

		mockApiClient.delete.mockRejectedValueOnce(new Error("Server error"));

		renderWithProviders(<CategoriesScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		await triggerDeleteViaLongPress("Zakupy");

		await waitFor(() => {
			expect(screen.getByText("Usuń kategorię")).toBeTruthy();
		});

		const deleteButtons = screen.getAllByText("Usuń");
		const confirmButton = deleteButtons[deleteButtons.length - 1];
		fireEvent.press(confirmButton);

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Błąd",
				"Nie udało się usunąć kategorii. Spróbuj ponownie.",
			);
		});
	});
});
