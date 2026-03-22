import type { User } from "@collab-list/shared/types";
import type {
	LoginRequest,
	RegisterRequest,
} from "@collab-list/shared/validators";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { useLogin, useLogout, useMe, useRegister } from "@/api/auth.api";
import { clearTokens, getRefreshToken, setTokens } from "@/lib/storage";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (login: string, password: string) => Promise<void>;
	register: (name: string, login: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider(props: PropsWithChildren) {
	const { children } = props;

	const { mutateAsync: loginAsync } = useLogin();
	const { mutateAsync: registerAsync } = useRegister();
	const { mutateAsync: logoutAsync } = useLogout();
	const queryClient = useQueryClient();

	const { data: meData, isLoading: isMeLoading, refetch } = useMe();

	const login = useCallback(
		async (login: string, password: string) => {
			const data: LoginRequest = { login, password };
			const response = await loginAsync(data);

			await setTokens(response.accessToken, response.refreshToken);
			await refetch();
		},
		[loginAsync, refetch],
	);

	const register = useCallback(
		async (name: string, login: string, password: string) => {
			const data: RegisterRequest = { name, login, password };
			const response = await registerAsync(data);

			await setTokens(response.accessToken, response.refreshToken);
			await refetch();
		},
		[registerAsync, refetch],
	);

	const logout = useCallback(async () => {
		try {
			const refreshToken = await getRefreshToken();
			if (refreshToken) {
				await logoutAsync({ refreshToken });
			}
		} catch (_error) {
		} finally {
			await clearTokens();
			queryClient.clear();
		}
	}, [logoutAsync, queryClient]);

	const refetchUser = useCallback(async () => {
		await refetch();
	}, [refetch]);

	const memoizedValue: AuthContextType = useMemo(
		() => ({
			user: meData?.user ?? null,
			isLoading: isMeLoading,
			isAuthenticated: meData?.user != null,
			login,
			register,
			logout,
			refetchUser,
		}),
		[meData?.user, isMeLoading, login, register, logout, refetchUser],
	);

	return (
		<AuthContext.Provider value={memoizedValue}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}
