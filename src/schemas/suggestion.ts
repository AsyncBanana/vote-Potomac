import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
export const Suggestions = sqliteTable("suggestions", {
	id: integer("id").primaryKey(),
	author: text("author").notNull(), // use email, email changes should not be an issue and I am too lazy to set up an actual user data storage system
	title: text("title").notNull(),
	description: text("description").notNull(),
	upvotes: text("upvotes", { mode: "json" }),
});
export const SuggestionQueue = sqliteTable("suggestionQueue", {
	id: integer("id").primaryKey().$defaultFn(generateDendrite),
	author: text("author").notNull(), // use email, email changes should not be an issue and I am too lazy to set up an actual user data storage system
	title: text("title").notNull(),
	description: text("description").notNull(),
	upvotes: text("upvotes", { mode: "json" }),
});
