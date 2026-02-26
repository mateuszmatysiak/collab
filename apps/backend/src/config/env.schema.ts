import { z } from "zod";

export const backendEnvSchema = z.object({
	DATABASE_URL: z.string().min(1),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	JWT_SECRET: z.string().min(32),
	PORT: z.coerce.number().min(1).max(65535).default(3000),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
