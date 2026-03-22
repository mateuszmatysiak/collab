import type {
	LoginRequest,
	RefreshTokenRequest,
	RegisterRequest,
} from "@collab-list/shared/validators";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_STALE_TIME_MS } from "@/lib/constants";
import { apiClient } from "./client";
import { queryKeys } from "./queryKeys";

export function useLogin() {
	return useMutation({
		mutationFn: (data: LoginRequest) =>
			apiClient.post("/api/auth/login", data).then((res) => res.data),
	});
}

export function useRegister() {
	return useMutation({
		mutationFn: (data: RegisterRequest) =>
			apiClient.post("/api/auth/register", data).then((res) => res.data),
	});
}

export function useLogout() {
	return useMutation({
		mutationFn: (data: RefreshTokenRequest) =>
			apiClient.post("/api/auth/logout", data).then((res) => res.data),
	});
}

export function useMe(enabled = true) {
	return useQuery({
		queryKey: queryKeys.auth.me,
		queryFn: () => apiClient.get("/api/auth/me").then((res) => res.data),
		enabled,
		retry: false,
		staleTime: QUERY_STALE_TIME_MS,
	});
}
