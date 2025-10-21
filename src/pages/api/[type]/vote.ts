import type { APIRoute } from "astro";
import { Suggestions } from "../../../schemas/suggestion";
import { verifyJWT } from "../../../modules/auth";
import { and, eq, isNull, not, or, sql } from "drizzle-orm";
import { Comments } from "../../../schemas/comment";
import { sendEmail } from "../../../modules/email";
import VoteTemplate from "../../../email/vote.mjml";
import { Users } from "../../../schemas/user";
export const POST: APIRoute = async (ctx) => {
	const { type } = ctx.params;
	if (type !== "comment" && type !== "suggestion")
		return new Response("Not found", { status: 404 });
	const authData = ctx.cookies.get("authData")?.value;
	const userId =
		authData && (await verifyJWT(ctx.locals.runtime.env, authData));
	if (!userId) {
		return new Response("Not signed in", {
			status: 401,
		});
	}
	const { id: contentId, vote } = (await ctx.request.json()) as {
		id: number;
		vote: "up" | "down";
	};
	if (isNaN(contentId))
		return new Response("Content ID not provided or invalid number", {
			status: 400,
		});
	if (vote !== "up" && vote !== "down") {
	}
	const contentTable = type === "suggestion" ? Suggestions : Comments;
	const [[res], [authorData]] = await ctx.locals.db.batch([
		ctx.locals.db
			.update(contentTable)
			.set({
				votes:
					vote == "up"
						? sql`(coalesce(${contentTable.votes},'') || ${userId} || ',')`
						: sql`replace(${contentTable.votes}, ${userId} || ',', '')`,
				downvotes:
					vote == "down"
						? sql`(coalesce(${contentTable.downvotes},'') || ${userId} || ',')`
						: sql`replace(${contentTable.downvotes}, ${userId} || ',', '')`,
			})
			.where(
				and(
					eq(contentTable.id, contentId),
					or(
						isNull(contentTable.votes),
						vote === "up"
							? not(sql`instr(${contentTable.votes},${userId})`)
							: not(sql`instr(${contentTable.downvotes},${userId})`),
					),
				),
			)
			.returning({
				voteCount: contentTable.voteCount,
				title: type === "suggestion" ? Suggestions.title : Comments.description,
			}),
		ctx.locals.db
			.select({
				voteNotifications: Users.voteNotifications,
				name: Users.name,
				email: Users.email,
			})
			.from(Users)
			.where(
				sql`${Users.id} IN ${ctx.locals.db
					.select({ id: contentTable.author })
					.from(contentTable)
					.where(eq(contentTable.id, contentId))}`,
			),
	]);
	if (res && authorData.voteNotifications && import.meta.env.PROD) {
		ctx.locals.runtime.ctx.waitUntil(
			sendEmail(
				{
					to: [authorData.email],
					subject:
						vote === "up"
							? `Your ${type} has been voted for!`
							: `Your ${type} has been downvoted`,
					html: VoteTemplate.replaceAll(
						"{{message}}",
						vote === "up"
							? `Your ${type} "${res.title}" has been voted for!`
							: `Your ${type} "${res.title}" has been downvoted. Sorry.`,
					)
						.replaceAll("{{votes}}", (res.voteCount || 0).toString())
						.replaceAll("{{type}}", type),
				},
				ctx.locals.runtime.env,
			).then((res) => (res.error ? console.error(res.error) : "")),
		);
	}
	return new Response("Successfully voted for content");
};
