import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app";
import {
	resetUserCounter,
	setupAuthenticatedUser,
} from "../../helpers/auth.helper";
import { createItem } from "../../helpers/items.helper";
import { createList } from "../../helpers/lists.helper";

describe("Items CRUD", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	describe("POST /api/lists/:listId/items", () => {
		it("should create an item", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			const response = await request(`/api/lists/${list.id}/items`, {
				method: "POST",
				body: JSON.stringify({ title: "Buy milk" }),
			});

			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.item.title).toBe("Buy milk");
			expect(data.item.isCompleted).toBe(false);
			expect(data.item.listId).toBe(list.id);
		});

		it("should return 401 without auth", async () => {
			const response = await app.request(
				"/api/lists/00000000-0000-0000-0000-000000000000/items",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title: "Test" }),
				},
			);

			expect(response.status).toBe(401);
		});
	});

	describe("GET /api/lists/:listId/items", () => {
		it("should return list items", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			await createItem(request, list.id, "Item 1");
			await createItem(request, list.id, "Item 2");

			const response = await request(`/api/lists/${list.id}/items`);

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.items).toHaveLength(2);
		});

		it("should not include deleted items by default", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			const item = await createItem(request, list.id, "To delete");

			await request(`/api/lists/${list.id}/items/${item.id}`, {
				method: "DELETE",
			});

			const response = await request(`/api/lists/${list.id}/items`);
			const data = await response.json();
			expect(data.items).toHaveLength(0);
		});

		it("should include deleted items when requested", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			const item = await createItem(request, list.id, "To delete");

			await request(`/api/lists/${list.id}/items/${item.id}`, {
				method: "DELETE",
			});

			const response = await request(
				`/api/lists/${list.id}/items?includeDeleted=true`,
			);
			const data = await response.json();
			expect(data.items.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("PATCH /api/lists/:listId/items/:itemId", () => {
		it("should update item title", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);
			const item = await createItem(request, list.id, "Old title");

			const response = await request(`/api/lists/${list.id}/items/${item.id}`, {
				method: "PATCH",
				body: JSON.stringify({ title: "New title" }),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.item.title).toBe("New title");
		});

		it("should toggle completion", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);
			const item = await createItem(request, list.id);

			const response = await request(`/api/lists/${list.id}/items/${item.id}`, {
				method: "PATCH",
				body: JSON.stringify({ is_completed: true }),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.item.isCompleted).toBe(true);
		});
	});

	describe("DELETE /api/lists/:listId/items/:itemId", () => {
		it("should soft delete an item", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);
			const item = await createItem(request, list.id);

			const response = await request(`/api/lists/${list.id}/items/${item.id}`, {
				method: "DELETE",
			});

			expect(response.status).toBe(200);
		});
	});

	describe("PUT /api/lists/:listId/items/reset", () => {
		it("should reset all completed items", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			const item1 = await createItem(request, list.id);
			const item2 = await createItem(request, list.id);

			// Complete both
			await request(`/api/lists/${list.id}/items/${item1.id}`, {
				method: "PATCH",
				body: JSON.stringify({ is_completed: true }),
			});
			await request(`/api/lists/${list.id}/items/${item2.id}`, {
				method: "PATCH",
				body: JSON.stringify({ is_completed: true }),
			});

			const resetResponse = await request(`/api/lists/${list.id}/items/reset`, {
				method: "PUT",
			});

			expect(resetResponse.status).toBe(200);

			// Verify items are unchecked
			const getResponse = await request(`/api/lists/${list.id}/items`);
			const data = await getResponse.json();

			for (const item of data.items) {
				expect(item.isCompleted).toBe(false);
			}
		});
	});

	describe("DELETE /api/lists/:listId/items/completed", () => {
		it("should soft delete all completed items", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			const item1 = await createItem(request, list.id);
			await createItem(request, list.id, "Pending item");

			// Complete one
			await request(`/api/lists/${list.id}/items/${item1.id}`, {
				method: "PATCH",
				body: JSON.stringify({ is_completed: true }),
			});

			const deleteResponse = await request(
				`/api/lists/${list.id}/items/completed`,
				{
					method: "DELETE",
				},
			);

			expect(deleteResponse.status).toBe(200);

			// Only pending item should remain
			const getResponse = await request(`/api/lists/${list.id}/items`);
			const data = await getResponse.json();
			expect(data.items).toHaveLength(1);
			expect(data.items[0].title).toBe("Pending item");
		});
	});

	describe("PUT /api/lists/:listId/items/reorder", () => {
		it("should reorder items", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			const item1 = await createItem(request, list.id, "First");
			const item2 = await createItem(request, list.id, "Second");

			const response = await request(`/api/lists/${list.id}/items/reorder`, {
				method: "PUT",
				body: JSON.stringify({ itemIds: [item2.id, item1.id] }),
			});

			expect(response.status).toBe(200);
		});
	});

	describe("PUT /api/lists/:listId/items/:itemId/restore", () => {
		it("should restore a soft-deleted item", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);
			const item = await createItem(request, list.id);

			// Soft delete
			await request(`/api/lists/${list.id}/items/${item.id}`, {
				method: "DELETE",
			});

			// Restore
			const restoreResponse = await request(
				`/api/lists/${list.id}/items/${item.id}/restore`,
				{
					method: "PUT",
				},
			);

			expect(restoreResponse.status).toBe(200);

			// Verify restored
			const getResponse = await request(`/api/lists/${list.id}/items`);
			const data = await getResponse.json();
			expect(data.items).toHaveLength(1);
		});
	});

	describe("DELETE /api/lists/:listId/items/:itemId/permanent", () => {
		it("should permanently delete a soft-deleted item", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);
			const item = await createItem(request, list.id);

			// Soft delete first
			await request(`/api/lists/${list.id}/items/${item.id}`, {
				method: "DELETE",
			});

			// Permanently delete
			const response = await request(
				`/api/lists/${list.id}/items/${item.id}/permanent`,
				{
					method: "DELETE",
				},
			);

			expect(response.status).toBe(200);

			// Verify gone even with includeDeleted
			const getResponse = await request(
				`/api/lists/${list.id}/items?includeDeleted=true`,
			);
			const data = await getResponse.json();
			expect(data.items).toHaveLength(0);
		});
	});
});
