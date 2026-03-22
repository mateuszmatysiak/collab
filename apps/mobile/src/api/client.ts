import axios from "axios";
import { getEnv } from "@/config/env";
import { API_TIMEOUT_MS } from "@/lib/constants";
import {
	clearTokens,
	getAccessToken,
	getRefreshToken,
	setTokens,
} from "@/lib/storage";

// Lazy initialization - baseURL will be set in the interceptor
// EnvGuard checks the env during rendering, so if the env is invalid,
// ErrorBoundary will catch the error before apiClient is used
export const apiClient = axios.create({
	baseURL: "", // Will be set in the interceptor
	timeout: API_TIMEOUT_MS,
	headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		try {
			const refreshToken = await getRefreshToken();

			if (!refreshToken) {
				await clearTokens();
				throw new Error("No refresh token");
			}

			const baseURL = getEnv().EXPO_PUBLIC_API_URL;
			const response = await axios.post(`${baseURL}/api/auth/refresh`, {
				refreshToken,
			});

			const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
				response.data;

			await setTokens(newAccessToken, newRefreshToken);
			return newAccessToken;
		} catch (error) {
			await clearTokens();
			throw error;
		} finally {
			refreshPromise = null;
		}
	})();

	return refreshPromise;
}

apiClient.interceptors.request.use(
	async (config) => {
		// Lazy initialization baseURL - getEnv() is called here
		// but EnvGuard checks the env during rendering, so if the env is invalid,
		// ErrorBoundary will catch the error before this interceptor is called
		if (!config.baseURL) {
			config.baseURL = getEnv().EXPO_PUBLIC_API_URL;
		}

		const accessToken = await getAccessToken();
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				const newAccessToken = await refreshAccessToken();
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				return apiClient(originalRequest);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);
