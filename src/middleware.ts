import { generateOAuthURL } from "./modules/auth";
import getDB from "./modules/db";
import type { MiddlewareResponseHandler } from "astro";
export const onRequest: MiddlewareResponseHandler = (ctx, next) => {
	[ctx.locals.db, ctx.locals.rawdb] = getDB();
	ctx.locals.login = (finalRedirectUrl) => {
		const [redirectURL, state] = generateOAuthURL(
			ctx.url.origin + "/api/auth/callback",
		);
		ctx.cookies.set(`authState`, state, {
			secure: import.meta.env.PROD,
			httpOnly: true,
			sameSite: "lax",
			maxAge: 1200,
			path: "/api/auth/",
		});
		ctx.cookies.set(`authRedirectUrl`, finalRedirectUrl || "/", {
			secure: import.meta.env.PROD,
			httpOnly: true,
			sameSite: "lax",
			maxAge: 1200,
			path: "/api/auth/",
		});
		return ctx.redirect(redirectURL.toString());
	};
	return next();
};
