import type { APIRoute } from "astro";

export const GET: APIRoute = (ctx) => {
	ctx.cookies.delete("authData", {
		path: "/",
	});
	return ctx.redirect("/");
};
