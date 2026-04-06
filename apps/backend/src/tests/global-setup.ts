import { resolve } from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: resolve(__dirname, "../../.env.test") });

export async function setup() {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required for tests");
	}

	console.log("[Global Setup] Connecting to test database...");

	const migrationClient = postgres(databaseUrl, { max: 1 });
	const db = drizzle(migrationClient);

	console.log("[Global Setup] Running migrations...");

	try {
		await migrate(db, {
			migrationsFolder: resolve(__dirname, "../../drizzle"),
		});
		console.log("[Global Setup] Migrations complete");
	} catch (error) {
		console.error("[Global Setup] Migration failed:", error);
		throw error;
	} finally {
		await migrationClient.end();
	}
}

export async function teardown() {
	console.log("[Global Teardown] Test suite complete");
}
