import { integer } from "drizzle-orm/sqlite-core";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const enum UserRole {
	unauthenticated = 0,
	user = 1,
	admin = 10, // leave space for other roles in between
}
// Full storage of user data currently unecessary (emails are used as ids); Could change in future
export const users = sqliteTable("users", {
	email: text("emal").primaryKey().notNull(),
	role: integer("role").$type<UserRole>().default(UserRole.user),
});
