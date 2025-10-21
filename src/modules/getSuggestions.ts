import type { APIContext } from "astro";
import { sql, and, eq, exists, desc } from "drizzle-orm";
import { SuggestionsFTS } from "../schemas/fts";
import {
	FoodLocation,
	Suggestions as SuggestionsTable,
} from "../schemas/suggestion";
import { ContentStatus } from "../types/SharedContent";
export interface QuestionQueryConfig {
	query?: string | null;
	offset?: number;
	sort?: "top" | "recent";
	isFood?: boolean;
	foodLocation?: FoodLocation;
}
export default function getSuggestions(
	{ query, offset, sort, isFood, foodLocation }: QuestionQueryConfig,
	ctx: APIContext,
) {
	return query
		? ctx.locals.db
				.select({
					id: SuggestionsFTS.id,
					title: SuggestionsFTS.title,
					voteCount: SuggestionsFTS.voteCount,
					votes: SuggestionsFTS.votes,
					downvotes: SuggestionsFTS.downvotes,
					// gets the type system to cooperate. In the future I could replace this with actual type changes
					metadata: sql<undefined>`NULL`,
				})
				.from(SuggestionsFTS)
				.where(sql`${SuggestionsFTS.title} MATCH ${query}`)
				.offset(offset || 0) // Could prevent scan of results by implementing offset using votes/date
				.limit(30)
				.orderBy(sql`rank`)
		: ctx.locals.db
				.select({
					id: SuggestionsTable.id,
					title: SuggestionsTable.title,
					voteCount: SuggestionsTable.voteCount,
					votes: SuggestionsTable.votes,
					downvotes: SuggestionsTable.downvotes,
					metadata: SuggestionsTable.metadata,
				})
				.from(SuggestionsTable)
				.where(
					and(
						eq(
							SuggestionsTable.status,
							isFood ? ContentStatus.FoodActive : ContentStatus.Active,
						),
						isFood && foodLocation
							? exists(
									ctx.locals.db
										.select({ v: sql`1` })
										.from(
											sql`json_each(${SuggestionsTable.metadata}-> 'locations')`,
										)
										.where(eq(sql`value`, foodLocation)),
								)
							: undefined,
					),
				)
				.limit(30)

				.orderBy(
					desc(
						sort === "top" ? SuggestionsTable.voteCount : SuggestionsTable.id,
					),
				)
				.offset(offset || 0);
}
