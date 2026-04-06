import ListsScreen from "../../../../app/(tabs)/lists/index";
import { createList, OTHER_USER, TEST_USER } from "../setup/mocks/data";
import {
	fireEvent,
	mockApiClient,
	renderWithProviders,
	screen,
	waitFor,
} from "../setup/test-utils";

const ownedLists = [
	createList({
		id: "list-1",
		name: "Zakupy",
		role: "owner",
		authorId: TEST_USER.id,
	}),
	createList({
		id: "list-2",
		name: "Todo",
		role: "owner",
		authorId: TEST_USER.id,
	}),
	createList({
		id: "list-3",
		name: "Prace domowe",
		role: "owner",
		authorId: TEST_USER.id,
	}),
];

const sharedLists = [
	createList({
		id: "list-4",
		name: "Wspólne zakupy",
		role: "editor",
		authorId: OTHER_USER.id,
	}),
	createList({
		id: "list-5",
		name: "Projekt",
		role: "editor",
		authorId: OTHER_USER.id,
	}),
];

const allLists = [...ownedLists, ...sharedLists];

beforeEach(() => {
	jest.clearAllMocks();

	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url === "/api/lists") {
			return Promise.resolve({ data: { lists: allLists } });
		}
		return Promise.resolve({ data: {} });
	});
});

describe("Filter lists", () => {
	it("shows all lists by default", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
			expect(screen.getByText("Wspólne zakupy")).toBeTruthy();
		});

		expect(screen.getByText("5 list")).toBeTruthy();
	});

	it("filters to owned lists when 'Moje' is pressed", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Moje"));

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
			expect(screen.getByText("Todo")).toBeTruthy();
			expect(screen.getByText("Prace domowe")).toBeTruthy();
			expect(screen.queryByText("Wspólne zakupy")).toBeNull();
			expect(screen.queryByText("Projekt")).toBeNull();
		});
	});

	it("filters to shared lists when 'Udostępnione' is pressed", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Udostępnione"));

		await waitFor(() => {
			expect(screen.getByText("Wspólne zakupy")).toBeTruthy();
			expect(screen.getByText("Projekt")).toBeTruthy();
			expect(screen.queryByText("Zakupy")).toBeNull();
			expect(screen.queryByText("Todo")).toBeNull();
		});
	});

	it("returns to all lists when 'Wszystkie' is pressed", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Moje"));

		await waitFor(() => {
			expect(screen.queryByText("Wspólne zakupy")).toBeNull();
		});

		fireEvent.press(screen.getByText("Wszystkie"));

		await waitFor(() => {
			expect(screen.getByText("Wspólne zakupy")).toBeTruthy();
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});
	});

	it("shows empty state when filter has no results", async () => {
		mockApiClient.get.mockImplementation((url: string) => {
			if (url.includes("/api/auth/me")) {
				return Promise.resolve({ data: { user: TEST_USER } });
			}
			if (url === "/api/lists") {
				return Promise.resolve({ data: { lists: ownedLists } });
			}
			return Promise.resolve({ data: {} });
		});

		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		fireEvent.press(screen.getByText("Udostępnione"));

		await waitFor(() => {
			expect(screen.getByText("Brak list")).toBeTruthy();
		});
	});

	it("shows correct Polish pluralization for count", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("5 list")).toBeTruthy();
		});
	});
});
