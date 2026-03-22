import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../src/app";
import {
	resetUserCounter,
	setupAuthenticatedUser,
} from "../../helpers/auth.helper";
import { createList } from "../../helpers/lists.helper";

describe("Lists CRUD", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	describe("POST /api/lists", () => {
		it("should create a new list", async () => {
			const { request } = await setupAuthenticatedUser(app);

			const response = await request("/api/lists", {
				method: "POST",
				body: JSON.stringify({ name: "Shopping List" }),
			});

			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.list.name).toBe("Shopping List");
			expect(data.list).toHaveProperty("id");
		});

		it("should return 400 for empty name", async () => {
			const { request } = await setupAuthenticatedUser(app);

			const response = await request("/api/lists", {
				method: "POST",
				body: JSON.stringify({ name: "" }),
			});

			expect(response.status).toBe(400);
		});

		it("should return 401 without auth", async () => {
			const response = await app.request("/api/lists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "Test" }),
			});

			expect(response.status).toBe(401);
		});
	});

	describe("GET /api/lists", () => {
		it("should return user lists", async () => {
			const { request } = await setupAuthenticatedUser(app);

			await createList(request, "List A");
			await createList(request, "List B");

			const response = await request("/api/lists");

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.lists).toHaveLength(2);
		});

		it("should return empty array for new user", async () => {
			const { request } = await setupAuthenticatedUser(app);

			const response = await request("/api/lists");

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.lists).toHaveLength(0);
		});

		it("should not return other user lists", async () => {
			const user1 = await setupAuthenticatedUser(app);
			const user2 = await setupAuthenticatedUser(app);

			await createList(user1.request, "User 1 List");

			const response = await user2.request("/api/lists");

			const data = await response.json();
			expect(data.lists).toHaveLength(0);
		});
	});

	describe("GET /api/lists/:id", () => {
		it("should return list details", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request, "My List");

			const response = await request(`/api/lists/${list.id}`);

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.list.name).toBe("My List");
			expect(data.list.id).toBe(list.id);
		});

		it("should return 404 for other user list", async () => {
			const user1 = await setupAuthenticatedUser(app);
			const user2 = await setupAuthenticatedUser(app);

			const list = await createList(user1.request, "Private List");

			const response = await user2.request(`/api/lists/${list.id}`);

			expect(response.status).toBe(404);
		});
	});

	describe("PATCH /api/lists/:id", () => {
		it("should update list name", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request, "Old Name");

			const response = await request(`/api/lists/${list.id}`, {
				method: "PATCH",
				body: JSON.stringify({ name: "New Name" }),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.list.name).toBe("New Name");
		});

		it("should return 404 for non-member", async () => {
			const user1 = await setupAuthenticatedUser(app);
			const user2 = await setupAuthenticatedUser(app);

			const list = await createList(user1.request, "List");

			const response = await user2.request(`/api/lists/${list.id}`, {
				method: "PATCH",
				body: JSON.stringify({ name: "Hacked" }),
			});

			expect(response.status).toBe(404);
		});
	});

	describe("DELETE /api/lists/:id", () => {
		it("should delete own list", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request, "To Delete");

			const response = await request(`/api/lists/${list.id}`, {
				method: "DELETE",
			});

			expect(response.status).toBe(200);

			// Verify deleted
			const getResponse = await request(`/api/lists/${list.id}`);
			expect(getResponse.status).toBeGreaterThanOrEqual(400);
		});

		it("should return 403 for non-owner", async () => {
			const user1 = await setupAuthenticatedUser(app);
			const user2 = await setupAuthenticatedUser(app);

			const list = await createList(user1.request, "List");

			const response = await user2.request(`/api/lists/${list.id}`, {
				method: "DELETE",
			});

			expect(response.status).toBe(403);
		});
	});
});
