import { config } from "dotenv";

const { parsed: env } = config({
	path:
		process.env.NODE_ENV === "production"
			? "./.dev.vars"
			: "./.env.development",
});
/** @type { import("drizzle-kit").Config } */
export default {
	schema: "./src/schemas/!(fts)*.ts",
	dialect: process.env.NODE_ENV === "production" ? "turso" : "sqlite",
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DATABASE_SECRET,
	},
	out: "migrations",
};
