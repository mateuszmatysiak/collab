import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app";
import {
	resetUserCounter,
	setupAuthenticatedUser,
} from "../../helpers/auth.helper";

describe("POST /api/auth/logout", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	it("should logout successfully", async () => {
		const { request, refreshToken } = await setupAuthenticatedUser(app);

		const response = await request("/api/auth/logout", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		});

		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty("message");
	});

	it("should return 401 without auth token", async () => {
		const { refreshToken } = await setupAuthenticatedUser(app);

		const response = await app.request("/api/auth/logout", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		expect(response.status).toBe(401);
	});
});
