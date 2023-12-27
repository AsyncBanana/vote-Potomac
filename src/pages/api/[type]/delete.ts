import type { APIRoute } from "astro";
import { verifyJWT } from "../../../modules/auth";
import { Suggestions } from "../../../schemas/suggestion";
import { and, eq } from "drizzle-orm";
import { UserRole } from "../../../schemas/user";
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
		return new Response(`Content ID not provided or invalid number`, {
			status: 400,
		});
	const user = await ctx.locals.getSession();
	if (!user)
		return new Response("Not signed in", {
			status: 401,
		});
	// this feels kind of sketchy, maybe change to explicit ternaries in each place where the table is used
	const contentTable = type === "suggestion" ? Suggestions : Comments;
	const res = await ctx.locals.db
		.delete(contentTable)
		.where(
			user.role >= UserRole.admin
				? eq(contentTable.id, contentId)
				: and(eq(contentTable.id, contentId), eq(contentTable.author, userId)),
		)
		.execute();
	return new Response("Successfully deleted content");
};
