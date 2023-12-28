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
	const [[res], [authorData]] = await ctx.locals.db.batch([
		ctx.locals.db
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
	if (res && authorData.voteNotifications) {
		ctx.locals.runtime.waitUntil(
			sendEmail({
				from: {
					email: "notifications@votepotomac.com",
					name: "Votepotomac Notifications",
				},
				personalizations: {
					to: [{ name: authorData.name, email: authorData.email }],
				},
				subject: `Your ${type} has been voted for!`,
				content: [
					{
						type: "text/html",
						value: VoteTemplate.replaceAll(
							"{{title}}",
							res.title /* differences between comments and suggestions handled above */,
						)
							.replaceAll("{{votes}}", (res.voteCount || 0).toString())
							.replaceAll("{{type}}", type),
					},
				],
			}).then((res) =>
				res.success === false ? console.error(res.errors) : "",
			),
		);
	}
	return new Response("Successfully voted for content");
};
