import type { Context, Next } from "hono";
import { UnauthorizedError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export async function authMiddleware(c: Context, next: Next) {
	const authHeader = c.req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new UnauthorizedError("Brak tokenu autoryzacyjnego");
	}

	const tokenWithoutBearer = authHeader.substring(7);

	try {
		const payload = verifyAccessToken(tokenWithoutBearer);
		c.set("userId", payload.userId);
		await next();
	} catch (_error) {
		throw new UnauthorizedError("Nieprawidłowy lub wygasły token");
	}
}
