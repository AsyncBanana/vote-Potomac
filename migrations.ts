// THIS IS ONLY FOR MIGRATIONS UNABLE TO BE IMPLEMENTED IN DRIZZLE-KIT
// Please implement all possible migrations using Drizzle's normal table syntax
// Hopefully the need for this will be removed
import { createClient } from "@libsql/client";
import { and, eq, ne, SQL, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { Suggestions } from "./src/schemas/suggestion.ts";
import { config } from "dotenv";
import { ContentStatus } from "./src/types/SharedContent.ts";
const { parsed: env } = config({
	path:
		process.env.TARGET_ENV === "IS"
			? "./.env.is"
			: process.env.NODE_ENV === "production"
				? "./.env.production"
				: "./.env.development",
});
if (!env) throw new Error("No env");
const client = drizzle(
	createClient({
		url: env.DATABASE_URL,
		authToken: env.DATABASE_SECRET,
	}),
);
const INSERT_NEW_SUGGESTION_QUERY = sql.raw(
	`INSERT INTO suggestions_fts (rowid, title, downvotes, votes, voteCount) VALUES (new.id, new.title, new.downvotes, new.votes, new.voteCount);`,
);
const DELETE_OLD_SUGGESTION_QUERY = sql.raw(
	`INSERT INTO suggestions_fts (suggestions_fts ,rowid, title, downvotes, votes, voteCount) VALUES ('delete', old.id, old.title, old.downvotes, old.votes, old.voteCount);`,
);
interface FTSTrigger {
	type: "INSERT" | "UPDATE" | "DELETE";
	condition?: SQL;
	update: SQL;
}
const triggers: Record<string, FTSTrigger> = {
	insert: {
		type: "INSERT",
		update: INSERT_NEW_SUGGESTION_QUERY,
		condition: eq(sql`new.status`, ContentStatus.Active),
	},
	delete: {
		type: "DELETE",
		update: DELETE_OLD_SUGGESTION_QUERY,
		condition: eq(sql`new.status`, ContentStatus.Active),
	},
	promote: {
		type: "UPDATE",
		update: INSERT_NEW_SUGGESTION_QUERY,
		condition: and(
			eq(sql`new.status`, ContentStatus.Active),
			ne(sql`old.status`, ContentStatus.Active),
		),
	},
	demote: {
		type: "UPDATE",
		update: DELETE_OLD_SUGGESTION_QUERY,
		condition: and(
			ne(sql`new.status`, ContentStatus.Active),
			eq(sql`old.status`, ContentStatus.Active),
		),
	},
	update: {
		type: "UPDATE",
		update: sql`${DELETE_OLD_SUGGESTION_QUERY} ${INSERT_NEW_SUGGESTION_QUERY}`,
		condition: and(
			eq(sql`new.status`, ContentStatus.Active),
			eq(sql`old.status`, ContentStatus.Active),
		),
	},
};
await client.transaction(async (tx) => {
	const oldTriggers = (await tx
		.select({ name: sql`name` })
		.from(sql`sqlite_master`)
		.where(eq(sql`type`, "trigger"))) as { name: string }[];
	for (let trigger of oldTriggers) {
		if (trigger.name.startsWith("__suggestion_fts")) {
			await tx.run(sql`DROP TRIGGER IF EXISTS ${sql.raw(trigger.name)}`);
		}
	}
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
	for (let [name, trigger] of Object.entries(triggers)) {
		await tx.run(sql`CREATE TRIGGER IF NOT EXISTS ${sql.raw(`__suggestion_fts_` + name)} AFTER ${sql.raw(trigger.type)} ON ${Suggestions}${sql.raw(trigger.condition ? ` WHEN ${trigger.condition?.toQuery({ inlineParams: true }).sql}` : "")}
BEGIN
	${trigger.update}
END;`);
	}
});
