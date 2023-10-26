import type { APIRoute } from "astro";
import { verifyOAuthJWT } from "../../modules/auth";

export const POST: APIRoute = async (ctx) => {
	const authData = ctx.cookies.get("authData")?.value;
	const session = authData && (await verifyOAuthJWT(authData));
	if (!session) {
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
	const title = body.get("title");
	const description = body.get("description");
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
};
