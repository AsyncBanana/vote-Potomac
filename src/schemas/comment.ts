import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
import { CSVArray, Suggestions } from "./suggestion";
import { eq, type SQL, sql } from "drizzle-orm";
import { ContentStatus } from "../types/SharedContent";
export const Comments = sqliteTable(
	"comments",
	{
		id: integer("id").primaryKey().$defaultFn(generateDendrite),
		parentId: integer("parentId")
			.references(() => Suggestions.id, { onDelete: "cascade" })
			.notNull(),
		status: integer("status")
			.$type<ContentStatus>()
			.default(ContentStatus.ModerationQueue),
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
export type Comment = typeof Comments.$inferSelect;
