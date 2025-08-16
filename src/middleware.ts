import { generateOAuthURL, verifyJWT } from "./modules/auth";
import getDB from "./modules/db";
import { UserRole, Users } from "./schemas/user";
import { eq } from "drizzle-orm";
import type { Props as AppLayoutProps } from "./layouts/AppLayout.astro";
import { defineMiddleware, sequence } from "astro:middleware";
const localsInit = defineMiddleware((ctx, next) => {
	ctx.locals.runtime.env = { ...import.meta.env, ...ctx.locals.runtime.env };
	[ctx.locals.db, ctx.locals.rawdb] = getDB(ctx.locals.runtime.env);
	ctx.locals.login = (finalRedirectUrl?: string) => {
		const [redirectURL, state] = generateOAuthURL(
			ctx.url.origin + "/api/auth/callback",
			ctx.locals.runtime.env,
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
		const id = await verifyJWT(ctx.locals.runtime.env, authData);
		if (!id) return;
		return ctx.locals.db.select().from(Users).where(eq(Users.id, id)).get();
	};
	ctx.locals.handle = async (props) => {
		if (!props.minimumRole) props.minimumRole = UserRole.unauthenticated;
		if (props.userData === undefined) {
			props.userData = await ctx.locals.getSession();
		}
		if (props.minimumRole > UserRole.unauthenticated && !props.userData) {
			return { type: "error", data: ctx.locals.login(ctx.url.toString()) };
		}
		if (
			(props.userData?.role || UserRole.unauthenticated) < props.minimumRole
		) {
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
});
const logger = defineMiddleware(async (ctx, next) => {
	const response = await next();
	if (!(response.status > 199 && response.status < 400)) {
		const logResponse = response.clone();
		const body =
			logResponse.headers.get("Content-Type") === "text/html"
				? "HTML Text"
				: await logResponse.text();
		console.log({
			body,
			message: `Response returned error code ${logResponse.status} and body "${body}"`,
		});
	}
	return response;
});

export const onRequest = sequence(localsInit, logger);
