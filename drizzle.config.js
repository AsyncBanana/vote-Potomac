import { config } from "dotenv";

const { parsed: env } = config({
	path:
		process.env.NODE_ENV === "production"
			? "./.dev.vars"
			: "./.env.development",
});

/** @type { import("drizzle-kit").Config } */
export default {
	schema: "./src/schemas/*.ts",
	driver: process.env.NODE_ENV === "production" ? "turso" : "libsql",
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DATABASE_SECRET,
	},
};
