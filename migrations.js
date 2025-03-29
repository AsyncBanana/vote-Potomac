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
await client.transaction(async (tx) => {
	await tx.run(sql`DROP TRIGGER IF EXISTS suggestions_ai`);
	await tx.run(sql`DROP TRIGGER IF EXISTS suggestions_ad`);
	await tx.run(sql`DROP TRIGGER IF EXISTS suggestions_au`);
	await tx.run(sql`DROP TABLE IF EXISTS suggestions_fts`);
	await tx.run(sql`CREATE VIRTUAL TABLE IF NOT EXISTS suggestions_fts USING fts5(
		id,
		title,
		votes UNINDEXED,
		downvotes UNINDEXED,
		voteCount UNINDEXED,
		content='suggestions',
		content_rowid='id'
	)`);
	await tx.run(sql`CREATE TRIGGER IF NOT EXISTS suggestions_ai AFTER INSERT ON ${Suggestions}
	BEGIN
		INSERT INTO suggestions_fts (rowid, title, downvotes, votes, voteCount)
		VALUES (new.id, new.title, new.downvotes, new.votes, new.voteCount);
	END;
	`);
	await tx.run(sql`CREATE TRIGGER IF NOT EXISTS suggestions_ad AFTER DELETE ON ${Suggestions}
	BEGIN
		INSERT INTO suggestions_fts (suggestions_fts, rowid, title, downvotes, votes, voteCount)
		VALUES ('delete', old.id, old.title, old.downvotes, old.votes, old.voteCount);
	END;
	`);
	await tx.run(sql`CREATE TRIGGER IF NOT EXISTS suggestions_au AFTER UPDATE ON ${Suggestions}
	BEGIN
		INSERT INTO suggestions_fts (suggestions_fts ,rowid, title, downvotes, votes, voteCount)
		VALUES ('delete', old.id, old.title, old.downvotes, old.votes, old.voteCount);
		INSERT INTO suggestions_fts (rowid, title, downvotes, votes, voteCount)
		VALUES (new.id, new.title, new.downvotes, new.votes, new.voteCount);
	END;
	`);
	await tx.run(
		sql`INSERT INTO suggestions_fts (rowid, title, downvotes, votes, voteCount) SELECT id, title, downvotes, votes, voteCount FROM ${Suggestions} WHERE true`,
	);
});
