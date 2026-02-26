import type { AppType } from "../../src/app";

interface User {
	id: string;
	name: string;
	login: string;
	createdAt: string;
}

interface AuthResponse {
	user: User;
	accessToken: string;
	refreshToken: string;
}

interface RegisterPayload {
	name: string;
	login: string;
	password: string;
}

interface LoginPayload {
	login: string;
	password: string;
}

let userCounter = 0;

export function generateTestUser(): RegisterPayload {
	userCounter++;
	const timestamp = Date.now();
	return {
		name: `Test User ${userCounter}`,
		login: `testuser_${timestamp}_${userCounter}`,
		password: "password123",
	};
}

export async function registerUser(
	app: AppType,
	payload?: Partial<RegisterPayload>,
): Promise<AuthResponse> {
	const userData = {
		...generateTestUser(),
		...payload,
	};

	const response = await app.request("/api/auth/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(userData),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to register user: ${response.status} - ${JSON.stringify(error)}`,
		);
	}

	const data = (await response.json()) as AuthResponse;

	return data;
}

export async function loginUser(
	app: AppType,
	payload: LoginPayload,
): Promise<AuthResponse> {
	const response = await app.request("/api/auth/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(
			`Failed to login user: ${response.status} - ${JSON.stringify(error)}`,
		);
	}

	return response.json() as Promise<AuthResponse>;
}

export function createAuthenticatedRequest(app: AppType, accessToken: string) {
	return async (path: string, options: RequestInit = {}): Promise<Response> => {
		const headers = new Headers(options.headers);
		headers.set("Authorization", `Bearer ${accessToken}`);
		headers.set("Content-Type", "application/json");

		return app.request(path, {
			...options,
			headers,
		});
	};
}

export async function setupAuthenticatedUser(
	app: AppType,
	payload?: Partial<RegisterPayload>,
) {
	const authResponse = await registerUser(app, payload);
	const authenticatedRequest = createAuthenticatedRequest(
		app,
		authResponse.accessToken,
	);

	return {
		user: authResponse.user,
		accessToken: authResponse.accessToken,
		refreshToken: authResponse.refreshToken,
		request: authenticatedRequest,
	};
}

export function resetUserCounter() {
	userCounter = 0;
}
