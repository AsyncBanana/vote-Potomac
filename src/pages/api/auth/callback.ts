import type { APIRoute } from "astro";
import {
	exchangeToken,
	type GoogleOauthToken,
	type JWT,
} from "../../../modules/auth";
import { Users } from "../../../schemas/user";
import { decode, sign } from "@tsndr/cloudflare-worker-jwt";
export const GET: APIRoute = async (ctx) => {
	const code = ctx.url.searchParams.get("code");
	if (!code) {
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
	const token = decode(res.id_token).payload as GoogleOauthToken;
	if (!token)
		return new Response("Invalid JWT", {
			status: 400,
		});
	if (!token.email_verified)
		return new Response("Please verify your email", {
			status: 403,
		});
	if (import.meta.env.ORGANIZATION && token.hd !== import.meta.env.ORGANIZATION)
		return new Response(
			`Invalid organization; Please sign in with a ${
				import.meta.env.ORGANIZATION
			} account`,
			{
				status: 403,
			},
		);
	const user = await ctx.locals.db
		.insert(Users)
		.values({
			email: token.email,
			id: token.sub,
			picture: token.picture,
			familyName: token.family_name,
			givenName: token.given_name,
			name: token.name,
		})
		.onConflictDoUpdate({
			target: Users.id,
			set: {
				email: token.email,
				picture: token.picture,
				familyName: token.family_name,
				givenName: token.given_name,
				name: token.name,
			},
		})
		.returning()
		.get();
	const jwt = await sign(
		{
			iss: ctx.site?.toString(),
			iat: Math.floor(Date.now() / 1000),
			sub: user.id,
			exp: token.exp,
		} satisfies JWT,
		import.meta.env.AUTH_SECRET,
	);
	ctx.cookies.set("authData", jwt, {
		path: "/",
		httpOnly: true,
		secure: import.meta.env.PROD,
		sameSite: "lax",
		expires: new Date(token.exp * 1000),
	});
	return ctx.redirect(ctx.cookies.get("authRedirectUrl")?.value || "/");
};
