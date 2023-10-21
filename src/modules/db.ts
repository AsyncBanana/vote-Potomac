import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client as RawLibSQLDatabase } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
export default function getDB(): [LibSQLDatabase, RawLibSQLDatabase] {
	const client = createClient({
		url: import.meta.env.DATABASE_URL,
		authToken: import.meta.env.DATABASE_TOKEN,
	});
	return [drizzle(client), client];
}
