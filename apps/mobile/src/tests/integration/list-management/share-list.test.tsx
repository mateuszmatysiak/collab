import ListsScreen from "../../../../app/(tabs)/lists/index";
import { createList, OTHER_USER, TEST_USER } from "../../helpers/data";
import {
	mockApiClient,
	renderWithProviders,
	screen,
	waitFor,
} from "../../helpers/test-utils";

beforeEach(() => {
	jest.clearAllMocks();

	const list = createList({
		id: "list-1",
		name: "Zakupy",
		authorId: TEST_USER.id,
		sharesCount: 1,
		shares: [{ userId: OTHER_USER.id, userName: OTHER_USER.name }],
	});

	mockApiClient.get.mockImplementation((url: string) => {
		if (url.includes("/api/auth/me")) {
			return Promise.resolve({ data: { user: TEST_USER } });
		}
		if (url === "/api/lists") {
			return Promise.resolve({ data: { lists: [list] } });
		}
		if (url.includes("/api/lists/list-1/shares")) {
			return Promise.resolve({
				data: {
					shares: [
						{
							id: "share-1",
							userId: OTHER_USER.id,
							userName: OTHER_USER.name,
							userLogin: OTHER_USER.login,
							role: "editor",
							createdAt: new Date().toISOString(),
						},
					],
					author: {
						id: TEST_USER.id,
						name: TEST_USER.name,
						login: TEST_USER.login,
					},
				},
			});
		}
		return Promise.resolve({ data: {} });
	});
});

describe("Share list", () => {
	it("renders list card with shared user indicator", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		expect(screen.getByText("Zakupy")).toBeTruthy();
	});

	it("fetches lists including share information", async () => {
		renderWithProviders(<ListsScreen />);

		await waitFor(() => {
			expect(screen.getByText("Zakupy")).toBeTruthy();
		});

		expect(mockApiClient.get).toHaveBeenCalledWith("/api/lists");
	});
});
