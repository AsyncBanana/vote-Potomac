import { generateOAuthURL, verifyJWT } from "./modules/auth";
import getDB from "./modules/db";
import type { MiddlewareResponseHandler } from "astro";
import { Users } from "./schemas/user";
import { eq } from "drizzle-orm";
import type { Props as AppLayoutProps } from "./layouts/AppLayout.astro";
import { decode } from "@tsndr/cloudflare-worker-jwt";
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
	// @ts-ignore
	ctx.locals.getSession = async () => {
		const authData = ctx.cookies.get("authData")?.value;
		if (!authData) return;
		const id = await verifyJWT(authData);
		if (!id) return;
		return ctx.locals.db.select().from(Users).where(eq(Users.id, id)).get();
	};
	ctx.locals.handle = async (props) => {
		if (!props.minimumRole) props.minimumRole = 0;
		if (props.userData === undefined) {
			props.userData = await ctx.locals.getSession();
		}
		if (props.minimumRole > 0 && !props.userData) {
			return { type: "error", data: ctx.locals.login(ctx.url.toString()) };
		}
		if ((props.userData?.role || 0) < props.minimumRole) {
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
