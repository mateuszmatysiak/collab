import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

jest.unmock("@/api/client");

jest.mock("@/config/env", () => ({
	getEnv: () => ({ EXPO_PUBLIC_API_URL: "http://localhost:3000" }),
}));

let mockAdapter: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;

const mockAxiosPost = jest.fn();

jest.mock("axios", () => {
	const realAxios = jest.requireActual("axios");

	const instance = realAxios.create({
		baseURL: "http://localhost:3000",
		timeout: 5000,
		headers: { "Content-Type": "application/json" },
	});

	instance.defaults.adapter = (config: InternalAxiosRequestConfig) => {
		return mockAdapter(config);
	};

	return {
		...realAxios,
		__esModule: true,
		default: {
			...realAxios,
			create: () => instance,
			post: mockAxiosPost,
		},
		create: () => instance,
		post: mockAxiosPost,
	};
});

beforeEach(async () => {
	jest.clearAllMocks();

	await SecureStore.setItemAsync("accessToken", "expired-access-token");
	await SecureStore.setItemAsync("refreshToken", "valid-refresh-token");

	mockAdapter = async () => {
		throw new Error("No adapter configured for this test");
	};
});

afterEach(async () => {
	await SecureStore.deleteItemAsync("accessToken");
	await SecureStore.deleteItemAsync("refreshToken");
});

function create401Error(config: InternalAxiosRequestConfig) {
	const error = new Error("Unauthorized") as Error & {
		response: { status: number; data: object };
		config: InternalAxiosRequestConfig;
	};
	error.response = { status: 401, data: {} };
	error.config = config;
	return error;
}

describe("Token refresh interceptor", () => {
	it("refreshes access token on 401 and retries original request", async () => {
		jest.resetModules();
		const { apiClient } = require("@/api/client");
		let callCount = 0;

		mockAdapter = async (config: InternalAxiosRequestConfig) => {
			callCount++;
			if (callCount === 1) {
				return Promise.reject(create401Error(config));
			}
			return {
				data: { user: { id: "1", name: "Test User" } },
				status: 200,
				statusText: "OK",
				headers: {},
				config,
			} as AxiosResponse;
		};

		mockAxiosPost.mockResolvedValueOnce({
			data: {
				accessToken: "new-access-token",
				refreshToken: "new-refresh-token",
			},
		});

		const response = await apiClient.get("/api/auth/me");

		expect(response.data.user.name).toBe("Test User");
		expect(callCount).toBe(2);

		expect(mockAxiosPost).toHaveBeenCalledWith(
			"http://localhost:3000/api/auth/refresh",
			{ refreshToken: "valid-refresh-token" },
		);

		const storedAccess = await SecureStore.getItemAsync("accessToken");
		const storedRefresh = await SecureStore.getItemAsync("refreshToken");
		expect(storedAccess).toBe("new-access-token");
		expect(storedRefresh).toBe("new-refresh-token");
	});

	it("retried request includes new access token in headers", async () => {
		jest.resetModules();
		const { apiClient } = require("@/api/client");
		let retryHeaders: Record<string, string> = {};
		let callCount = 0;

		mockAdapter = async (config: InternalAxiosRequestConfig) => {
			callCount++;
			if (callCount === 1) {
				return Promise.reject(create401Error(config));
			}
			retryHeaders = config.headers as unknown as Record<string, string>;
			return {
				data: { success: true },
				status: 200,
				statusText: "OK",
				headers: {},
				config,
			} as AxiosResponse;
		};

		mockAxiosPost.mockResolvedValueOnce({
			data: {
				accessToken: "fresh-token",
				refreshToken: "fresh-refresh",
			},
		});

		await apiClient.get("/api/auth/me");

		expect(retryHeaders.Authorization).toBe("Bearer fresh-token");
	});

	it("clears tokens when refresh fails", async () => {
		jest.resetModules();
		const { apiClient } = require("@/api/client");
		mockAdapter = async (config: InternalAxiosRequestConfig) => {
			return Promise.reject(create401Error(config));
		};

		mockAxiosPost.mockRejectedValueOnce(new Error("Refresh token expired"));

		await expect(apiClient.get("/api/auth/me")).rejects.toThrow();

		const storedAccess = await SecureStore.getItemAsync("accessToken");
		const storedRefresh = await SecureStore.getItemAsync("refreshToken");
		expect(storedAccess).toBeNull();
		expect(storedRefresh).toBeNull();
	});

	it("clears tokens when no refresh token exists", async () => {
		await SecureStore.deleteItemAsync("refreshToken");

		jest.resetModules();
		const { apiClient } = require("@/api/client");

		mockAdapter = async (config: InternalAxiosRequestConfig) => {
			return Promise.reject(create401Error(config));
		};

		await expect(apiClient.get("/api/auth/me")).rejects.toThrow();

		const storedAccess = await SecureStore.getItemAsync("accessToken");
		expect(storedAccess).toBeNull();
	});

	it("does not retry on non-401 errors", async () => {
		jest.resetModules();
		const { apiClient } = require("@/api/client");
		mockAdapter = async (config: InternalAxiosRequestConfig) => {
			const error = new Error("Server Error") as Error & {
				response: { status: number; data: object };
				config: InternalAxiosRequestConfig;
			};
			error.response = { status: 500, data: {} };
			error.config = config;
			return Promise.reject(error);
		};

		await expect(apiClient.get("/api/some-endpoint")).rejects.toThrow();

		expect(mockAxiosPost).not.toHaveBeenCalled();
	});

	it("adds access token to request headers from SecureStore", async () => {
		jest.resetModules();
		const { apiClient } = require("@/api/client");

		let capturedHeaders: Record<string, string> = {};

		mockAdapter = async (config: InternalAxiosRequestConfig) => {
			capturedHeaders = config.headers as unknown as Record<string, string>;
			return {
				data: { success: true },
				status: 200,
				statusText: "OK",
				headers: {},
				config,
			} as AxiosResponse;
		};

		await apiClient.get("/api/test");

		expect(capturedHeaders.Authorization).toBe("Bearer expired-access-token");
	});
});
