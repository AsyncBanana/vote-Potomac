import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
	const req = new Request(ctx.request);
	req.headers.delete("cookie");
	return await fetch("https://plausible.io/api/event", req);
};
