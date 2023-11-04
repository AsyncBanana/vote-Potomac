import type { APIRoute } from "astro";
import { SuggestionQueue } from "../../../schemas/suggestion";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async (ctx) => {
	await ctx.locals;
	const id = +ctx.request.text();
	const action = ctx.params.action;
	if (action === "reject") {
		await ctx.locals.db
			.delete(SuggestionQueue)
			.where(eq(SuggestionQueue.id, id))
			.run();
	} else if (action === "accept") {
	}
};
