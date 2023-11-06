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
			votes: sql`replace(${Suggestions.votes},${userId}||",","")`,
		})
		.where(
			and(
				eq(Suggestions.id, suggestionId),
				sql`instr(${Suggestions.votes},${userId})`,
			),
		)
		.run();
	return new Response("Successfully voted for suggestion");
};
