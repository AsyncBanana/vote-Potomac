import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client as RawLibSQLDatabase } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
export default function getDB(
	env: ImportMetaEnv,
): [LibSQLDatabase, RawLibSQLDatabase] {
	const client = createClient({
		url: env.DATABASE_URL,
		authToken: env.DATABASE_SECRET,
	});
	return [drizzle(client), client];
}
