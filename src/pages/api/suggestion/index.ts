import type { APIRoute } from "astro";
import { SuggestionQueue } from "../../../schemas/suggestion";
import snarkdown from "snarkdown";
import xss from "xss";
import { verifyJWT } from "../../../modules/auth";
import { eq } from "drizzle-orm";
export const POST: APIRoute = async (ctx) => {
	const authData = ctx.cookies.get("authData")?.value;
	const userId = authData && (await verifyJWT(authData));
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
	let title = body.get("title");
	let description = body.get("description");
	if (typeof title !== "string" || typeof description !== "string") {
		return new Response("Please provide a title and description", {
			status: 400,
		});
	}
	if (
		title.length < import.meta.env.MIN_TITLE_LENGTH ||
		title.length > import.meta.env.MAX_TITLE_LENGTH ||
		description.length < import.meta.env.MIN_DESCRIPTION_LENGTH ||
		description.length > import.meta.env.MAX_DESCRIPTION_LENGTH
	) {
		return new Response(
			`Please make the title between ${import.meta.env.MIN_TITLE_LENGTH} and ${
				import.meta.env.MAX_TITLE_LENGTH
			} characters and the description between ${
				import.meta.env.MIN_DESCRIPTION_LENGTH
			} and ${import.meta.env.MAX_DESCRIPTION_LENGTH} characters`,
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
			strike: [],
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
	title = xss(title, {
		allowCommentTag: false,
		allowList: {},
		css: false,
		stripIgnoreTagBody: ["script", "style"],
	});
	const res = await ctx.locals.db
		.insert(SuggestionQueue)
		.values({
			title,
			description,
			author: userId,
		})
		.run();
	return ctx.redirect("/");
};
