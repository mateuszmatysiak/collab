import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { getEnv } from "./config/env";

const app = createApp();

const port = getEnv().PORT;

console.log(`Server starting on port ${port}...`);
console.log(`Environment: ${getEnv().NODE_ENV}`);

const server = serve(
	{
		fetch: app.fetch,
		port: Number(port),
		hostname: "0.0.0.0",
	},
	() => {
		console.log(`Server is running on http://0.0.0.0:${Number(port)}`);
		console.log(`Local: http://localhost:${Number(port)}`);
	},
);

const shutdown = () => {
	console.log("\nShutting down server...");
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
