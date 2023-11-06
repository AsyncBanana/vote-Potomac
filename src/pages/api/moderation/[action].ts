import type { APIRoute } from "astro";
import { SuggestionQueue, Suggestions } from "../../../schemas/suggestion";
import { eq, sql } from "drizzle-orm";

export const POST: APIRoute = async (ctx) => {
	const id = +(await ctx.request.text());
	const action = ctx.params.action;
	if (action === "reject") {
		await ctx.locals.db
			.delete(SuggestionQueue)
			.where(eq(SuggestionQueue.id, id))
			.run();
		return new Response("Rejected comment", {
			status: 200,
		});
	} else if (action === "approve") {
		await ctx.locals.db.batch([
			ctx.locals.db.run(
				sql`insert into ${Suggestions} select * from ${SuggestionQueue} where ${SuggestionQueue.id} = ${id}`,
			),
			ctx.locals.db.delete(SuggestionQueue),
		]);
		return new Response("Approved comment", {
			status: 200,
		});
	}
	return new Response("Invalid action", {
		status: 400,
	});
};
export const prerender = false;
