import type { APIRoute } from "astro";
import { FoodLocation, Suggestions } from "../../../schemas/suggestion";
import snarkdown from "snarkdown";
import xss from "xss";
import { verifyJWT } from "../../../modules/auth";
import { ContentStatus } from "../../../types/SharedContent";
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
	const type: "food" | "suggestion" =
		(ctx.url.searchParams.get("type") as "food" | "suggestion") || "suggestion";
	const isLive = ctx.url.searchParams.has("live");
	let title = body.get("title");
	let description = body.get("description") as string | undefined;
	if (typeof title !== "string") {
		return new Response("Please provide a title", {
			status: 400,
		});
	}
	if (
		title.length < import.meta.env.PUBLIC_MIN_TITLE_LENGTH ||
		title.length > import.meta.env.PUBLIC_MAX_TITLE_LENGTH
	) {
		return new Response(
			`Please make the title between ${import.meta.env.PUBLIC_MIN_TITLE_LENGTH} and ${
				import.meta.env.PUBLIC_MAX_TITLE_LENGTH
			} characters`,
			{
				status: 400,
			},
		);
	}
	if (type === "suggestion") {
		if (typeof description !== "string") {
			return new Response("Please provide a description", {
				status: 400,
			});
		}
		if (
			description.length < import.meta.env.MIN_DESCRIPTION_LENGTH ||
			description.length > import.meta.env.MAX_DESCRIPTION_LENGTH
		) {
			return new Response(
				`Please make the description between ${
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
	}

	title = xss(title, {
		allowCommentTag: false,
		allowList: {},
		css: false,
		stripIgnoreTagBody: ["script", "style"],
	});
	const res = await ctx.locals.db
		.insert(Suggestions)
		.values({
			title,
			description: type === "suggestion" ? description : null,
			author: userId,
			votes: [userId],
			status:
				type === "food"
					? ContentStatus.FoodActive
					: ContentStatus.ModerationQueue,
			metadata:
				type === "food"
					? {
							locations: Object.keys(FoodLocation)
								.filter((v) => body.has(v))
								.map((v) => FoodLocation[v as keyof typeof FoodLocation]),
						}
					: null,
		})
		.returning({ id: Suggestions.id })
		.get();
	if (isLive) {
		return new Response(res.id.toString());
	}
	const expireDate = new Date();
	expireDate.setTime(expireDate.getTime() + 300000 /* 5 minutes */);
	ctx.cookies.set("notification", "SUGGESTION_CREATED", {
		httpOnly: true,
		secure: import.meta.env.PROD,
		expires: expireDate,
		path: "/",
	});
	return ctx.redirect(`/`);
};
