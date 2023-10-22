type DBClient = import("drizzle-orm/libsql").LibSQLDatabase;
type RawDBClient = import("@libsql/client").Client;
type Env = import("astro/client").ImportMetaEnv;
/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
		db: DBClient;
		rawdb: RawDBClient;
	}
}
interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly DATABASE_TOKEN?: string;
	readonly AUTH_SECRET: string;
	readonly AUTH_TRUST_HOST: boolean;
	readonly GITHUB_ID: string;
	readonly GITHUB_SECRET: string;
	readonly AKISMET_KEY: string;
	readonly CLOUDFLARE_ACCOUNT_ID: string;
	readonly DKIM_PRIVATE_KEY: string;
	readonly ANALYTICS_TOKEN: string;
	readonly MIN_TITLE_LENGTH: number;
	readonly MAX_TITLE_LENGTH: number;
	readonly MIN_DESCRIPTION_LENGTH: number;
	readonly MAX_DESCRIPTION_LENGTH: number;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
