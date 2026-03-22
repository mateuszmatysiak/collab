import { z } from "zod";

export const registerSchema = z.object({
	name: z
		.string({ message: "Imię i nazwisko jest wymagane" })
		.trim()
		.min(1, "Imię i nazwisko jest wymagane")
		.max(255, "Imię i nazwisko nie może przekraczać 255 znaków"),
	login: z
		.string({ message: "Login jest wymagany" })
		.trim()
		.min(1, "Login jest wymagany")
		.max(255, "Login nie może przekraczać 255 znaków"),
	password: z
		.string({ message: "Hasło jest wymagane" })
		.trim()
		.min(6, "Hasło musi mieć minimum 6 znaków")
		.max(255, "Hasło nie może przekraczać 255 znaków"),
});

export const loginSchema = z.object({
	login: z
		.string({ message: "Login jest wymagany" })
		.trim()
		.min(1, "Login jest wymagany")
		.max(255, "Login nie może przekraczać 255 znaków"),
	password: z
		.string({ message: "Hasło jest wymagane" })
		.trim()
		.min(1, "Hasło jest wymagane")
		.max(255, "Hasło nie może przekraczać 255 znaków"),
});

export const refreshTokenSchema = z.object({
	refreshToken: z.uuid(),
});

export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
