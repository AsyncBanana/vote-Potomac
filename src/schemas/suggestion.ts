import {
	blob,
	customType,
	index,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { sql, type SQL } from "drizzle-orm";
import { ContentStatus } from "../types/SharedContent";
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
		return value.join(",") + (value.length > 0 ? "," : "");
	},
});

export const FoodLocation = {
	vending: 1,
	breakfast: 2,
	pantherpit: 3,
} as const;
export type FoodLocation = (typeof FoodLocation)[keyof typeof FoodLocation];
export interface SuggestionMetadata {
	locations?: (typeof FoodLocation)[keyof typeof FoodLocation][];
}
export const Suggestions = sqliteTable(
	"suggestions",
	{
		id: integer("id").primaryKey().$defaultFn(generateDendrite),
		voteCount: integer("voteCount").generatedAlwaysAs(
			(): SQL =>
				sql`length(${Suggestions.votes})-length(replace(${Suggestions.votes}, ',', ''))-length(${Suggestions.downvotes})+length(replace(${Suggestions.downvotes}, ',', ''))`,
			{ mode: "stored" },
		),
		status: integer("status")
			.$type<ContentStatus>()
			.default(ContentStatus.ModerationQueue),
		author: text("author").notNull(), // use id
		title: text("title").notNull(),
		description: text("description"),
		votes: CSVArray("votes").default([]),
		downvotes: CSVArray("downvotes").default([]),
		metadata: text("metadata", { mode: "json" }).$type<SuggestionMetadata>(),
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
export type Suggestion = typeof Suggestions.$inferSelect;
