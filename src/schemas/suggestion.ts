import {
	customType,
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
import { sql, type SQL } from "drizzle-orm";
export const CSVArray = customType<{
	data: string[];
	driverData: string;
}>({
	dataType() {
		return `text`;
	},
	fromDriver(value: string): string[] {
		return value.split(",").filter((val) => val /* only truthy values */);
	},
	toDriver(value: string[]): string {
		return value.join(",") + (value.length > 0 ? "," : "");
	},
});
export const Suggestions = sqliteTable(
	"suggestions",
	{
		id: integer("id").primaryKey(),
		author: text("author").notNull(), // use id
		title: text("title").notNull(),
		description: text("description").notNull(),
		votes: CSVArray("votes").default([]),
		downvotes: CSVArray("downvotes").default([]),
		voteCount: integer("voteCount").generatedAlwaysAs(
			(): SQL =>
				sql`length(${Suggestions.votes})-length(replace(${Suggestions.votes}, ',', ''))-length(${Suggestions.downvotes})+length(replace(${Suggestions.downvotes}, ',', ''))`,
			{ mode: "stored" },
		),
	},
	(table) => {
		return {
			titleVoteIdx: index("titleVoteIdx").on(
				table.title,
				table.voteCount,
				table.votes,
				table.downvotes,
				table.id,
			), // used for listing pages
		};
	},
);
export const SuggestionQueue = sqliteTable("suggestionQueue", {
	id: integer("id").primaryKey().$defaultFn(generateDendrite),
	author: text("author").notNull(), // use id
	title: text("title").notNull(),
	description: text("description").notNull(),
	votes: CSVArray("votes").default([]),
	downvotes: CSVArray("downvotes").default([]),
});
export type SuggestionQueueSelect = typeof SuggestionQueue.$inferSelect;
