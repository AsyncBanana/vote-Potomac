import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { CSVArray } from "./suggestion";
export const SuggestionsFTS = sqliteTable("suggestions_fts", {
	id: integer("id").primaryKey(),
	title: text("title").notNull(),
	voteCount: integer("voteCount"),
	votes: CSVArray("votes"),
	downvotes: CSVArray("downvotes"),
});
