import type { APIRoute } from "astro";
import { Suggestions } from "../../../../schemas/suggestion";
import { and, eq, sql } from "drizzle-orm";
import { Comments } from "../../../../schemas/comment";
import ApprovalTemplate from "../../../../email/approval.mjml";
import RejectionTemplate from "../../../../email/rejection.mjml";
import ReplyTemplate from "../../../../email/reply.mjml";
import { Users } from "../../../../schemas/user";
import { sendEmail } from "../../../../modules/email";
import { ContentStatus } from "../../../../types/SharedContent";
export const POST: APIRoute = async (ctx) => {
	const { type } = ctx.params;
	if (type !== "comment" && type !== "suggestion")
		return new Response("Not found", { status: 404 });
	const id = +(await ctx.request.text());
	const action = ctx.params.action;
	const contentTable = type === "suggestion" ? Suggestions : Comments;
	if (action === "reject") {
		const [[{ user, content }]] = await ctx.locals.db.batch([
			ctx.locals.db
				.select({ user: Users, content: contentTable })
				.from(Users)
				.innerJoin(
					contentTable,
					and(eq(contentTable.id, id), eq(Users.id, contentTable.author)),
				),

			ctx.locals.db.update(contentTable).set({ status: ContentStatus.Archive }),
		]);
		if (user.moderationNotifications) {
			ctx.locals.runtime.ctx.waitUntil(
				sendEmail(
					{
						to: user.email,
						subject: `Your ${type} has been rejected`,
						html: RejectionTemplate.replaceAll(
							"{{title}}",
							"parentId" in content ? content.description : content.title,
						),
					},
					ctx.locals.runtime.env,
				).then((res) => (res.error ? console.error(res.error) : "")),
			);
		}
		return new Response(`Rejected ${type}`);
	} else if (action === "approve") {
		const [[{ user, content }]] = await ctx.locals.db.batch([
			ctx.locals.db
				.select({ user: Users, content: contentTable })
				.from(Users)
				.innerJoin(
					contentTable,
					and(eq(contentTable.id, id), eq(Users.id, contentTable.author)),
				),

			ctx.locals.db.update(contentTable).set({ status: ContentStatus.Active }),
		]);
		if (user.moderationNotifications) {
			ctx.locals.runtime.ctx.waitUntil(
				sendEmail(
					{
						to: [user.email],
						subject: `Your ${type} has been approved!`,
						html: ApprovalTemplate.replaceAll(
							"{{title}}",
							"parentId" in content ? content.description : content.title,
						).replaceAll(
							"{{suggestionURL}}",
							ctx.site +
								`suggestion/${
									"parentId" in content ? content.parentId : content.id
								}`,
						),
					},
					ctx.locals.runtime.env,
				).then((res) => (res.error ? console.error(res.error) : "")),
			);
		}
		if ("parentId" in content) {
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
								.where(eq(Suggestions.id, content.parentId))}`,
						)
						.get();
					if (!parentAuthor?.replyNotifications) return;
					const emailRes = await sendEmail(
						{
							to: parentAuthor.email,
							subject: `Someone has replied to your suggestion`,
							html: ReplyTemplate.replaceAll(
								"{{source}}",
								content.description,
							).replaceAll(
								"{{suggestionURL}}",
								ctx.site + `suggestion/${content.parentId}`,
							),
						},
						ctx.locals.runtime.env,
					);
					if (emailRes.error) console.error(emailRes.error);
				})(),
			);
		}
		return new Response(`Approved ${type}`);
	}
	return new Response("Invalid action", {
		status: 404,
	});
};
