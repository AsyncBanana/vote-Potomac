import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
import { CSVArray, Suggestions } from "./suggestion";
import { type SQL, sql } from "drizzle-orm";
export const Comments = sqliteTable(
	"comments",
	{
		id: integer("id").primaryKey(),
		parentId: integer("parentId")
			.references(() => Suggestions.id, { onDelete: "cascade" })
			.notNull(),
		author: text("author").notNull(), // use id
		description: text("description").notNull(),
		votes: CSVArray("votes").default([]),
		downvotes: CSVArray("downvotes").default([]),
		voteCount: integer("voteCount").generatedAlwaysAs(
			(): SQL =>
				sql`length(${Comments.votes})-length(replace(${Comments.votes}, ',', ''))-length(${Comments.downvotes})+length(replace(${Comments.downvotes}, ',', ''))`,
			{ mode: "stored" },
		),
	},
	(table) => {
		return {
			titleVoteIdx: index("parentIdx").on(
				table.parentId,
				table.id,
				table.description,
				table.votes,
				table.downvotes,
				table.voteCount,
			), // used for listing pages
		};
	},
);
export const CommentQueue = sqliteTable("commentQueue", {
	id: integer("id").primaryKey().$defaultFn(generateDendrite),
	parentId: integer("parentId")
		.references(() => Suggestions.id, { onDelete: "cascade" })
		.notNull(),
	author: text("author").notNull(), // use id
	description: text("description").notNull(),
	votes: CSVArray("votes").default([]),
	downvotes: CSVArray("downvotes").default([]),
});
export type CommentQueueSelect = typeof CommentQueue.$inferSelect;
