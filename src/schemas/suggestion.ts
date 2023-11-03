import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
export const Suggestions = sqliteTable(
	"suggestions",
	{
		id: integer("id").primaryKey(),
		author: text("author").notNull(), // use id
		title: text("title").notNull(),
		description: text("description").notNull(),
		upvotes: text("upvotes", { mode: "json" }),
	},
	(table) => {
		return {
			titleUpvoteIdx: index("titleUpvoteIdx").on(table.title, table.upvotes), // used for listing pages
		};
	},
);
export const SuggestionQueue = sqliteTable("suggestionQueue", {
	id: integer("id").primaryKey().$defaultFn(generateDendrite),
	author: text("author").notNull(), // use id
	title: text("title").notNull(),
	description: text("description").notNull(),
	upvotes: text("upvotes", { mode: "json" }),
});
