import { decode, verify } from "@tsndr/cloudflare-worker-jwt";
export interface GoogleOauthToken {
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
	hd: string;
}
export interface JWT {
	iss?: string;
	sub: string;
	exp: number;
	iat: number;
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
export function generateOAuthURL(
	callbackURL: string,
	env: ImportMetaEnv,
): [URL, string] {
	const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	const state = crypto.randomUUID();
	url.search = new URLSearchParams({
		client_id: env.GOOGLE_OAUTH_ID,
		redirect_uri: callbackURL,
		response_type: "code",
		scope: "openid email profile",
		access_type: "online",
		state: state,
		hd: env.ORGANIZATION || "",
	}).toString();
	return [url, state];
}
export async function exchangeToken(
	code: string,
	callbackURL: string,
	env: ImportMetaEnv,
) {
	// probably shouldn't hardcode the url
	const res = await fetch(
		`https://oauth2.googleapis.com/token?${new URLSearchParams({
			client_id: env.GOOGLE_OAUTH_ID,
			client_secret: env.GOOGLE_OAUTH_SECRET,
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
export async function verifyJWT(
	env: ImportMetaEnv,
	token?: string,
): Promise<undefined | string> {
	if (!token) return;
	if (!(await verify(token, env.AUTH_SECRET))) {
		return;
	}
	const decodedToken = decode(token).payload as JWT;
	if (decodedToken.exp < Date.now() / 1000) {
		return;
	}
	return decodedToken.sub;
}
