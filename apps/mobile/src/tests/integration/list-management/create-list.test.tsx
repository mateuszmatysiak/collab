import { Alert } from "react-native";
import ListsScreen from "../../../../app/(tabs)/lists/index";
import { createList, TEST_USER } from "../../helpers/data";
import {
	fireEvent,
	mockApiClient,
	mockRouter,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

beforeEach(() => {
	jest.clearAllMocks();

	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url === "/api/lists") {
			return Promise.resolve({ data: { lists: [] } });
		}
		return Promise.resolve({ data: {} });
	});
});

describe("Create list", () => {
	it("shows create button on empty list screen", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Utwórz listę")).toBeTruthy();
		});
	});

	it("creates a list and navigates to detail", async () => {
		const newList = createList({ id: "new-list-1", name: "Nowa lista" });

		mockApiClient.post.mockResolvedValueOnce({ data: { list: newList } });

		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Utwórz listę")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Utwórz listę"));

		await waitFor(() => {
			expect(mockApiClient.post).toHaveBeenCalledWith("/api/lists", {
				name: "Nowa lista",
			});
		});

		await waitFor(() => {
			expect(mockRouter.push).toHaveBeenCalledWith(
				`/(tabs)/lists/${newList.id}`,
			);
		});
	});

	it("shows loading state while creating", async () => {
		let resolveCreate: ((value: unknown) => void) | undefined;
		const createPromise = new Promise((resolve) => {
			resolveCreate = resolve;
		});

		mockApiClient.post.mockReturnValueOnce(createPromise);

		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Utwórz listę")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Utwórz listę"));

		await waitFor(() => {
			expect(screen.getByText("Tworzenie...")).toBeTruthy();
		});

		const newList = createList({ id: "new-list-2" });
		if (resolveCreate) resolveCreate({ data: { list: newList } });
	});

	it("shows error alert on failure", async () => {
		mockApiClient.post.mockRejectedValueOnce(new Error("Server error"));

		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Utwórz listę")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Utwórz listę"));

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Błąd",
				"Nie udało się utworzyć listy. Spróbuj ponownie.",
			);
		});
	});
});
