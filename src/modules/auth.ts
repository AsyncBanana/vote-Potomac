import { decode, verify } from "@tsndr/cloudflare-worker-jwt";
import { nanoid } from "nanoid";
export interface OAuthToken {
	iss: "https://accounts.google.com" | "accounts.google.com";
	azp: string;
	aud: string;
	sub: string;
	email: string;
	email_verified: boolean;
	at_hash: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	locale: string;
	iat: number;
	exp: number;
}
interface TokenResponse {
	id_token: string;
	access_token: string;
	expires_in: number;
	token_type: "Bearer";
	scope: string;
}
interface TokenErrorResponse {
	error: string;
}
/*#__PURE__*/
export function generateOAuthURL(callbackURL: string): [URL, string] {
	const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	const state = nanoid(); // could also use crypto.generateRandomUUID
	url.search = new URLSearchParams({
		client_id: import.meta.env.GOOGLE_OAUTH_ID,
		redirect_uri: callbackURL,
		response_type: "code",
		scope: "openid email profile",
		access_type: "online",
		state: state,
	}).toString();
	return [url, state];
}
export async function exchangeToken(code: string, callbackURL: string) {
	// probably shouldn't hardcode the url
	const res = await fetch(
		`https://oauth2.googleapis.com/token?${new URLSearchParams({
			client_id: import.meta.env.GOOGLE_OAUTH_ID,
			client_secret: import.meta.env.GOOGLE_OAUTH_SECRET,
			code,
			redirect_uri: callbackURL,
			grant_type: "authorization_code",
		})}`,
		{ method: "POST" },
	);
	const json = (await res.json()) as TokenResponse | TokenErrorResponse;
	if ("error" in json) {
		throw new Error("Error exchanging token");
	}
	return json;
}
export async function verifyOAuthJWT(
	token: string,
): Promise<false | OAuthToken> {
	// https://developers.google.com/identity/openid-connect/openid-connect#validatinganidtoken
	// TODO add organization scoping? (see "hd" param)
	if (
		!(
			// add multi-key support to worker-jwt?
			(
				(await verify(
					token,
					{
						use: "sig",
						alg: "RS256",
						kty: "RSA",
						n: "keFudaSl4KpJ2xC-fIGOb4eD4hwmCVF3eWxginhvrcLNx3ygDjcN7wGRC-CkzJ12ymBGsTPnSBiTFTpwpa5LXEYi-wvN-RkwA8eptcFXIzCXn1k9TqFxaPfw5Qv8N2hj0ZnFR5KPMr1bgK8vktlBu_VbptXr9IKtUEpV0hQCMjmc0JAS61ZIgx9XhPWaRbuYUvmBVLN3ButKAoWqUuzdlP1arjC1R8bUWek3xKUuSSJmZ9oHIGU5omtTEgXRDiv442R3tle-gLcfcr57uPnaAh9bIgBJRZw2mjqP8uBZurq6YkuyUDFQb8NFkBxHigoEdE7di_OtEef2GFNLseE6mw",
						e: "AQAB",
					},
					{
						algorithm: "RS256",
					},
				)) ||
				(await verify(
					token,
					{
						kty: "RSA",
						e: "AQAB",
						alg: "RS256",
						use: "sig",
						n: "yrIpMnHYrVPwlbC-IY8aU2Q6QKnLf_p1FQXNiTO9mWFdeYXP4cNF6QKWgy4jbVSrOs-4qLZbKwRvZhfTuuKW6fwj5lVZcNsq5dd6GXR65I8kwomMH-Zv_pDt9zLiiJCp5_GU6Klb8zMY_jEE1fZp88HIk2ci4GrmtPTbw8LHAkn0P54sQQqmCtzqAWp8qkZ-GGNITxMIdQMY225kX7Dx91ruCb26jPCvF5uOrHT-I6rFU9fZbIgn4T9PthruubbUCutKIR-JK8B7djf61f8ETuKomaHVbCcxA-Q7xD0DEJzeRMqiPrlb9nJszZjmp_VsChoQQg-wl0jFP-1Rygsx9w",
					},
					{
						algorithm: "RS256",
					},
				))
			)
		)
	) {
		return false;
	}
	const decodedToken = decode(token).payload as OAuthToken;
	if (
		decodedToken.iss !== "accounts.google.com" &&
		decodedToken.iss !== "https://accounts.google.com"
	) {
		return false;
	}
	if (decodedToken.aud !== import.meta.env.GOOGLE_OAUTH_ID) {
		return false;
	}
	if (decodedToken.exp < Date.now() / 1000) {
		return false;
	}
	return decodedToken;
}
