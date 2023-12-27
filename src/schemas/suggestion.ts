import {
	customType,
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { generateDendrite } from "../modules/dendrite";
import type { InferSelectModel } from "drizzle-orm";
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
export const VoteCount = customType<{
	data: number;
	driverData: number;
}>({
	dataType() {
		return `INT GENERATED ALWAYS as (LENGTH(votes) - LENGTH(REPLACE(votes, ',', ''))) STORED`;
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
		// change to generated column `VoteCount()` when drizzle is fixed
		voteCount: integer("voteCount").default(0),
	},
	(table) => {
		return {
			titleVoteIdx: index("titleVoteIdx").on(
				table.title,
				table.voteCount,
				table.votes,
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
	votes: CSVArray("votes"),
	voteCount: integer("voteCount").default(0),
});
export type SuggestionQueueSelect = InferSelectModel<typeof SuggestionQueue>;
