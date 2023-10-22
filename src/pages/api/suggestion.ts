import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
	let body: FormData;
	try {
		body = await request.formData();
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
