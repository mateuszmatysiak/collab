import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../app";
import {
	generateTestUser,
	registerUser,
	resetUserCounter,
} from "../../helpers/auth.helper";

describe("POST /api/auth/register", () => {
	const app = createApp();

	beforeEach(() => {
		resetUserCounter();
	});

	it("should register a new user successfully", async () => {
		const userData = generateTestUser();

		const response = await app.request("/api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});

		expect(response.status).toBe(200);

		const data = await response.json();

		expect(data).toHaveProperty("user");
		expect(data).toHaveProperty("accessToken");
		expect(data).toHaveProperty("refreshToken");

		expect(data.user).toMatchObject({
			name: userData.name,
			login: userData.login,
		});
		expect(data.user).toHaveProperty("id");
		expect(data.user).toHaveProperty("createdAt");

		expect(typeof data.accessToken).toBe("string");
		expect(typeof data.refreshToken).toBe("string");

		expect(data.accessToken.split(".")).toHaveLength(3);

		expect(data.refreshToken).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
	});

	it("should return 400 for invalid registration data", async () => {
		const response = await app.request("/api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name: "",
				login: "",
				password: "12345",
			}),
		});

		expect(response.status).toBe(400);
	});

	it("should return 409 for duplicate login", async () => {
		const userData = generateTestUser();

		await registerUser(app, userData);

		const response = await app.request("/api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userData),
		});

		expect(response.status).toBe(409);

		const data = await response.json();
		expect(data.error.code).toBe("CONFLICT");
	});

	it("should return 400 for missing required fields", async () => {
		const response = await app.request("/api/auth/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});

		expect(response.status).toBe(400);
	});
});
