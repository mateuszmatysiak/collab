import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../src/app";
import {
	generateTestUser,
	registerUser,
	resetUserCounter,
} from "../../helpers/auth.helper";

describe("POST /api/auth/login", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	it("should login successfully with valid credentials", async () => {
		const userData = generateTestUser();
		await registerUser(app, userData);

		const response = await app.request("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				login: userData.login,
				password: userData.password,
			}),
		});

		expect(response.status).toBe(200);

		const data = await response.json();

		expect(data).toHaveProperty("user");
		expect(data).toHaveProperty("accessToken");
		expect(data).toHaveProperty("refreshToken");
		expect(data.user.login).toBe(userData.login);
		expect(data.user.name).toBe(userData.name);
	});

	it("should return 401 for wrong password", async () => {
		const userData = generateTestUser();
		await registerUser(app, userData);

		const response = await app.request("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				login: userData.login,
				password: "wrongpassword",
			}),
		});

		expect(response.status).toBe(401);
	});

	it("should return 401 for non-existent user", async () => {
		const response = await app.request("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				login: "nonexistent_user",
				password: "password123",
			}),
		});

		expect(response.status).toBe(401);
	});

	it("should return 400 for missing fields", async () => {
		const response = await app.request("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});

		expect(response.status).toBe(400);
	});
});
