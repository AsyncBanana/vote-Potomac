import { generateOAuthURL, verifyOAuthJWT } from "./modules/auth";
import getDB from "./modules/db";
import type { MiddlewareResponseHandler } from "astro";
import { users } from "./schemas/users";
import { eq } from "drizzle-orm";
import type { Props as AppLayoutProps } from "./layouts/AppLayout.astro";
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
	ctx.locals.handle = async (props) => {
		if (!props.minimumRole) props.minimumRole = 0;
		if (props.userData === undefined) {
			const authData = ctx.cookies.get("authData")?.value;
			if (authData)
				props.userData = (await verifyOAuthJWT(authData)) || undefined;
		}
		if (props.minimumRole > 0 && !props.userData) {
			return { type: "error", data: ctx.locals.login(ctx.url.toString()) };
		}
		if (props.userRole === undefined && props.userData) {
			props.userRole =
				(
					await ctx.locals.db
						.select()
						.from(users)
						.where(eq(users.email, props.userData.email))
						.get()
				)?.role || 1;
		} else {
			props.userRole = 0;
		}
		if (props.userRole < props.minimumRole) {
			return {
				type: "error",
				data: new Response("You lack the permissions to access this page", {
					status: 403,
				}),
			};
		}
		return {
			type: "data",
			data: props as AppLayoutProps,
		};
	};
	return next();
};
