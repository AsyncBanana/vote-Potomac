type DBClient = import("drizzle-orm/libsql").LibSQLDatabase;
type RawDBClient = import("@libsql/client").Client;
/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
		db: DBClient;
		rawdb: RawDBClient;
	}
}
