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
};
