import {
	loginSchema,
	refreshTokenSchema,
	registerSchema,
} from "@collab-list/shared/validators";
import type { Context } from "hono";
import { authMiddleware } from "../middleware/auth";
import {
	authenticateUser,
	createUser,
	getUserById,
} from "../services/auth.service";
import {
	createRefreshToken,
	refreshAccessToken,
	revokeRefreshToken,
} from "../services/token.service";
import { generateAccessToken } from "../utils/jwt";
import { createJsonValidator, getValidatedJson } from "../utils/validator";

export const register = [
	createJsonValidator(registerSchema),
	async (c: Context) => {
		const { name, login, password } = getValidatedJson(c, registerSchema);

		const user = await createUser(name, login, password);

		const accessToken = generateAccessToken(user.id);
		const refreshToken = await createRefreshToken(user.id);

		return c.json({
			user: {
				id: user.id,
				name: user.name,
				login: user.login,
				createdAt: user.createdAt,
			},
			accessToken,
			refreshToken,
		});
	},
];

export const login = [
	createJsonValidator(loginSchema),
	async (c: Context) => {
		const { login, password } = getValidatedJson(c, loginSchema);

		const user = await authenticateUser(login, password);

		const accessToken = generateAccessToken(user.id);
		const refreshToken = await createRefreshToken(user.id);

		return c.json({
			user: {
				id: user.id,
				name: user.name,
				login: user.login,
				createdAt: user.createdAt,
			},
			accessToken,
			refreshToken,
		});
	},
];

export const refresh = [
	createJsonValidator(refreshTokenSchema),
	async (c: Context) => {
		const { refreshToken } = getValidatedJson(c, refreshTokenSchema);

		const tokens = await refreshAccessToken(refreshToken);

		return c.json(tokens);
	},
];

export const logout = [
	authMiddleware,
	createJsonValidator(refreshTokenSchema),
	async (c: Context) => {
		const { refreshToken } = getValidatedJson(c, refreshTokenSchema);
		const userId = c.get("userId");

		const user = await getUserById(userId);

		await revokeRefreshToken(refreshToken);

		return c.json({
			message: "Wylogowano pomyślnie",
			login: user.login,
		});
	},
];

export const me = [
	authMiddleware,
	async (c: Context) => {
		const userId = c.get("userId");

		const user = await getUserById(userId);

		return c.json({
			user: {
				id: user.id,
				name: user.name,
				login: user.login,
				createdAt: user.createdAt,
			},
		});
	},
];
