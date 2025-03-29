import type { APIRoute } from "astro";
import { Suggestions } from "../../../schemas/suggestion";
import { verifyJWT } from "../../../modules/auth";
import { and, eq, or, sql } from "drizzle-orm";
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
			votes: sql`replace(${contentTable.votes}, ${userId} || ',', '')`,
			downvotes: sql`replace(${contentTable.votes}, ${userId} || ',', '')`,
		})
		.where(
			and(
				eq(contentTable.id, contentId),
				or(
					sql`instr(${contentTable.votes},${userId})`,
					sql`instr(${contentTable.downvotes},${userId})`,
				),
			),
		)
		.run();
	return new Response("Successfully removed vote for content");
};
