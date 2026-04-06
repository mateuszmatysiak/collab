import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app";
import {
	resetUserCounter,
	setupAuthenticatedUser,
} from "../../helpers/auth.helper";
import { createList } from "../../helpers/lists.helper";

describe("Shares", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	describe("POST /api/lists/:id/share", () => {
		it("should share a list with another user", async () => {
			const owner = await setupAuthenticatedUser(app);
			const otherUser = await setupAuthenticatedUser(app);

			const list = await createList(owner.request, "Shared List");

			const response = await owner.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: otherUser.user.login }),
			});

			expect(response.status).toBe(201);

			const data = await response.json();
			expect(data.share).toHaveProperty("id");
		});

		it("should allow shared user to access the list", async () => {
			const owner = await setupAuthenticatedUser(app);
			const otherUser = await setupAuthenticatedUser(app);

			const list = await createList(owner.request, "Shared List");

			await owner.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: otherUser.user.login }),
			});

			// Other user should see the list
			const response = await otherUser.request(`/api/lists/${list.id}`);

			expect(response.status).toBe(200);
		});

		it("should return error when sharing with non-existent user", async () => {
			const owner = await setupAuthenticatedUser(app);
			const list = await createList(owner.request, "List");

			const response = await owner.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: "nonexistent_user_xyz" }),
			});

			expect(response.status).toBeGreaterThanOrEqual(400);
		});

		it("should return 403 for non-owner trying to share", async () => {
			const owner = await setupAuthenticatedUser(app);
			const editor = await setupAuthenticatedUser(app);

			const list = await createList(owner.request, "List");

			// Share with editor
			await owner.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: editor.user.login }),
			});

			// Editor tries to share with a non-existent user (to test permission, not user limit)
			const response = await editor.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: owner.user.login }),
			});

			expect(response.status).toBe(403);
		});
	});

	describe("GET /api/lists/:id/shares", () => {
		it("should return list shares", async () => {
			const owner = await setupAuthenticatedUser(app);
			const otherUser = await setupAuthenticatedUser(app);

			const list = await createList(owner.request, "Shared List");

			await owner.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: otherUser.user.login }),
			});

			const response = await owner.request(`/api/lists/${list.id}/shares`);

			expect(response.status).toBe(200);

			const data = await response.json();
			expect(data.shares.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe("DELETE /api/lists/:id/share/:userId", () => {
		it("should remove a share", async () => {
			const owner = await setupAuthenticatedUser(app);
			const otherUser = await setupAuthenticatedUser(app);

			const list = await createList(owner.request, "Shared List");

			await owner.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: otherUser.user.login }),
			});

			const response = await owner.request(
				`/api/lists/${list.id}/share/${otherUser.user.id}`,
				{
					method: "DELETE",
				},
			);

			expect(response.status).toBe(200);

			// Verify other user can no longer access (404 = list hidden from non-members)
			const accessResponse = await otherUser.request(`/api/lists/${list.id}`);
			expect(accessResponse.status).toBe(404);
		});

		it("should return 403 for non-owner trying to remove share", async () => {
			const owner = await setupAuthenticatedUser(app);
			const editor = await setupAuthenticatedUser(app);

			const list = await createList(owner.request, "List");

			await owner.request(`/api/lists/${list.id}/share`, {
				method: "POST",
				body: JSON.stringify({ login: editor.user.login }),
			});

			// Editor tries to remove their own share
			const response = await editor.request(
				`/api/lists/${list.id}/share/${editor.user.id}`,
				{
					method: "DELETE",
				},
			);

			expect(response.status).toBe(403);
		});
	});
});
