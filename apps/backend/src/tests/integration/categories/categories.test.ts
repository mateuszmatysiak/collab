import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app";
import {
	resetUserCounter,
	setupAuthenticatedUser,
} from "../../helpers/auth.helper";
import { createList } from "../../helpers/lists.helper";

describe("Categories CRUD", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	describe("POST /api/categories/user", () => {
		it("should create a user category", async () => {
			const { request } = await setupAuthenticatedUser(app);

			const response = await request("/api/categories/user", {
				method: "POST",
				body: JSON.stringify({ name: "Groceries", icon: "ShoppingCart" }),
			});

			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.category.name).toBe("Groceries");
			expect(data.category.icon).toBe("ShoppingCart");
		});

		it("should return 400 for missing name", async () => {
			const { request } = await setupAuthenticatedUser(app);

			const response = await request("/api/categories/user", {
				method: "POST",
				body: JSON.stringify({ icon: "ShoppingCart" }),
			});

			expect(response.status).toBe(400);
		});

		it("should return 401 without auth", async () => {
			const response = await app.request("/api/categories/user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "Test", icon: "Star" }),
			});

			expect(response.status).toBe(401);
		});
	});

	describe("GET /api/categories/user", () => {
		it("should return user categories", async () => {
			const { request } = await setupAuthenticatedUser(app);

			await request("/api/categories/user", {
				method: "POST",
				body: JSON.stringify({ name: "Cat A", icon: "Star" }),
			});
			await request("/api/categories/user", {
				method: "POST",
				body: JSON.stringify({ name: "Cat B", icon: "Heart" }),
			});

			const response = await request("/api/categories/user");

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.categories).toHaveLength(2);
		});
	});

	describe("PATCH /api/categories/:id", () => {
		it("should update category", async () => {
			const { request } = await setupAuthenticatedUser(app);

			const createResponse = await request("/api/categories/user", {
				method: "POST",
				body: JSON.stringify({ name: "Old Name", icon: "Star" }),
			});
			const { category } = await createResponse.json();

			const response = await request(`/api/categories/${category.id}`, {
				method: "PATCH",
				body: JSON.stringify({ name: "New Name" }),
			});

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.category.name).toBe("New Name");
		});

		it("should return 403 for other user category", async () => {
			const user1 = await setupAuthenticatedUser(app);
			const user2 = await setupAuthenticatedUser(app);

			const createResponse = await user1.request("/api/categories/user", {
				method: "POST",
				body: JSON.stringify({ name: "Cat", icon: "Star" }),
			});
			const { category } = await createResponse.json();

			const response = await user2.request(`/api/categories/${category.id}`, {
				method: "PATCH",
				body: JSON.stringify({ name: "Hacked" }),
			});

			expect(response.status).toBeGreaterThanOrEqual(400);
		});
	});

	describe("DELETE /api/categories/:id", () => {
		it("should delete category", async () => {
			const { request } = await setupAuthenticatedUser(app);

			const createResponse = await request("/api/categories/user", {
				method: "POST",
				body: JSON.stringify({ name: "To Delete", icon: "Trash" }),
			});
			const { category } = await createResponse.json();

			const response = await request(`/api/categories/${category.id}`, {
				method: "DELETE",
			});

			expect(response.status).toBe(200);

			// Verify deleted
			const getResponse = await request("/api/categories/user");
			const data = await getResponse.json();
			expect(data.categories).toHaveLength(0);
		});
	});

	describe("List-specific categories", () => {
		it("should create a local category for a list", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			const response = await request(`/api/lists/${list.id}/categories/local`, {
				method: "POST",
				body: JSON.stringify({ name: "Local Cat", icon: "Folder" }),
			});

			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.category.name).toBe("Local Cat");
		});

		it("should get categories for a list", async () => {
			const { request } = await setupAuthenticatedUser(app);
			const list = await createList(request);

			await request(`/api/lists/${list.id}/categories/local`, {
				method: "POST",
				body: JSON.stringify({ name: "Local Cat", icon: "Folder" }),
			});

			const response = await request(`/api/lists/${list.id}/categories`);

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.categories.length).toBeGreaterThanOrEqual(1);
		});
	});
});
