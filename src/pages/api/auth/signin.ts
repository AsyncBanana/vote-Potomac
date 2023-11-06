import type { APIRoute } from "astro";

export const GET: APIRoute = (ctx) => {
	return ctx.locals.login(ctx.url.searchParams.get("redirectURL") || undefined);
};
