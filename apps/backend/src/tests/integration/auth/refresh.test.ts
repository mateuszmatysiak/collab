import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app";
import { registerUser, resetUserCounter } from "../../helpers/auth.helper";

describe("POST /api/auth/refresh", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	it("should refresh tokens successfully", async () => {
		const auth = await registerUser(app);

		const response = await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: auth.refreshToken }),
		});

		expect(response.status).toBe(200);

		const data = await response.json();
		expect(data).toHaveProperty("accessToken");
		expect(data).toHaveProperty("refreshToken");
		expect(typeof data.accessToken).toBe("string");
		expect(typeof data.refreshToken).toBe("string");
	});

	it("should return error for non-existent refresh token", async () => {
		const response = await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: randomUUID() }),
		});

		expect(response.status).toBeGreaterThanOrEqual(400);
	});

	it("should return 400 for invalid refresh token format", async () => {
		const response = await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: "not-a-uuid" }),
		});

		expect(response.status).toBe(400);
	});

	it("should invalidate old refresh token after use", async () => {
		const auth = await registerUser(app);

		// Use the refresh token
		await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: auth.refreshToken }),
		});

		// Try to use the same refresh token again
		const response = await app.request("/api/auth/refresh", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: auth.refreshToken }),
		});

		expect(response.status).toBeGreaterThanOrEqual(400);
	});
});
