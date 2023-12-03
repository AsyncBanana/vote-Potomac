import type { APIRoute } from "astro";
import { Suggestions } from "../../../schemas/suggestion";
import { verifyJWT } from "../../../modules/auth";
import { and, eq, isNull, not, or, sql } from "drizzle-orm";
export const POST: APIRoute = async (ctx) => {
	const authData = ctx.cookies.get("authData")?.value;
	const userId = authData && (await verifyJWT(authData));
	if (!userId) {
		return new Response("Not signed in", {
			status: 401,
		});
	}
	const suggestionId = +(await ctx.request.text());
	if (isNaN(suggestionId))
		return new Response("Suggestion ID not provided or invalid number", {
			status: 400,
		});
	const res = await ctx.locals.db
		.update(Suggestions)
		.set({
			votes: sql`(coalesce(${Suggestions.votes},"") || ${userId} || ",")`,
			voteCount: sql`${Suggestions.voteCount}+1`,
		})
		.where(
			and(
				eq(Suggestions.id, suggestionId),
				or(
					isNull(Suggestions.votes),
					not(sql`instr(${Suggestions.votes},${userId})`),
				),
			),
		)
		.run();
	return new Response("Successfully voted for suggestion");
};
