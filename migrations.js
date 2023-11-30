// THIS IS ONLY FOR MIGRATIONS UNABLE TO BE IMPLEMENTED IN DRIZZLE-KIT
// Please implement all possible migrations using Drizzle's normal table syntax
// Hopefully the need for this will be removed
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { Suggestions } from "./src/schemas/suggestion.ts";
import { config } from "dotenv";

const { parsed: env } = config({
	path:
		process.env.NODE_ENV === "production"
			? "./.dev.vars"
			: "./.env.development",
});
const client = drizzle(
	createClient({
		url: env.DATABASE_URL,
		authToken: env.DATABASE_SECRET,
	}),
);
await client.run(sql`CREATE VIRTUAL TABLE IF NOT EXISTS suggestions_fts USING fts5(
    title,
    votes UNINDEXED,
    content='suggestions',
    content_rowid='id'
)`);
client.batch([
	client.run(sql`CREATE TRIGGER IF NOT EXISTS suggestions_ai AFTER INSERT ON ${Suggestions}
BEGIN
    INSERT INTO suggestions_fts (rowid, title, votes)
    VALUES (new.id, new.title, new.votes);
END;
`),
	client.run(sql`CREATE TRIGGER IF NOT EXISTS suggestions_ad AFTER DELETE ON ${Suggestions}
BEGIN
    INSERT INTO suggestions_fts (suggestions_fts ,rowid, title, votes)
    VALUES ('delete', old.id, old.title, old.votes);
END;
`),
	client.run(sql`CREATE TRIGGER IF NOT EXISTS suggestions_au AFTER UPDATE ON ${Suggestions}
BEGIN
    INSERT INTO suggestions_fts (suggestions_fts ,rowid, title, votes)
    VALUES ('delete', new.id, new.title, new.votes);
    INSERT INTO suggestions_fts (rowid, title, votes)
    VALUES (new.id, new.title, new.votes);
END;
`),
]);
