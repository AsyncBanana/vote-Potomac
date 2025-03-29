import type { APIRoute } from "astro";
import { CommentQueue } from "../../../schemas/comment";
import snarkdown from "snarkdown";
import xss from "xss";
import { verifyJWT } from "../../../modules/auth";
export const POST: APIRoute = async (ctx) => {
	const authData = ctx.cookies.get("authData")?.value;
	const userId =
		authData && (await verifyJWT(ctx.locals.runtime.env, authData));
	if (!userId) {
		return new Response("Not signed in", {
			status: 401,
		});
	}
	let body: FormData;
	try {
		body = await ctx.request.formData();
	} catch {
		return new Response("Invalid request body", {
			status: 400,
		});
	}
	let parentId = body.get("parentId");
	let description = body.get("description");
	if (
		typeof parentId !== "string" ||
		Number.isNaN(+parentId) ||
		typeof description !== "string"
	) {
		return new Response("Please provide a valid parentId and description", {
			status: 400,
		});
	}
	if (
		description.length < import.meta.env.MIN_COMMENT_LENGTH ||
		description.length > import.meta.env.MAX_COMMENT_LENGTH
	) {
		return new Response(
			`Please make the comment between ${
				import.meta.env.MIN_COMMENT_LENGTH
			} and ${import.meta.env.MAX_COMMENT_LENGTH} characters`,
			{
				status: 400,
			},
		);
	}
	description = snarkdown(description);
	// optimize using HTMLRewriter?
	description = xss(description, {
		allowCommentTag: false,
		allowList: {
			header: [],
			code: ["class"],
			pre: [],
			blockquote: [],
			a: ["href"],
			s: [],
			strong: [],
			img: ["src", "alt", "title"],
			u: [],
			br: [],
			em: [],
			ul: [],
			li: [],
			ol: [],
		},
		css: false,
		stripIgnoreTagBody: ["script", "style"],
	});
	parentId = xss(parentId, {
		allowCommentTag: false,
		allowList: {},
		css: false,
		stripIgnoreTagBody: ["script", "style"],
	});
	const res = await ctx.locals.db
		.insert(CommentQueue)
		.values({
			description,
			author: userId,
			parentId: +parentId,
			votes: [userId],
		})
		.run();
	const expireDate = new Date();
	expireDate.setTime(expireDate.getTime() + 300000 /* 5 minutes */);
	return ctx.redirect(`/`);
};
