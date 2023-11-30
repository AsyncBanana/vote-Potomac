import type { APIRoute } from "astro";
import { verifyJWT } from "../../../modules/auth";
import { Suggestions } from "../../../schemas/suggestion";
import { and, eq } from "drizzle-orm";
import { UserRole } from "../../../schemas/user";

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
	const user = await ctx.locals.getSession();
	if (!user)
		return new Response("Not signed in", {
			status: 401,
		});
	const res = await ctx.locals.db
		.delete(Suggestions)
		.where(
			user.role >= UserRole.admin
				? eq(Suggestions.id, suggestionId)
				: and(eq(Suggestions.id, suggestionId), eq(Suggestions.author, userId)),
		)
		.execute();
	return new Response("Successfully deleted suggestion");
};
