import type { APIRoute } from "astro";
import { Suggestions } from "../../../schemas/suggestion";
import { verifyJWT } from "../../../modules/auth";
import { and, eq, isNull, not, or, sql } from "drizzle-orm";
import { Comments } from "../../../schemas/comment";
export const POST: APIRoute = async (ctx) => {
	const { type } = ctx.params;
	if (type !== "comment" && type !== "suggestion")
		return new Response("Not found", { status: 404 });
	const authData = ctx.cookies.get("authData")?.value;
	const userId = authData && (await verifyJWT(authData));
	if (!userId) {
		return new Response("Not signed in", {
			status: 401,
		});
	}
	const contentId = +(await ctx.request.text());
	if (isNaN(contentId))
		return new Response("Content ID not provided or invalid number", {
			status: 400,
		});
	const contentTable = type === "suggestion" ? Suggestions : Comments;
	const res = await ctx.locals.db
		.update(contentTable)
		.set({
			votes: sql`(coalesce(${contentTable.votes},"") || ${userId} || ",")`,
			voteCount: sql`${contentTable.voteCount}+1`,
		})
		.where(
			and(
				eq(contentTable.id, contentId),
				or(
					isNull(contentTable.votes),
					not(sql`instr(${contentTable.votes},${userId})`),
				),
			),
		)
		.run();
	return new Response("Successfully voted for content");
};
