/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
		db: import("drizzle-orm/libsql").LibSQLDatabase;
		rawdb: import("@libsql/client").Client;
		login: (redirectUrl?: string) => Response;
		handle: (
			props: Partial<import("./layouts/AppLayout.astro").Props>,
		) => Promise<
			| {
					type: "error";
					data: Response;
			  }
			| {
					type: "data";
					data: import("./layouts/AppLayout.astro").Props;
			  }
		>;
		getSession: (
			req: Request,
		) => import("drizzle-orm/sqlite-core").SQLiteSelectQueryBuilder;
	}
}
interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly DATABASE_TOKEN?: string;
	readonly CLOUDFLARE_ACCOUNT_ID: string;
	readonly MIN_TITLE_LENGTH: number;
	readonly MAX_TITLE_LENGTH: number;
	readonly MIN_DESCRIPTION_LENGTH: number;
	readonly MAX_DESCRIPTION_LENGTH: number;
	readonly GOOGLE_OAUTH_ID: string;
	readonly GOOGLE_OAUTH_SECRET: string;
	readonly AUTH_SECRET: string | { alg: "HS256"; kty: string; k: string };
}

interface ImportMeta {
	readonly env: import("astro/client").ImportMetaEnv;
}
