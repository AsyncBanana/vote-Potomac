import {
	customType,
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
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
		return value.join(",") + ",";
	},
});
export const Suggestions = sqliteTable(
	"suggestions",
	{
		id: integer("id").primaryKey(),
		author: text("author").notNull(), // use id
		title: text("title").notNull(),
		description: text("description").notNull(),
		votes: CSVArray("votes"),
	},
	(table) => {
		return {
			titleVoteIdx: index("titleVoteIdx").on(table.title, table.votes), // used for listing pages
		};
	},
);
export const SuggestionQueue = sqliteTable("suggestionQueue", {
	id: integer("id").primaryKey().$defaultFn(generateDendrite),
	author: text("author").notNull(), // use id
	title: text("title").notNull(),
	description: text("description").notNull(),
	votes: CSVArray("votes"),
});
