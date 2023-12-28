import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
import { CSVArray, Suggestions } from "./suggestion";
export const Comments = sqliteTable(
	"comments",
	{
		id: integer("id").primaryKey(),
		parentId: integer("parentId")
			.references(() => Suggestions.id, { onDelete: "cascade" })
			.notNull(),
		author: text("author").notNull(), // use id
		description: text("description").notNull(),
		votes: CSVArray("votes"),
		// change to generated column `VoteCount()` when drizzle is fixed
		voteCount: integer("voteCount").default(0),
	},
	(table) => {
		return {
			titleVoteIdx: index("parentIdx").on(
				table.parentId,
				table.id,
				table.description,
				table.votes,
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
	votes: CSVArray("votes"),
	voteCount: integer("voteCount").default(0),
});
export type CommentQueueSelect = typeof CommentQueue.$inferSelect;
