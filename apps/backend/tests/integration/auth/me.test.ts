import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../src/app";
import {
	resetUserCounter,
	setupAuthenticatedUser,
} from "../../helpers/auth.helper";

describe("GET /api/auth/me", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	it("should return current user", async () => {
		const { request, user } = await setupAuthenticatedUser(app);

		const response = await request("/api/auth/me");

		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data.user.id).toBe(user.id);
		expect(data.user.login).toBe(user.login);
		expect(data.user.name).toBe(user.name);
	});

	it("should return 401 without auth token", async () => {
		const response = await app.request("/api/auth/me");

		expect(response.status).toBe(401);
	});

	it("should return 401 with invalid token", async () => {
		const response = await app.request("/api/auth/me", {
			headers: { Authorization: "Bearer invalid-token" },
		});

		expect(response.status).toBe(401);
	});
});
