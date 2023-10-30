import type { APIRoute } from "astro";
import {
	exchangeToken,
	verifyOAuthJWT,
	type OAuthToken,
} from "../../../modules/auth";
import { decode } from "@tsndr/cloudflare-worker-jwt";
export const GET: APIRoute = async (ctx) => {
	const code = ctx.url.searchParams.get("code");
	if (!code) {
		console.log(ctx.url.searchParams.get("error"));
		return new Response("Error logging in", {
			status: 500,
		});
	}
	if (
		ctx.url.searchParams.get("state") !== ctx.cookies.get("authState")?.value
	) {
		return new Response("Invalid state", {
			status: 400,
		});
	}

	const res = await exchangeToken(code, ctx.url.origin + "/api/auth/callback");
	const token = decode(res.id_token).payload as OAuthToken;
	const decodedToken = await verifyOAuthJWT(res.id_token);
	if (!decodedToken) {
		return new Response("Invalid JWT", {
			status: 400,
		});
	}
	ctx.cookies.set("authData", res.id_token, {
		path: "/",
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: new Date(decodedToken.exp * 1000),
	});
	return ctx.redirect(ctx.cookies.get("authRedirectUrl")?.value || "/");
};
