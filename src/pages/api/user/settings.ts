import type { APIRoute } from "astro";
import { Users } from "../../../schemas/user";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (ctx) => {
	const session = await ctx.locals.getSession();
	if (!session)
		return new Response("Unauthenticated", {
			status: 401,
		});

	const body = await ctx.request.formData();
	const res = await ctx.locals.db
		.update(Users)
		.set({
			moderationNotifications: body.get("moderationNotifications") === "on",
			voteNotifications: body.get("voteNotifications") === "on",
			replyNotifications: body.get("replyNotifications") === "on",
		})
		.where(eq(Users.id, session.id));
	console.log(res);
	return ctx.redirect("/settings");
};
