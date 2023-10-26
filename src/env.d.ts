type DBClient = import("drizzle-orm/libsql").LibSQLDatabase;
type RawDBClient = import("@libsql/client").Client;
type Env = import("astro/client").ImportMetaEnv;
type OAuthToken = import("./modules/auth").OAuthToken;
/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
		db: DBClient;
		rawdb: RawDBClient;
		login: (redirectUrl?: string) => Response;
		getSession: () => Promise<OAuthToken | Response>;
	}
}
interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly DATABASE_TOKEN?: string;
	readonly AUTH_SECRET: string;
	readonly CLOUDFLARE_ACCOUNT_ID: string;
	readonly MIN_TITLE_LENGTH: number;
	readonly MAX_TITLE_LENGTH: number;
	readonly MIN_DESCRIPTION_LENGTH: number;
	readonly MAX_DESCRIPTION_LENGTH: number;
	readonly GOOGLE_OAUTH_ID: string;
	readonly GOOGLE_OAUTH_SECRET: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
