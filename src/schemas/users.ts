import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer } from "drizzle-orm/sqlite-core";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const enum UserRole {
	unauthenticated = 0,
	user = 1,
	admin = 10, // leave space for other roles in between
}
export const Users = sqliteTable("users", {
	id: text("id").primaryKey().notNull(),
	email: text("email").notNull(),
	role: integer("role").$type<UserRole>().default(UserRole.user).notNull(),
	picture: text("picture").notNull(),
	familyName: text("lastName").notNull(),
	givenName: text("firstName").notNull(),
	name: text("name").notNull(),
});
export type UsersSelect = InferSelectModel<typeof Users>;
export type UsersInsert = InferInsertModel<typeof Users>;
