import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const suggestions = sqliteTable("suggestions", {
	author: text("author").notNull(), // use email, email changes should not be an issue and I am too lazy to set up an actual user data storage system
	title: text("title").notNull(),
	description: text("description").notNull(),
	upvotes: integer("upvotes").default(0),
});
