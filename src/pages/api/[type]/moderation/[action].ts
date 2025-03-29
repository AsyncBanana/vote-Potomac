import type { APIRoute } from "astro";
import {
	SuggestionQueue,
	Suggestions,
	type SuggestionQueueSelect,
} from "../../../../schemas/suggestion";
import { and, eq, sql } from "drizzle-orm";
import {
	CommentQueue,
	Comments,
	type CommentQueueSelect,
} from "../../../../schemas/comment";
import ApprovalTemplate from "../../../../email/approval.mjml";
import RejectionTemplate from "../../../../email/rejection.mjml";
import ReplyTemplate from "../../../../email/reply.mjml";
import { Users, type UsersSelect } from "../../../../schemas/user";
import { sendEmail } from "../../../../modules/email";
export const POST: APIRoute = async (ctx) => {
	const { type } = ctx.params;
	if (type !== "comment" && type !== "suggestion")
		return new Response("Not found", { status: 404 });
	const id = +(await ctx.request.text());
	const action = ctx.params.action;
	const contentTable = type === "suggestion" ? Suggestions : Comments;
	const queueTable = type === "suggestion" ? SuggestionQueue : CommentQueue;
	if (action === "reject") {
		const [[res]] = (await ctx.locals.db.batch([
			ctx.locals.db
				.select()
				.from(queueTable)
				.innerJoin(Users, and(eq(queueTable.author, Users.id))),
			ctx.locals.db.delete(queueTable).where(eq(queueTable.id, id)),
		])) as unknown as [
			{
				users: UsersSelect;
				suggestionQueue: SuggestionQueueSelect;
				commentQueue: SuggestionQueueSelect;
			}[],
		];
		if (res.users.moderationNotifications) {
			ctx.locals.runtime.ctx.waitUntil(
				sendEmail(
					{
						from: {
							email: "notifications@votepotomac.com",
							name: "Votepotomac Notifications",
						},
						personalizations: {
							to: [{ name: res.users.name, email: res.users.email }],
						},
						subject: `Your ${type} has been rejected`,
						content: [
							{
								type: "text/html",
								value: RejectionTemplate.replaceAll(
									"{{title}}",
									type === "suggestion"
										? res.suggestionQueue.title
										: res.commentQueue.description,
								),
							},
						],
					},
					ctx.locals.runtime.env,
				).then((res) =>
					res.success === false ? console.error(res.errors) : "",
				),
			);
		}
		return new Response(`Rejected ${type}`);
	} else if (action === "approve") {
		const [[res]] = (await ctx.locals.db.batch([
			ctx.locals.db
				.select()
				.from(queueTable)
				.innerJoin(Users, and(eq(queueTable.author, Users.id))),
			ctx.locals.db.run(
				sql`insert into ${contentTable} select * from ${queueTable} where ${queueTable.id} = ${id}`,
			),
			ctx.locals.db.delete(queueTable).where(eq(queueTable.id, id)),
		])) as unknown as [
			{
				users: UsersSelect;
				suggestionQueue: SuggestionQueueSelect;
				commentQueue: CommentQueueSelect;
			}[],
		];
		if (res.users.moderationNotifications) {
			ctx.locals.runtime.ctx.waitUntil(
				sendEmail(
					{
						from: {
							email: "notifications@votepotomac.com",
							name: "Votepotomac Notifications",
						},
						personalizations: {
							to: [{ name: res.users.name, email: res.users.email }],
						},
						subject: `Your ${type} has been approved!`,
						content: [
							{
								type: "text/html",
								value: ApprovalTemplate.replaceAll(
									"{{title}}",
									type === "suggestion"
										? res.suggestionQueue.title
										: res.commentQueue.description,
								).replaceAll(
									"{{suggestionURL}}",
									ctx.site +
										`suggestion/${
											type === "suggestion" ? id : res.commentQueue.parentId
										}`,
								),
							},
						],
					},
					ctx.locals.runtime.env,
				).then((res) =>
					res.success === false ? console.error(res.errors) : "",
				),
			);
		}
		if (type === "comment") {
			ctx.locals.runtime.ctx.waitUntil(
				(async () => {
					// could put in above batch, but that is kind of a pain
					const parentAuthor = await ctx.locals.db
						.select()
						.from(Users)
						.where(
							sql`${Users.id} IN ${ctx.locals.db
								.select({ id: Suggestions.author })
								.from(Suggestions)
								.where(eq(Suggestions.id, res.commentQueue.parentId))}`,
						)
						.get();
					if (!parentAuthor?.replyNotifications) return;
					const emailRes = await sendEmail(
						{
							from: {
								email: "notifications@votepotomac.com",
								name: "Votepotomac Notifications",
							},
							personalizations: {
								to: [{ name: parentAuthor.name, email: parentAuthor.email }],
							},
							subject: `Someone has replied to your suggestion`,
							content: [
								{
									type: "text/html",
									value: ReplyTemplate.replaceAll(
										"{{source}}",
										res.commentQueue.description,
									).replaceAll(
										"{{suggestionURL}}",
										ctx.site + `suggestion/${res.commentQueue.parentId}`,
									),
								},
							],
						},
						ctx.locals.runtime.env,
					);
					if (!emailRes.success) console.error(emailRes.errors);
				})(),
			);
		}
		return new Response(`Approved ${type}`);
	}
	return new Response("Invalid action", {
		status: 404,
	});
};
