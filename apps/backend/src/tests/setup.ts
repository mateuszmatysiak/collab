import { resolve } from "node:path";
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, beforeEach } from "vitest";
import * as schema from "../db/schema";

config({ path: resolve(__dirname, "../../.env.test") });

let testClient: ReturnType<typeof postgres> | null = null;
let testDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getTestDb() {
	if (!testDb) {
		throw new Error("Test database not initialized. Ensure setup has run.");
	}
	return testDb;
}

export async function cleanupDatabase() {
	if (!testDb) {
		throw new Error("Test database not initialized");
	}

	await testDb.execute(sql`
		TRUNCATE TABLE
			list_items,
			list_shares,
			refresh_tokens,
			user_categories,
			lists,
			users,
			system_categories
		CASCADE
	`);
}

beforeAll(async () => {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required");
	}

	testClient = postgres(databaseUrl);
	testDb = drizzle(testClient, { schema });
});

afterAll(async () => {
	if (testClient) {
		await testClient.end();
		testClient = null;
		testDb = null;
	}
});

beforeEach(async () => {
	await cleanupDatabase();
});
